import { createHash } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';

import type { Color, ImageAnalystOutput, MoodboardView } from '@filmzy/contracts';
import { projectsDir, type MoodboardStore, type SheetStore } from '@filmzy/db';
import { MediaError, dominantColors } from '@filmzy/media';
import { LocalAssetStore, type Troupe } from '@filmzy/troupe';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { registerAssets } from '../media/image-jobs.js';
import { PREFERENCES_STORE } from '../preferences/tokens.js';
import { ProjectsService } from '../projects/projects.service.js';
import { TROUPE } from '../troupe/tokens.js';
import { readImageBody } from '../uploads/image-body.js';
import { imageProblems } from '../uploads/image-checks.js';
import { imageForReading } from '../uploads/image-for-reading.js';
import { MoodboardService } from './moodboard.service.js';
import { MOODBOARD_STORE } from './tokens.js';

/** Quanti colori dominanti si calcolano di ogni immagine. */
const COLORS_PER_IMAGE = 4;

/** Cosa si scrive di un'immagine caricata senza controllo: nessuno l'ha letta. */
const UNREAD_DESCRIPTION = 'Immagine caricata dall’utente';

/**
 * Le immagini che l'utente carica nel moodboard (T4.10, D37, D38). Come le foto di luoghi e oggetti
 * (T4.8) passano dall'analista di immagini **prima** di essere salvate, ma con una regola diversa per
 * le persone: un'immagine con persone **entra solo per l'analisi** (descrizione, atmosfera, colori) e
 * non si può scegliere per un'inquadratura né andare a un modello di generazione; marchi, personaggi noti,
 * minori e contenuti non adatti si rifiutano con `image_rejected`. I colori li calcola il codice
 * (esatti e gratis). Se il controllo non risponde l'immagine non passa (regola 6). Con la prudenza
 * spenta si salva con una descrizione generica e nessuna lettura.
 */
@Injectable()
export class MoodboardUploadService {
  private readonly log = new Logger('Moodboard');

  constructor(
    @Inject(MOODBOARD_STORE) private readonly store: MoodboardStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(TROUPE) private readonly troupe: Pick<Troupe, 'run'>,
    @Inject(PREFERENCES_STORE) private readonly preferences: { get: () => { imageCheck: boolean } },
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly projects: ProjectsService,
    private readonly moodboard: MoodboardService,
  ) {}

  async add(projectId: string, sceneId: string | undefined, body: unknown): Promise<MoodboardView> {
    const project = this.projects.get(projectId);
    await this.moodboard.assertEnabled();
    if (
      sceneId !== undefined &&
      !this.moodboard.scenes(projectId).some((scene) => scene.sceneId === sceneId)
    ) {
      throw domainError(400, 'invalid_request', { details: { field: 'sceneId' } });
    }

    const { bytes, contentType } = readImageBody(body);
    const assetId = createHash('sha256').update(bytes).digest('hex');

    // La stessa immagine nella stessa parte non si ripete né si paga di nuovo.
    const current = this.store.get(projectId);
    const part =
      sceneId === undefined
        ? current.film
        : current.scenes.find((scene) => scene.sceneId === sceneId);
    if (part?.references.some((reference) => reference.assetId === assetId) === true) {
      return this.moodboard.view(projectId);
    }

    const verdict = this.preferences.get().imageCheck
      ? await this.analyse(projectId, project.language, assetId, contentType, bytes)
      : undefined;

    const existed = this.files.getAsset(assetId) !== undefined;
    const stored = await new LocalAssetStore(
      path.join(projectsDir(this.dataDir), projectId, 'moodboard'),
    ).put({ fileName: assetId, contentType, bytes });
    try {
      registerAssets(this.files, { dataDir: this.dataDir, projectId }, [stored]);
      this.store.addReference(projectId, sceneId, {
        assetId: stored.assetId,
        origin: 'uploaded',
        // Con persone entra solo per l'analisi (D38); senza lettura non si sa, e vale la scelta dell'utente.
        analysisOnly: verdict?.containsPeople === true,
        description: verdict === undefined ? UNREAD_DESCRIPTION : describe(verdict),
        moodTags: verdict?.moodTags ?? [],
        palette: await this.colorsOf(stored.path),
      });
    } catch (error) {
      // Senza il suo riferimento il file non serve a nessuno: non resta sul disco (se era già di altri, sì).
      if (!existed) await rm(stored.path, { force: true });
      throw error;
    }
    return this.moodboard.view(projectId);
  }

  /** Fa guardare l'immagine all'analista; marchi, personaggi noti, minori e contenuti non adatti la rifiutano. */
  private async analyse(
    projectId: string,
    language: string,
    assetId: string,
    contentType: string,
    bytes: Buffer,
  ): Promise<ImageAnalystOutput> {
    const image = await imageForReading({ dataDir: this.dataDir, projectId, contentType, bytes });
    const { data } = await this.troupe.run(
      'image_analyst',
      { image: { assetId }, purpose: 'moodboard', context: null, language },
      { purpose: 'product', projectId },
      [image],
    );

    // Le persone non rifiutano: per il moodboard entrano solo per l'analisi.
    const problems = imageProblems({ containsPeople: false, flags: data.flags });
    if (problems.length > 0) {
      throw domainError(422, 'image_rejected', { details: { imageProblems: problems } });
    }
    return data;
  }

  /** I colori dominanti; se l'immagine non si legge si va avanti senza: i colori si possono rifare. */
  private async colorsOf(file: string): Promise<Color[]> {
    try {
      const hexes = await dominantColors({ input: file, count: COLORS_PER_IMAGE });
      return hexes.map((hex, index) => ({ hex, use: index === 0 ? 'dominante' : 'accento' }));
    } catch (error) {
      if (error instanceof MediaError) {
        this.log.warn(`Colori dell'immagine non letti: ${error.code}.`);
        return [];
      }
      throw error;
    }
  }
}

/** Cosa si vede, la luce e la composizione, in una descrizione sola per i ruoli che la leggeranno. */
function describe(verdict: ImageAnalystOutput): string {
  return [
    verdict.description,
    `Light: ${verdict.lighting}`,
    `Composition: ${verdict.composition}`,
  ].join('. ');
}

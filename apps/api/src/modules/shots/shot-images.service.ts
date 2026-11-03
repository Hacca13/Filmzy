import {
  type ImageCandidate,
  type SetShotImagesBody,
  type ShotImages,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';
import {
  projectsDir,
  type SheetStore,
  type ShotStore,
  type StoredShot,
  type TakeStore,
  type UploadStore,
} from '@filmzy/db';
import { extractFrame, videoDurationS } from '@filmzy/media';
import type { Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';

import { domainError } from '../../http/domain-error.js';
import { BibleService } from '../bible/bible.service.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { mediaStep } from '../media/media-step.js';
import { assetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { TROUPE } from '../troupe/tokens.js';
import { shotOf } from './shot-access.js';
import { imagesFromChoices } from './shot-images.js';
import { videoStandInRequest } from './video-inputs.js';
import { UPLOAD_STORE } from '../uploads/tokens.js';
import { SHOT_STORE, TAKE_STORE } from './tokens.js';

/**
 * «Imposta le immagini» (T4.2, D20): per ogni inquadratura l'utente sceglie quali immagini fanno da
 * ispirazione, da primo fotogramma («da qui parte») e da ultimo («qui finisce»). Il ruolo è un
 * requisito per il servizio che girerà il video, non un suggerimento: per questo, a ogni scelta, il
 * server dice **quanti servizi video attivati accettano la combinazione**. Con zero il video non
 * partirebbe e lo si sa subito, prima di spendere; la combinazione non si cambia da sola in «solo
 * ispirazione» (regola D20).
 *
 * Per ora le immagini sono quelle generate per quell'inquadratura (storyboard e ultimo fotogramma):
 * le persone le crea Filmzy (D19).
 */
@Injectable()
export class ShotImagesService {
  constructor(
    @Inject(SHOT_STORE) private readonly store: ShotStore,
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
    @Inject(UPLOAD_STORE) private readonly uploads: UploadStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
    @Inject(TROUPE) private readonly troupe: Troupe,
    private readonly projects: ProjectsService,
    private readonly bible: BibleService,
  ) {}

  async get(projectId: string, shotId: string): Promise<ShotImages> {
    const { stored } = this.target(projectId, shotId);
    return this.view(projectId, shotId, stored.spec);
  }

  /** Sostituisce le immagini impostate (vuoto = decide l'aiuto regista) e dice se il video potrà partire. */
  async set(projectId: string, shotId: string, body: SetShotImagesBody): Promise<ShotImages> {
    const { stored } = this.target(projectId, shotId);
    const candidates = new Map(
      this.candidates(projectId, shotId).map(
        (candidate) => [candidate.assetId, candidate] as const,
      ),
    );
    const spec: ShotSpec = {
      ...stored.spec,
      images: imagesFromChoices(body.images, candidates),
    };

    // Si legge e si scrive di seguito, senza attese in mezzo: se il piano della scena è stato rifatto
    // nel frattempo l'inquadratura non c'è più e lo si dice invece di far finta di salvare.
    if (!this.store.updateSpec(shotId, spec)) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    return this.view(projectId, shotId, spec);
  }

  /**
   * «Usa questo fotogramma come punto di partenza» (T4.6, D21): ffmpeg salva il fotogramma del take al
   * momento dato, l'immagine entra nella cartella del film come ogni altra e diventa il **primo
   * fotogramma** dell'inquadratura al posto di quello di prima. Serve a chi ha un video quasi giusto e
   * vuole ripartire da lì invece che da zero. Il file si controlla prima di leggerlo (deve stare nella
   * cartella dei dati) e il momento si confronta con la durata vera del video.
   */
  async useTakeFrame(
    projectId: string,
    shotId: string,
    takeId: string,
    atS: number,
  ): Promise<ShotImages> {
    this.target(projectId, shotId);
    const found = this.takes.get(takeId);
    const clip = found?.take.assetId;
    if (found?.shotId !== shotId || found.take.status !== 'succeeded' || clip === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'takeId' } });
    }
    const video = assetFile(this.files, this.dataDir, clip);
    if (video === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'takeId' } });
    }

    const moment = await this.momentIn(video.file, atS);
    const frame = await this.saveFrame(projectId, video.file, moment);

    // ffmpeg ha richiesto del tempo: la scheda si rilegge adesso, così non si perde una modifica
    // fatta nel frattempo (e se il piano è stato rifatto non resta un fotogramma senza inquadratura).
    const { stored } = this.target(projectId, shotId);
    // Lo stesso momento due volte dà lo stesso file: tra le immagini scelte compare una volta sola.
    const saved =
      this.takes.frames(shotId).find((old) => old.takeId === takeId && old.assetId === frame.id) ??
      this.takes.addFrame({ shotId, takeId, atS: moment, assetId: frame.id });

    // Il fotogramma prende il ruolo di primo fotogramma; una stessa immagine non sta in due ruoli.
    const spec: ShotSpec = {
      ...stored.spec,
      images: [
        ...stored.spec.images.filter(
          (image) => image.use !== 'first_frame' && image.assetId !== saved.assetId,
        ),
        { use: 'first_frame', from: 'take_frame', assetId: saved.assetId, takeId, atS: moment },
      ],
    };
    if (!this.store.updateSpec(shotId, spec)) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    return this.view(projectId, shotId, spec);
  }

  /**
   * Il momento chiesto, portato dentro il video: oltre la fine non c'è niente da prendere. Chi mette
   * in pausa sull'ultimo istante manda un tempo che può superare di un soffio la durata che ffmpeg
   * legge (la scrive al centesimo): quel poco si porta alla fine, non si rifiuta. Se il video non dice
   * la durata si prova lo stesso, e se non c'è nessun fotogramma lo dice ffmpeg (`no_frame`).
   */
  private async momentIn(video: string, atS: number): Promise<number> {
    const duration = await mediaStep(() => videoDurationS(video));
    if (duration === undefined) return atS;
    if (atS > duration + DURATION_TOLERANCE_S) {
      throw domainError(409, 'invalid_request', { details: { field: 'atS' } });
    }
    // L'ultimo istante a volte non ha un fotogramma intero: si resta un soffio prima.
    return Math.min(atS, Math.max(0, duration - LAST_MOMENT_MARGIN_S));
  }

  /**
   * Estrae il fotogramma e lo registra come immagine del film. Il file si chiama come il suo contenuto
   * (come ogni file dei fornitori): lo stesso fotogramma due volte è lo stesso file (regola d'oro 10).
   */
  private async saveFrame(projectId: string, video: string, atS: number): Promise<{ id: string }> {
    const dir = path.join(projectsDir(this.dataDir), projectId, 'take');
    await mkdir(dir, { recursive: true });
    const temporary = path.join(dir, `fotogramma-${randomUUID()}.png`);

    try {
      await mediaStep(() => extractFrame({ input: video, atS, output: temporary }));
      const bytes = await readFile(temporary);
      const id = createHash('sha256').update(bytes).digest('hex');
      const target = path.join(dir, `${id}.png`);
      await rename(temporary, target);

      // Un file già registrato (lo stesso momento di prima) non si tocca, nemmeno se il resto va storto.
      if (this.files.getAsset(id) === undefined) {
        try {
          this.files.registerAsset({
            id,
            path: path.relative(this.dataDir, target).replaceAll('\\', '/'),
            contentType: 'image/png',
            bytes: bytes.length,
            projectId,
          });
        } catch (error) {
          // Senza il suo record il file non serve a nessuno: non resta sul disco.
          await rm(target, { force: true });
          throw error;
        }
      }
      return { id };
    } finally {
      // Se qualcosa è andato storto a metà il file provvisorio non resta: dopo `rename` non c'è più.
      await rm(temporary, { force: true });
    }
  }

  private async view(projectId: string, shotId: string, spec: ShotSpec): Promise<ShotImages> {
    const bible = await this.bible.assemble(projectId);
    return {
      shotId,
      images: spec.images,
      candidates: this.candidates(projectId, shotId),
      videoServices: await this.videoServices(spec, bible),
    };
  }

  /**
   * Le varianti riuscite dello storyboard e dell'ultimo fotogramma, dalla più recente, i fotogrammi
   * presi dai take dell'inquadratura (T4.6) e le foto che l'utente ha caricato per il film (T4.8).
   */
  private candidates(projectId: string, shotId: string): ImageCandidate[] {
    const frames: ImageCandidate[] = this.takes.frames(shotId).map((frame) => ({
      assetId: frame.assetId,
      mode: 'take_frame',
      takeId: frame.takeId,
      atS: frame.atS,
    }));
    const uploaded: ImageCandidate[] = this.uploads
      .list(projectId)
      .map((upload) => ({ assetId: upload.assetId, mode: 'upload' }));
    return [...this.drawn(shotId), ...frames, ...uploaded];
  }

  private drawn(shotId: string): ImageCandidate[] {
    return (['storyboard', 'end_frame'] as const).flatMap((mode) =>
      this.store
        .storyboard(shotId, mode)
        .attempts.filter((attempt) => attempt.status === 'succeeded')
        .flatMap((attempt) =>
          attempt.assetIds.map((assetId) => ({ assetId, mode, attempt: attempt.attempt })),
        ),
    );
  }

  /**
   * Quanti servizi video attivati accetterebbero le immagini impostate (nessuna chiamata a
   * pagamento: è la scelta dell'elenco). Le immagini che il video riceve le dice `videoImages`.
   */
  private async videoServices(spec: ShotSpec, bible: StoryBible): Promise<number> {
    const options = await this.troupe.options('camera_operator', videoStandInRequest(spec, bible));
    return options.length;
  }

  private target(projectId: string, shotId: string): { stored: StoredShot } {
    this.projects.get(projectId);
    return { stored: shotOf(this.store, projectId, shotId) };
  }
}

/**
 * Quanto si resta prima della fine del video quando si chiede proprio l'ultimo istante (s): più di un
 * fotogramma anche a 10 al secondo, perché l'ultimo fotogramma intero comincia prima della durata.
 */
const LAST_MOMENT_MARGIN_S = 0.15;

/** Di quanto un momento può superare la durata di ffmpeg senza essere «oltre la fine» (s): il lettore e ffmpeg arrotondano diversamente. */
const DURATION_TOLERANCE_S = 0.5;

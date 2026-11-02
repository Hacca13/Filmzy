import {
  type ImageCandidate,
  type SetShotImagesBody,
  type ShotImages,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';
import type { ShotStore, StoredShot } from '@filmzy/db';
import type { Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { BibleService } from '../bible/bible.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { TROUPE } from '../troupe/tokens.js';
import { shotOf } from './shot-access.js';
import { imagesFromChoices } from './shot-images.js';
import { videoStandInRequest } from './video-inputs.js';
import { SHOT_STORE } from './tokens.js';

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
    const candidates = new Set(this.candidates(shotId).map((candidate) => candidate.assetId));
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

  private async view(projectId: string, shotId: string, spec: ShotSpec): Promise<ShotImages> {
    const bible = await this.bible.assemble(projectId);
    return {
      shotId,
      images: spec.images,
      candidates: this.candidates(shotId),
      videoServices: await this.videoServices(spec, bible),
    };
  }

  /** Le varianti riuscite dello storyboard e dell'ultimo fotogramma, dalla più recente. */
  private candidates(shotId: string): ImageCandidate[] {
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

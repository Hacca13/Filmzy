import type { MoodboardScene, MoodboardView, SaveMoodboardPartBody } from '@filmzy/contracts';
import type { MoodboardStore, ScreenplayStore } from '@filmzy/db';
import type { ConfigSource } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SCREENPLAY_STORE } from '../screenplay/tokens.js';
import { sceneIdOf } from '../shots/plan-shots.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';
import { MOODBOARD_STORE } from './tokens.js';

/**
 * Il moodboard del film (T4.10, D37): facoltativo ma consigliato. Qui l'utente lo vede e lo corregge
 * a mano — palette e consigli, per tutto il film o per una scena. Senza moodboard il film funziona
 * come prima. La funzione `moodboard` spenta lo nasconde e rifiuta le modifiche.
 */
@Injectable()
export class MoodboardService {
  constructor(
    @Inject(MOODBOARD_STORE) private readonly store: MoodboardStore,
    @Inject(SCREENPLAY_STORE) private readonly screenplays: ScreenplayStore,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly projects: ProjectsService,
  ) {}

  async view(projectId: string): Promise<MoodboardView> {
    this.projects.get(projectId);
    const run = this.store.latestRun(projectId);
    return {
      enabled: await this.isEnabled(),
      moodboard: this.store.get(projectId),
      scenes: this.scenes(projectId),
      ...(run === undefined ? {} : { run }),
    };
  }

  /** Salva palette e consigli del film o di una scena. */
  async savePart(projectId: string, body: SaveMoodboardPartBody): Promise<MoodboardView> {
    this.projects.get(projectId);
    await this.assertEnabled();
    if (
      body.sceneId !== undefined &&
      !this.scenes(projectId).some((scene) => scene.sceneId === body.sceneId)
    ) {
      throw domainError(400, 'invalid_request', { details: { field: 'sceneId' } });
    }

    this.store.saveText(projectId, body.sceneId, {
      palette: body.palette,
      notes: body.notes.trim(),
    });
    return this.view(projectId);
  }

  /** Toglie un'immagine di riferimento; il file resta nella cartella del film. */
  async removeReference(projectId: string, referenceId: string): Promise<MoodboardView> {
    this.projects.get(projectId);
    if (!this.store.removeReference(projectId, referenceId)) {
      throw domainError(404, 'not_found', { details: { field: 'referenceId' } });
    }
    return this.view(projectId);
  }

  async isEnabled(): Promise<boolean> {
    const loaded = await this.configSource.load();
    return loaded.config?.features.moodboard === true;
  }

  async assertEnabled(): Promise<void> {
    if (!(await this.isEnabled())) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
  }

  /** Le scene dell'ultima stesura (ufficiale, altrimenti la bozza): quelle di cui si può parlare nel moodboard. */
  scenes(projectId: string): MoodboardScene[] {
    const latest =
      this.screenplays.latest(projectId, 'final') ?? this.screenplays.latest(projectId, 'draft');
    return (latest?.screenplay.scenes ?? []).map((scene) => ({
      sceneId: sceneIdOf(scene.number),
      number: scene.number,
      heading: scene.heading,
    }));
  }
}

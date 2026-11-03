import path from 'node:path';

import {
  takeJobPayloadSchema,
  type ModelOption,
  type SheetOptions,
  type ShotSpec,
  type ShotTake,
  type ShotTakes,
  type StartSheetBody,
  type StoryBible,
  type TakeJobPayload,
} from '@filmzy/contracts';
import {
  projectsDir,
  type SheetStore,
  type ShotStore,
  type StoredShot,
  type TakeStore,
} from '@filmzy/db';
import {
  ProviderError,
  type ConfigSource,
  type MediaInput,
  type MediaRunner,
  type SpendGuard,
  type Troupe,
  type TroupeConfig,
} from '@filmzy/troupe';
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { BibleService } from '../bible/bible.service.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import {
  VIDEO_WAIT,
  chooseMediaService,
  registerAssets,
  waitForMedia,
} from '../media/image-jobs.js';
import { readIdentity, referenceInput } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { assertPlanCurrent, shotOf } from './shot-access.js';
import { cinematographerInputFor, familyOf } from './storyboard-input.js';
import { SHOT_STORE, TAKE_STORE } from './tokens.js';
import { STALE_WORK_MS } from './work.js';
import { videoImages, videoStandInRequest, videoTarget, type VideoImages } from './video-inputs.js';

const ROLE = 'camera_operator';

/** Il tipo di lavoro in coda che gira un take video. */
export const TAKE_JOB_KIND = 'take_generate';

/** I file che il video riceve, già letti, e i personaggi che hanno un riferimento. */
interface VideoFiles {
  inputs: MediaInput[];
  characterIds: string[];
}

/**
 * I take video di un'inquadratura (T4.3, D65, architettura §7): «Genera» mette in coda un lavoro che
 * fa due chiamate di seguito, come lo storyboard: il direttore della fotografia scrive il prompt per
 * la famiglia del servizio, poi `camera_operator` gira la clip con le immagini dell'inquadratura
 * (T4.2). Il servizio che l'utente sceglie è un requisito (D36): se non è adatto, `no_eligible_model`
 * prima di spendere, mai un altro servizio in silenzio; se la chiamata fallisce lo dice il take, con
 * il suo codice, e decide l'utente. Ogni take dice con quale servizio è stato fatto e il costo reale.
 *
 * Stima e limiti di spesa si controllano **prima** di mettere in coda; la clip si copia subito nella
 * cartella del film (regola 11); un lavoro ripetuto su un take già chiuso non rifà niente (regola 10).
 */
@Injectable()
export class TakesService implements OnModuleInit {
  private readonly log = new Logger('Take');

  constructor(
    @Inject(SHOT_STORE) private readonly store: ShotStore,
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly bible: BibleService,
    private readonly screenplays: ScreenplayService,
  ) {}

  onModuleInit(): void {
    this.runner.register(TAKE_JOB_KIND, (job) => this.makeTake(job.payload));
  }

  list(projectId: string, shotId: string): ShotTakes {
    this.target(projectId, shotId);
    return { shotId, takes: this.currentTakes(shotId) };
  }

  /** I take dell'inquadratura, dopo aver chiuso come falliti quelli rimasti a metà da troppo tempo. */
  private currentTakes(shotId: string): ShotTake[] {
    const now = Date.now();
    for (const take of this.takes.list(shotId)) {
      const open = take.status === 'queued' || take.status === 'running';
      if (open && now - Date.parse(take.createdAt) > STALE_WORK_MS) {
        this.takes.finish(take.id, { status: 'failed', errorCode: 'timeout' });
      }
    }
    return this.takes.list(shotId);
  }

  /**
   * «Tieni questo take» (T4.6): è quello che la card fa vedere, al posto del più recente. Deve essere
   * riuscito e dell'inquadratura. Gli altri restano: si può cambiare idea.
   */
  choose(projectId: string, shotId: string, takeId: string): ShotTakes {
    this.target(projectId, shotId);
    const found = this.takes.get(takeId);
    if (found?.shotId !== shotId || found.take.status !== 'succeeded') {
      throw domainError(409, 'invalid_request', { details: { field: 'takeId' } });
    }
    this.takes.choose(shotId, takeId);
    return { shotId, takes: this.currentTakes(shotId) };
  }

  /** I servizi tra cui scegliere, con la stima di tutto il take (testo e video). */
  async options(projectId: string, shotId: string): Promise<SheetOptions> {
    const { stored } = this.target(projectId, shotId);
    const config = await this.config();
    const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
    return { options: await this.priced(stored.spec, bible, config) };
  }

  /** «Genera»: controlla servizio e limiti di spesa, poi mette in coda un take. */
  async start(projectId: string, shotId: string, body: StartSheetBody): Promise<ShotTakes> {
    const { stored } = this.target(projectId, shotId);
    assertPlanCurrent({
      store: this.store,
      screenplays: this.screenplays,
      known: this.bible.knownIds(projectId),
      projectId,
      stored,
    });

    const config = await this.config();
    const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
    const chosen = await chooseMediaService({
      role: ROLE,
      options: await this.priced(stored.spec, bible, config),
      body,
      config,
      spend: this.spend,
      projectId,
    });

    // Mentre un take lavora non se ne chiede un altro: un video costa dollari, e due richieste
    // insieme (un doppio clic) lo pagherebbero due volte. Il controllo sta qui, dopo le attese e
    // subito prima di aprire il take, senza altre attese in mezzo.
    if (
      this.currentTakes(shotId).some(
        (take) => take.status === 'queued' || take.status === 'running',
      )
    ) {
      throw domainError(409, 'invalid_request', { details: { field: 'takes' } });
    }
    const take = this.takes.start(shotId, { modelId: chosen.modelId, modelLabel: chosen.label });
    const payload: TakeJobPayload = {
      projectId,
      shotId,
      takeId: take.id,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.runner.enqueue({
      kind: TAKE_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${TAKE_JOB_KIND}:${take.id}`,
    });
    return { shotId, takes: this.takes.list(shotId) };
  }

  /**
   * Il lavoro in coda: si leggono i file (costano niente), poi il testo (costa), poi il video. Un
   * errore si scrive sul take e il lavoro finisce lo stesso: un altro take lo chiede l'utente.
   */
  private async makeTake(rawPayload: unknown): Promise<void> {
    const payload = takeJobPayloadSchema.parse(rawPayload);
    const { projectId, shotId, takeId } = payload;

    const stored = this.store.get(shotId);
    const current = this.takes.get(takeId);
    if (stored === undefined || current === undefined) {
      // Il piano della scena è stato rifatto mentre il lavoro aspettava: il take non c'è più.
      this.log.warn('Take richiesto per un’inquadratura che non c’è più: lavoro lasciato perdere.');
      return;
    }
    // Un lavoro ripetuto (per esempio dopo un riavvio) su un take già chiuso non rifà niente: non si
    // paga due volte (regola 10) e non si cancella la clip già pronta.
    if (current.take.status === 'succeeded' || current.take.status === 'failed') return;

    try {
      this.takes.finish(takeId, { status: 'running' });
      const config = await this.config();
      const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
      const family = familyOf(config, payload.modelId);
      const images = videoImages(stored.spec, bible);
      const files = await this.readFiles(images);
      const context = {
        purpose: 'product',
        projectId,
        shotId,
        ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
      } as const;

      const written = await this.troupe.run(
        'cinematographer',
        cinematographerInputFor({
          spec: stored.spec,
          bible,
          config,
          family,
          target: videoTarget(images),
        }),
        context,
      );
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'take'));
      const job = await media.submit(
        ROLE,
        {
          role: ROLE,
          prompt: written.data.prompt,
          ...(written.data.negativePrompt === undefined
            ? {}
            : { negativePrompt: written.data.negativePrompt }),
          inputs: files.inputs,
          characterIds: files.characterIds,
          durationS: stored.spec.intent.durationS,
          params: {},
          idempotencyKey: `${stored.spec.id}:take:${takeId}`,
        },
        { ...context, modelId: payload.modelId },
      );

      const { assets, receipt } = await waitForMedia(media, job.receiptId, VIDEO_WAIT);
      const clip = assets[0];
      if (clip === undefined) {
        throw new ProviderError('invalid_output', false, 'Il servizio non ha restituito il video.');
      }
      registerAssets(this.files, { dataDir: this.dataDir, projectId, generationId: receipt.id }, [
        clip,
      ]);
      // Il take registra il servizio che ha lavorato davvero, e il costo vero dello scontrino (D36).
      this.takes.finish(takeId, {
        status: 'succeeded',
        assetId: clip.assetId,
        receiptId: receipt.id,
        modelId: receipt.modelId,
        modelLabel: receipt.modelLabel,
        ...(receipt.actualCostUsd === undefined ? {} : { costUsd: receipt.actualCostUsd }),
      });
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Take fallito: ${errorCode}.`);
      this.takes.finish(takeId, { status: 'failed', errorCode });
    }
  }

  /**
   * I servizi adatti con il prezzo di **tutto** il take: il video più la chiamata di testo che scrive
   * il prompt (D30). Le immagini sono finte (per scegliere e stimare conta quante e a cosa servono),
   * e come segnaposto del prompt si usa l'azione dell'inquadratura: non viene mai inviata.
   */
  private async priced(
    spec: ShotSpec,
    bible: StoryBible,
    config: TroupeConfig,
  ): Promise<ModelOption[]> {
    const options = await this.troupe.options(ROLE, videoStandInRequest(spec, bible));
    const reference = options.find((option) => option.isDefault) ?? options[0];
    if (reference === undefined) return [];

    // Il testo da scrivere ha quasi la stessa lunghezza per ogni servizio: una stima sola, sul
    // servizio predefinito, e un'indicazione per gli altri.
    const writing = await this.troupe.estimate(
      'cinematographer',
      cinematographerInputFor({
        spec,
        bible,
        config,
        family: familyOf(config, reference.modelId),
        target: videoTarget(videoImages(spec, bible)),
      }),
    );
    return options.map((option) => ({
      ...option,
      estimatedCostUsd: option.estimatedCostUsd + writing.estimatedCostUsd,
    }));
  }

  /**
   * I file che il video riceve: prima le immagini scelte dall'utente col loro ruolo, poi, se non ha
   * fissato un fotogramma, i volti e il set. Il primo o l'ultimo fotogramma sono indispensabili:
   * senza il file il take non parte e non si paga niente. Un'ispirazione che non c'è più si salta.
   */
  private async readFiles(images: VideoImages): Promise<VideoFiles> {
    const [chosen, identity] = await Promise.all([
      Promise.all(
        images.chosen.map(async ({ use, assetId }) => ({
          use,
          input: await referenceInput(this.files, this.dataDir, assetId, use),
        })),
      ),
      images.identity === undefined
        ? undefined
        : readIdentity(this.files, this.dataDir, images.identity),
    ]);

    const missingFrame = chosen.some(
      ({ use, input }) => use !== 'reference' && input === undefined,
    );
    if (missingFrame) {
      throw new ProviderError('invalid_request', false, 'Un fotogramma impostato non c’è più.');
    }
    return {
      inputs: [
        ...chosen.flatMap(({ input }) => (input === undefined ? [] : [input])),
        ...(identity?.inputs ?? []),
      ],
      characterIds: identity?.characterIds ?? [],
    };
  }

  private target(projectId: string, shotId: string): { stored: StoredShot } {
    this.projects.get(projectId);
    return { stored: shotOf(this.store, projectId, shotId) };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

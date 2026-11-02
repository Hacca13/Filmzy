import path from 'node:path';

import {
  storyboardJobPayloadSchema,
  type ModelOption,
  type SheetOptions,
  type ShotSpec,
  type ShotStoryboard,
  type StartSheetBody,
  type StoryBible,
  type StoryboardJobPayload,
} from '@filmzy/contracts';
import {
  projectsDir,
  type JobQueue,
  type SheetStore,
  type ShotStore,
  type StoredShot,
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
import { DATA_DIR, JOB_QUEUE } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { chooseImageService, registerAssets, waitForMedia } from '../media/image-jobs.js';
import { referenceInput } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { isStale } from './plan-shots.js';
import { cinematographerInputFor, storyboardReferences } from './storyboard-input.js';
import { SHOT_STORE } from './tokens.js';

const ROLE = 'storyboard_artist';

/** Quante varianti se la configurazione del ruolo non lo dice: «due o tre» (piano T4.1). */
const FALLBACK_VARIANTS = 3;

/** La richiesta di un lavoro di immagine, senza il servizio: lo sceglie chi la manda (D36). */
type MediaRequest = Parameters<MediaRunner['submit']>[1];

/** Il tipo di lavoro in coda che fa le varianti di storyboard di un'inquadratura. */
export const STORYBOARD_JOB_KIND = 'storyboard_images';

/** I riferimenti già letti dai file: i volti bloccati e il set, nell'ordine in cui li legge il traduttore. */
interface ReadReferences {
  inputs: MediaInput[];
  /** I personaggi che hanno davvero un riferimento: gli altri non si citano nel prompt. */
  characterIds: string[];
}

/**
 * Lo storyboard di un'inquadratura (T4.1, D62): da una scheda inquadratura si fanno due o tre
 * varianti dell'immagine e se ne sceglie una, che resta come riferimento visivo della card. Il
 * direttore della fotografia scrive il prompt (un'unica chiamata di testo), poi il servizio
 * immagini lo disegna con il volto bloccato dei personaggi e l'immagine del set come riferimenti.
 *
 * Come per schede e luoghi: le immagini sono un lavoro in coda (regola 9), i file si copiano subito
 * nella cartella del film (regola 11), servizio e stima si vedono prima (D36, D30) e il limite di
 * spesa si controlla **prima** di mettere in coda. Se qualcosa fallisce lo dice il tentativo e
 * decide l'utente: nessuna riserva (regola 6).
 */
@Injectable()
export class StoryboardService implements OnModuleInit {
  private readonly log = new Logger('Storyboard');

  constructor(
    @Inject(SHOT_STORE) private readonly store: ShotStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    @Inject(JOB_QUEUE) private readonly queue: JobQueue,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly bible: BibleService,
    private readonly screenplays: ScreenplayService,
  ) {}

  onModuleInit(): void {
    this.runner.register(STORYBOARD_JOB_KIND, (job) => this.makeImages(job.payload));
  }

  /** I servizi tra cui scegliere, con la stima di tutto il tentativo (testo e immagini). */
  async options(projectId: string, shotId: string): Promise<SheetOptions> {
    const { stored } = this.target(projectId, shotId);
    const config = await this.config();
    const bible = await this.bible.assemble(projectId);
    return { options: await this.priced(stored.spec, bible, config) };
  }

  /** «Fai lo storyboard»: controlla servizio e limiti di spesa, poi mette in coda un tentativo. */
  async start(projectId: string, shotId: string, body: StartSheetBody): Promise<ShotStoryboard> {
    const { stored } = this.target(projectId, shotId);
    this.assertPlanCurrent(projectId, stored);

    // Mentre un tentativo lavora non se ne chiede un altro: si pagherebbe due volte la stessa inquadratura.
    const latest = this.store.storyboard(shotId).attempts[0];
    if (latest?.status === 'queued' || latest?.status === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'storyboard' } });
    }

    const config = await this.config();
    const bible = await this.bible.assemble(projectId);
    const chosen = await chooseImageService({
      role: ROLE,
      options: await this.priced(stored.spec, bible, config),
      body,
      config,
      spend: this.spend,
      projectId,
    });

    const attempt = this.store.startStoryboard(shotId);
    const payload: StoryboardJobPayload = {
      projectId,
      shotId,
      attempt,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.queue.enqueue({
      kind: STORYBOARD_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${STORYBOARD_JOB_KIND}:${shotId}:${String(attempt)}`,
    });
    this.runner.wake();
    return this.store.storyboard(shotId);
  }

  storyboard(projectId: string, shotId: string): ShotStoryboard {
    this.target(projectId, shotId);
    return this.store.storyboard(shotId);
  }

  /** «Scegli questa»: la variante deve essere di un tentativo riuscito di quell'inquadratura. */
  choose(projectId: string, shotId: string, assetId: string): ShotStoryboard {
    this.target(projectId, shotId);
    const known = this.store
      .storyboard(shotId)
      .attempts.some(
        (attempt) => attempt.status === 'succeeded' && attempt.assetIds.includes(assetId),
      );
    if (!known) throw domainError(409, 'invalid_request', { details: { field: 'assetId' } });

    this.store.chooseStoryboard(shotId, assetId);
    return this.store.storyboard(shotId);
  }

  /**
   * Il lavoro in coda: il prompt dal direttore della fotografia, poi una chiamata che dà più
   * immagini. Un errore si scrive sul tentativo e il lavoro finisce lo stesso: un altro tentativo
   * lo chiede l'utente.
   */
  private async makeImages(rawPayload: unknown): Promise<void> {
    const payload = storyboardJobPayloadSchema.parse(rawPayload);
    const { projectId, shotId, attempt } = payload;

    const stored = this.store.get(shotId);
    if (stored === undefined) {
      // Il piano della scena è stato rifatto mentre il lavoro aspettava: l'inquadratura non c'è più.
      this.log.warn(
        'Storyboard richiesto per un’inquadratura che non c’è più: lavoro lasciato perdere.',
      );
      return;
    }

    try {
      this.store.finishStoryboard(shotId, attempt, { status: 'running' });
      const config = await this.config();
      const bible = await this.bible.assemble(projectId);
      const family = this.familyOf(config, payload.modelId);
      const context = {
        purpose: 'product',
        projectId,
        shotId,
        ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
      } as const;

      const written = await this.troupe.run(
        'cinematographer',
        cinematographerInputFor({ spec: stored.spec, bible, config, family }),
        context,
      );
      const references = await this.readReferences(stored.spec, bible);
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));
      const job = await media.submit(
        ROLE,
        this.requestFor(config, stored.spec, references, written.data, attempt),
        { ...context, modelId: payload.modelId },
      );

      const { assets, receipt } = await waitForMedia(media, job.receiptId);
      if (assets.length === 0) {
        throw new ProviderError('invalid_output', false, 'Il servizio non ha restituito immagini.');
      }
      registerAssets(
        this.files,
        { dataDir: this.dataDir, projectId, generationId: receipt.id },
        assets,
      );
      this.store.finishStoryboard(shotId, attempt, {
        status: 'succeeded',
        assetIds: assets.map((asset) => asset.assetId),
        receiptId: receipt.id,
      });
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Storyboard fallito: ${errorCode}.`);
      this.store.finishStoryboard(shotId, attempt, { status: 'failed', errorCode });
    }
  }

  /**
   * I servizi adatti con il prezzo di **tutto** il tentativo: le immagini più la chiamata di testo
   * che scrive il prompt, perché è ciò che l'utente spende (D30). Prima del lavoro il prompt non c'è
   * ancora: per capire quali servizi vanno bene e quanto costano basta la richiesta con i suoi
   * riferimenti, e come segnaposto si usa l'azione dell'inquadratura (non viene mai inviata).
   */
  private async priced(
    spec: ShotSpec,
    bible: StoryBible,
    config: TroupeConfig,
  ): Promise<ModelOption[]> {
    const references = await this.readReferences(spec, bible);
    const options = await this.troupe.options(
      ROLE,
      this.requestFor(config, spec, references, { prompt: spec.intent.action }, 0),
    );
    const reference = options.find((option) => option.isDefault) ?? options[0];
    if (reference === undefined) return [];

    // Il testo da scrivere è lungo uguale per ogni servizio: una stima sola, sulla famiglia di uno.
    const writing = await this.troupe.estimate(
      'cinematographer',
      cinematographerInputFor({
        spec,
        bible,
        config,
        family: this.familyOf(config, reference.modelId),
      }),
    );
    return options.map((option) => ({
      ...option,
      estimatedCostUsd: option.estimatedCostUsd + writing.estimatedCostUsd,
    }));
  }

  /** La richiesta al servizio: il prompt del direttore della fotografia e i riferimenti. */
  private requestFor(
    config: TroupeConfig,
    spec: ShotSpec,
    references: ReadReferences,
    visual: { prompt: string; negativePrompt?: string | undefined },
    attempt: number,
  ): MediaRequest {
    const configured = config.roles[ROLE]?.params?.variants;
    const variants = typeof configured === 'number' ? configured : FALLBACK_VARIANTS;

    return {
      role: ROLE,
      prompt: visual.prompt,
      ...(visual.negativePrompt === undefined ? {} : { negativePrompt: visual.negativePrompt }),
      inputs: references.inputs,
      characterIds: references.characterIds,
      params: { variants },
      idempotencyKey: `${spec.id}:storyboard:${String(attempt)}`,
    };
  }

  /**
   * I file dei riferimenti, nell'ordine in cui il traduttore conta i personaggi: prima i volti, poi
   * il set. Un file che non c'è più (cartella ripulita a mano) si salta: l'immagine verrà senza
   * quel riferimento, e il personaggio non si cita nel prompt.
   */
  private async readReferences(spec: ShotSpec, bible: StoryBible): Promise<ReadReferences> {
    const wanted = storyboardReferences(spec, bible);
    const [faces, set] = await Promise.all([
      Promise.all(
        wanted.characters.map(async ({ characterId, assetId }) => ({
          characterId,
          input: await referenceInput(this.files, this.dataDir, assetId),
        })),
      ),
      wanted.locationAssetId === undefined
        ? undefined
        : referenceInput(this.files, this.dataDir, wanted.locationAssetId),
    ]);

    const found = faces.flatMap(({ characterId, input }) =>
      input === undefined ? [] : [{ characterId, input }],
    );
    return {
      inputs: [...found.map(({ input }) => input), ...(set === undefined ? [] : [set])],
      characterIds: found.map(({ characterId }) => characterId),
    };
  }

  /** La famiglia del servizio: il direttore della fotografia scrive il prompt nella sua sintassi. */
  private familyOf(config: TroupeConfig, modelId: string): string {
    const family = config.models[modelId]?.family;
    if (family === undefined) {
      throw domainError(422, 'config_invalid', { details: { modelId } });
    }
    return family;
  }

  /** Un piano vecchio (scena cambiata, personaggio o luogo tolto) non si disegna: si rifà prima. */
  private assertPlanCurrent(projectId: string, stored: StoredShot): void {
    const plan = this.store.plan(projectId, stored.sceneNumber);
    const scene = this.screenplays
      .latest(projectId, 'final')
      .screenplay.scenes.find((candidate) => candidate.number === stored.sceneNumber);
    if (
      plan === undefined ||
      scene === undefined ||
      isStale(scene, plan, this.bible.knownIds(projectId))
    ) {
      throw domainError(409, 'invalid_request', { details: { field: 'plan' } });
    }
  }

  private target(projectId: string, shotId: string): { stored: StoredShot } {
    this.projects.get(projectId);
    const stored = this.store.get(shotId);
    if (stored?.projectId !== projectId) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    return { stored };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

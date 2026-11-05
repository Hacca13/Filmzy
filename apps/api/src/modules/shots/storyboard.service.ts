import path from 'node:path';

import {
  JOB_INTERRUPTED,
  storyboardJobPayloadSchema,
  type ModelOption,
  type SheetOptions,
  type ShotSpec,
  type ShotStoryboard,
  type StartSheetBody,
  type StoryBible,
  type StoryboardJobPayload,
  type StoryboardMode,
} from '@filmzy/contracts';
import { projectsDir, type SheetStore, type ShotStore, type StoredShot } from '@filmzy/db';
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
  chooseMediaService,
  registerAssets,
  variantsOf,
  waitForMedia,
} from '../media/image-jobs.js';
import { readIdentity, referenceInput } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { assertPlanCurrent, shotOf } from './shot-access.js';
import { imageAssetId, withLastFrame } from './shot-images.js';
import {
  cinematographerInputFor,
  familyOf,
  identityStandIns,
  standInImage,
  storyboardReferences,
  storyboardTarget,
} from './storyboard-input.js';
import { SHOT_STORE } from './tokens.js';
import { isOpenStatus } from './work.js';

const ROLE = 'storyboard_artist';

/**
 * L'ultimo fotogramma nasce dal primo, che l'utente deve aver impostato (D20): senza, non c'è cosa
 * modificare e lo si dice prima di spendere.
 */
function assertCanDraw(spec: ShotSpec, mode: StoryboardMode): void {
  if (mode === 'end_frame' && imageAssetId(spec, 'first_frame') === undefined) {
    throw domainError(409, 'invalid_request', { details: { field: 'firstFrame' } });
  }
}

/** Quante varianti se la configurazione del ruolo non lo dice: «due o tre» (piano T4.1). */
const FALLBACK_VARIANTS = 3;

/** La richiesta di un lavoro di immagine, senza il servizio: lo sceglie chi la manda (D36). */
type MediaRequest = Parameters<MediaRunner['submit']>[1];

/** Il tipo di lavoro in coda che fa le varianti di storyboard di un'inquadratura. */
export const STORYBOARD_JOB_KIND = 'storyboard_images';

/**
 * Le immagini già lette dai file, nell'ordine in cui le legge il traduttore: l'immagine da
 * modificare (solo per l'ultimo fotogramma), i volti bloccati e il set.
 */
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
 * Lo stesso lavoro fa l'**ultimo fotogramma** (T4.2, D20, `end_frame`): parte dal primo fotogramma
 * impostato dall'utente, che il servizio modifica secondo il movimento di macchina; per questo
 * servono un servizio che sa modificare un'immagine e il primo fotogramma già impostato.
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
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly bible: BibleService,
    private readonly screenplays: ScreenplayService,
  ) {}

  onModuleInit(): void {
    this.runner.register(
      STORYBOARD_JOB_KIND,
      (job) => this.makeImages(job.payload),
      (job) => {
        this.closeInterrupted(job.payload);
      },
    );
  }

  /** Il programma si è chiuso prima della fine: il tentativo si chiude, e un altro lo chiede l'utente (D84). */
  private closeInterrupted(rawPayload: unknown): void {
    const { shotId, mode, attempt } = storyboardJobPayloadSchema.parse(rawPayload);
    const current = this.store
      .storyboard(shotId, mode)
      .attempts.find((candidate) => candidate.attempt === attempt);
    if (isOpenStatus(current?.status)) {
      this.store.finishStoryboard(shotId, mode, attempt, {
        status: 'failed',
        errorCode: JOB_INTERRUPTED,
      });
    }
  }

  /** I servizi tra cui scegliere, con la stima di tutto il tentativo (testo e immagini). */
  async options(projectId: string, shotId: string, mode: StoryboardMode): Promise<SheetOptions> {
    const { stored } = this.target(projectId, shotId);
    assertCanDraw(stored.spec, mode);
    const config = await this.config();
    const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
    return { options: await this.priced(stored.spec, bible, config, mode) };
  }

  /** «Fai lo storyboard»: controlla servizio e limiti di spesa, poi mette in coda un tentativo. */
  async start(
    projectId: string,
    shotId: string,
    mode: StoryboardMode,
    body: StartSheetBody,
  ): Promise<ShotStoryboard> {
    const { stored } = this.target(projectId, shotId);
    assertPlanCurrent({
      store: this.store,
      screenplays: this.screenplays,
      known: this.bible.knownIds(projectId),
      projectId,
      stored,
    });
    assertCanDraw(stored.spec, mode);

    const config = await this.config();
    const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
    const chosen = await chooseMediaService({
      role: ROLE,
      options: await this.priced(stored.spec, bible, config, mode),
      body,
      config,
      spend: this.spend,
      projectId,
    });

    // Mentre un tentativo lavora non se ne chiede un altro: si pagherebbe due volte la stessa
    // inquadratura. Il controllo sta qui, dopo le attese e subito prima di aprire il tentativo, senza
    // altre attese in mezzo: con un doppio clic la seconda richiesta lo trova già aperto.
    const latest = this.store.storyboard(shotId, mode).attempts[0];
    if (latest?.status === 'queued' || latest?.status === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'storyboard' } });
    }
    const attempt = this.store.startStoryboard(shotId, mode, chosen.label);
    const payload: StoryboardJobPayload = {
      projectId,
      shotId,
      attempt,
      mode,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.runner.enqueue({
      kind: STORYBOARD_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${STORYBOARD_JOB_KIND}:${shotId}:${mode}:${String(attempt)}`,
    });
    return this.storyboardOf(stored.spec, shotId, mode);
  }

  storyboard(projectId: string, shotId: string, mode: StoryboardMode): ShotStoryboard {
    const { stored } = this.target(projectId, shotId);
    return this.storyboardOf(stored.spec, shotId, mode);
  }

  /**
   * «Scegli questa»: la variante deve essere di un tentativo riuscito di quell'inquadratura. Quella
   * dello storyboard diventa il riferimento della card; quella dell'ultimo fotogramma diventa
   * l'ultimo fotogramma impostato (al posto di quello di prima).
   */
  choose(projectId: string, shotId: string, mode: StoryboardMode, assetId: string): ShotStoryboard {
    const { stored } = this.target(projectId, shotId);
    const known = this.store
      .storyboard(shotId, mode)
      .attempts.some(
        (attempt) => attempt.status === 'succeeded' && attempt.assetIds.includes(assetId),
      );
    if (!known) throw domainError(409, 'invalid_request', { details: { field: 'assetId' } });

    if (mode === 'storyboard') {
      this.store.chooseStoryboard(shotId, assetId);
    } else if (!this.store.updateSpec(shotId, withLastFrame(stored.spec, assetId))) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    return this.storyboard(projectId, shotId, mode);
  }

  /**
   * I tentativi di un modo. La variante scelta dello storyboard sta nel database; quella dell'ultimo
   * fotogramma è l'immagine impostata nella scheda, se è una di queste.
   */
  private storyboardOf(spec: ShotSpec, shotId: string, mode: StoryboardMode): ShotStoryboard {
    const storyboard = this.store.storyboard(shotId, mode);
    if (mode === 'storyboard') return storyboard;

    const lastFrame = imageAssetId(spec, 'last_frame');
    const isOurs = storyboard.attempts.some(
      (attempt) => lastFrame !== undefined && attempt.assetIds.includes(lastFrame),
    );
    return isOurs && lastFrame !== undefined
      ? { ...storyboard, chosenAssetId: lastFrame }
      : storyboard;
  }

  /**
   * Il lavoro in coda: il prompt dal direttore della fotografia, poi una chiamata che dà più
   * immagini. Un errore si scrive sul tentativo e il lavoro finisce lo stesso: un altro tentativo
   * lo chiede l'utente.
   */
  private async makeImages(rawPayload: unknown): Promise<void> {
    const payload = storyboardJobPayloadSchema.parse(rawPayload);
    const { projectId, shotId, attempt, mode } = payload;

    const stored = this.store.get(shotId);
    if (stored === undefined) {
      // Il piano della scena è stato rifatto mentre il lavoro aspettava: l'inquadratura non c'è più.
      this.log.warn(
        'Storyboard richiesto per un’inquadratura che non c’è più: lavoro lasciato perdere.',
      );
      return;
    }

    // Un lavoro ripetuto su un tentativo già chiuso non rifà niente: non si paga due volte (regola 10) e
    // non si cancellano le varianti già pronte.
    const current = this.store
      .storyboard(shotId, mode)
      .attempts.find((candidate) => candidate.attempt === attempt);
    if (current?.status === 'succeeded' || current?.status === 'failed') return;

    try {
      this.store.finishStoryboard(shotId, mode, attempt, { status: 'running' });
      const config = await this.config();
      const bible = await this.bible.assemble(projectId, stored.spec.sceneId);
      const family = familyOf(config, payload.modelId);
      const context = {
        purpose: 'product',
        projectId,
        shotId,
        ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
      } as const;

      // Prima i file (costano niente), poi il testo (costa): se manca il primo fotogramma non si
      // paga una chiamata che non porta a nessuna immagine.
      const references = await this.readReferences(stored.spec, bible, mode);
      const written = await this.troupe.run(
        'cinematographer',
        cinematographerInputFor({
          spec: stored.spec,
          bible,
          config,
          family,
          target: storyboardTarget(mode),
        }),
        context,
      );
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));
      const job = await media.submit(
        ROLE,
        this.requestFor(config, stored.spec, references, written.data, mode, attempt),
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
      this.store.finishStoryboard(shotId, mode, attempt, {
        status: 'succeeded',
        assetIds: assets.map((asset) => asset.assetId),
        receiptId: receipt.id,
        modelLabel: receipt.modelLabel,
        ...(receipt.actualCostUsd === undefined ? {} : { costUsd: receipt.actualCostUsd }),
      });
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Storyboard (${mode}) fallito: ${errorCode}.`);
      this.store.finishStoryboard(shotId, mode, attempt, { status: 'failed', errorCode });
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
    mode: StoryboardMode,
  ): Promise<ModelOption[]> {
    const options = await this.troupe.options(
      ROLE,
      this.requestFor(
        config,
        spec,
        this.pricingReferences(spec, bible, mode),
        { prompt: spec.intent.action },
        mode,
        0,
      ),
    );
    const reference = options.find((option) => option.isDefault) ?? options[0];
    if (reference === undefined) return [];

    // Il testo da scrivere ha quasi la stessa lunghezza per ogni servizio (cambia solo qualche riga di
    // istruzioni per famiglia): una stima sola, sul servizio predefinito, e un'indicazione per gli altri.
    const writing = await this.troupe.estimate(
      'cinematographer',
      cinematographerInputFor({
        spec,
        bible,
        config,
        family: familyOf(config, reference.modelId),
        target: storyboardTarget(mode),
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
    mode: StoryboardMode,
    attempt: number,
  ): MediaRequest {
    const variants = variantsOf(config, ROLE, FALLBACK_VARIANTS);

    return {
      role: ROLE,
      prompt: visual.prompt,
      ...(visual.negativePrompt === undefined ? {} : { negativePrompt: visual.negativePrompt }),
      inputs: references.inputs,
      characterIds: references.characterIds,
      params: { variants },
      idempotencyKey: `${spec.id}:${mode}:${String(attempt)}`,
    };
  }

  /**
   * I riferimenti per capire quali servizi vanno bene e quanto costano: conta quanti sono e a chi
   * appartengono, non cosa contengono. Non si legge nessun file (le immagini si leggono una volta
   * sola, quando il lavoro disegna).
   */
  private pricingReferences(
    spec: ShotSpec,
    bible: StoryBible,
    mode: StoryboardMode,
  ): ReadReferences {
    const wanted = storyboardReferences(spec, bible);
    return {
      inputs: [
        ...(mode === 'end_frame' ? [standInImage('base_image')] : []),
        ...identityStandIns(wanted),
      ],
      characterIds: wanted.characters.map((entry) => entry.characterId),
    };
  }

  /**
   * I file delle immagini, nell'ordine in cui il traduttore conta i personaggi: prima l'immagine da
   * modificare (per l'ultimo fotogramma), poi i volti, poi il set. Un riferimento il cui file non c'è
   * più (cartella ripulita a mano) si salta: l'immagine verrà senza, e il personaggio non si cita
   * nel prompt. L'immagine da modificare invece è indispensabile: senza, il tentativo non parte.
   */
  private async readReferences(
    spec: ShotSpec,
    bible: StoryBible,
    mode: StoryboardMode,
  ): Promise<ReadReferences> {
    const wanted = storyboardReferences(spec, bible);
    const firstFrame = mode === 'end_frame' ? imageAssetId(spec, 'first_frame') : undefined;
    const [base, identity] = await Promise.all([
      firstFrame === undefined
        ? undefined
        : referenceInput(this.files, this.dataDir, firstFrame, 'base_image'),
      readIdentity(this.files, this.dataDir, wanted),
    ]);

    if (mode === 'end_frame' && base === undefined) {
      throw new ProviderError('invalid_request', false, 'Il primo fotogramma non c’è più.');
    }
    return {
      inputs: [...(base === undefined ? [] : [base]), ...identity.inputs],
      characterIds: identity.characterIds,
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

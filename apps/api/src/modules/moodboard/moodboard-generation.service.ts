import path from 'node:path';

import {
  JOB_INTERRUPTED,
  moodboardJobPayloadSchema,
  type GenerateMoodboardBody,
  type MoodboardDesignerInput,
  type MoodboardJobPayload,
  type MoodboardView,
  type Project,
  type SheetOptions,
} from '@filmzy/contracts';
import {
  projectsDir,
  type MoodboardStore,
  type ScreenplayStore,
  type SheetStore,
} from '@filmzy/db';
import { MediaError } from '@filmzy/media';
import {
  ProviderError,
  type ConfigSource,
  type InstructionsSource,
  type MediaRunner,
  type SpendGuard,
  type Troupe,
  type TroupeConfig,
} from '@filmzy/troupe';
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { INSTRUCTIONS_SOURCE } from '../instructions/tokens.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import {
  chooseMediaService,
  registerAssets,
  renderImagePrompt,
  waitForMedia,
} from '../media/image-jobs.js';
import { assetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SCREENPLAY_STORE } from '../screenplay/tokens.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { imageColors } from './image-colors.js';
import { MoodboardService } from './moodboard.service.js';
import { MOODBOARD_STORE } from './tokens.js';

const DESIGNER = 'moodboard_designer';
const ARTIST = 'moodboard_artist';

/** Il tipo di lavoro in coda che crea le immagini di riferimento del moodboard. */
export const MOODBOARD_JOB_KIND = 'moodboard_images';

/** Quante immagini di riferimento si chiedono: abbastanza per vedere l'atmosfera, non per spendere inutilmente. */
const REFERENCE_COUNT = 4;

/** Per chiedere la stima basta una richiesta qualunque: il servizio non la legge, serve solo a sapere chi la accetta. */
const ESTIMATE_PROMPT = 'x';
const ESTIMATE_KEY = 'stima';

type MediaRequest = Parameters<MediaRunner['submit']>[1];

/**
 * «Crea il moodboard» (T4.10, D37): il responsabile dell'atmosfera (\`moodboard_designer\`, un modello di
 * testo) propone colori, consigli e i prompt di quattro immagini; colori e consigli **sostituiscono**
 * quelli della parte e un lavoro in coda (regola 9) fa le immagini con \`moodboard_artist\`, una per
 * prompt. Come ogni generazione: stima di tutto il lavoro e «Cambia servizio» prima (D36, D30), limite
 * di spesa controllato prima di cominciare, file copiati subito nella cartella del film (regola 11),
 * nessuna riserva se un servizio fallisce (regola 6). I colori di ogni immagine li calcola il codice.
 */
@Injectable()
export class MoodboardGenerationService implements OnModuleInit {
  private readonly log = new Logger('Moodboard');

  constructor(
    @Inject(MOODBOARD_STORE) private readonly store: MoodboardStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(SCREENPLAY_STORE) private readonly screenplays: ScreenplayStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(INSTRUCTIONS_SOURCE) private readonly instructions: InstructionsSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly moodboard: MoodboardService,
  ) {}

  onModuleInit(): void {
    this.runner.register(
      MOODBOARD_JOB_KIND,
      (job) => this.makeImages(job.payload),
      // Le richieste aperte le chiude la pulizia qui sotto, che le prende tutte.
      () => undefined,
    );
    // La richiesta si apre prima di scrivere i consigli e il lavoro va in coda solo dopo: chiudendo in mezzo
    // non c'è nessun lavoro da cui risalire, quindi si guardano le richieste. Le immagini arrivate restano.
    this.runner.atStart(() => {
      this.store.closeOpenRuns(JOB_INTERRUPTED);
    });
  }

  /** I servizi per le immagini, con la stima di **tutto** il lavoro: il testo e le immagini. */
  async options(projectId: string, sceneId: string | undefined): Promise<SheetOptions> {
    const { options } = await this.priced(projectId, sceneId);
    return { options };
  }

  async generate(projectId: string, body: GenerateMoodboardBody): Promise<MoodboardView> {
    await this.moodboard.assertEnabled();
    this.assertNoneRunning(projectId);

    const { config, input, options } = await this.priced(projectId, body.sceneId);
    const chosen = await chooseMediaService({
      role: ARTIST,
      options,
      body: {
        ...(body.modelId === undefined ? {} : { modelId: body.modelId }),
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      },
      config,
      spend: this.spend,
      projectId,
    });

    // La richiesta si apre subito, prima di chiamare il modello di testo: una seconda richiesta fatta nel
    // frattempo trova il lavoro già aperto e non paga due volte lo stesso moodboard. Il controllo sta qui,
    // dopo le attese e subito prima di aprirla, senza altre attese in mezzo.
    this.assertNoneRunning(projectId);
    const runId = this.store.startRun(projectId, body.sceneId, chosen.label);
    let prompts: string[];
    try {
      // Il testo: lo scrive un modello (a pagamento), colori e consigli sostituiscono quelli della parte.
      const { data: proposal } = await this.troupe.run(DESIGNER, input, {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      });
      prompts = proposal.referencePrompts.slice(0, REFERENCE_COUNT);
      if (prompts.length === 0) {
        throw domainError(502, 'invalid_output', { details: { role: DESIGNER } });
      }
      this.store.saveText(projectId, body.sceneId, {
        palette: proposal.palette,
        notes: proposal.notes.trim(),
      });
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.store.updateRun(runId, { status: 'failed', errorCode });
      throw error;
    }

    const payload: MoodboardJobPayload = {
      projectId,
      runId,
      ...(body.sceneId === undefined ? {} : { sceneId: body.sceneId }),
      prompts,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    try {
      this.runner.enqueue({
        kind: MOODBOARD_JOB_KIND,
        payload,
        projectId,
        idempotencyKey: `${MOODBOARD_JOB_KIND}:${runId}`,
      });
    } catch (error) {
      // Senza un lavoro la richiesta resterebbe in coda per sempre e bloccherebbe le altre.
      this.store.updateRun(runId, { status: 'failed', errorCode: 'unknown' });
      throw error;
    }
    return this.moodboard.view(projectId);
  }

  /**
   * Il lavoro in coda: un'immagine per prompt, una dopo l'altra. Se una fallisce la richiesta si ferma
   * col suo motivo (e le immagini già arrivate restano): un'altra richiesta la decide l'utente.
   */
  async makeImages(rawPayload: unknown): Promise<void> {
    const payload = moodboardJobPayloadSchema.parse(rawPayload);
    const { projectId, runId } = payload;

    // Una richiesta già chiusa non rifà niente: si pagherebbe due volte (regola 10).
    const status = this.store.getRun(runId)?.status;
    if (status === 'succeeded' || status === 'failed') return;
    let images = 0;
    let costUsd = 0;
    try {
      this.store.updateRun(runId, { status: 'running' });
      const project = this.projects.get(projectId);
      const config = await this.config();
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));

      for (const [index, prompt] of payload.prompts.entries()) {
        const request = await this.artistRequest(
          project,
          config,
          prompt,
          `${runId}:${String(index)}`,
        );
        const job = await media.submit(ARTIST, request, {
          purpose: 'product',
          projectId,
          modelId: payload.modelId,
          ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
        });
        const { assets, receipt } = await waitForMedia(media, job.receiptId);
        const first = assets[0];
        if (first === undefined) {
          throw new ProviderError(
            'invalid_output',
            false,
            'Il servizio non ha restituito immagini.',
          );
        }
        registerAssets(this.files, { dataDir: this.dataDir, projectId, generationId: receipt.id }, [
          first,
        ]);

        this.store.addReference(projectId, payload.sceneId, {
          assetId: first.assetId,
          origin: 'generated',
          analysisOnly: false,
          // La descrizione di un'immagine fatta da noi è il prompt con cui è nata (in inglese).
          description: prompt,
          moodTags: [],
          palette: await this.colorsOf(first.assetId),
          generationId: receipt.id,
        });
        images += 1;
        costUsd += receipt.actualCostUsd ?? 0;
        this.store.updateRun(runId, { images, costUsd });
      }
      this.store.updateRun(runId, { status: 'succeeded', images, costUsd });
    } catch (error) {
      const errorCode =
        error instanceof ProviderError
          ? error.code
          : error instanceof MediaError
            ? 'media_failed'
            : 'unknown';
      this.log.warn(`Immagini del moodboard fallite: ${errorCode}.`);
      this.store.updateRun(runId, { status: 'failed', errorCode, images, costUsd });
    }
  }

  private async colorsOf(assetId: string) {
    const found = assetFile(this.files, this.dataDir, assetId);
    return found === undefined ? [] : imageColors(found.file, this.log);
  }

  /** Un lavoro alla volta per film: due richieste insieme farebbero le stesse immagini due volte. */
  private assertNoneRunning(projectId: string): void {
    const latest = this.store.latestRun(projectId);
    if (latest?.status === 'queued' || latest?.status === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'moodboard' } });
    }
  }

  /** Ciò che serve prima di chiamare un servizio, e i servizi con la stima di **tutto** il lavoro: il testo e le immagini. */
  private async priced(projectId: string, sceneId: string | undefined) {
    const prepared = await this.prepare(projectId, sceneId);
    const { project, config, input } = prepared;
    const designer = await this.troupe.estimate(DESIGNER, input);
    const images = await this.troupe.options(
      ARTIST,
      await this.artistRequest(project, config, ESTIMATE_PROMPT, ESTIMATE_KEY),
    );
    const options = images.map((option) => ({
      ...option,
      estimatedCostUsd: option.estimatedCostUsd * REFERENCE_COUNT + designer.estimatedCostUsd,
    }));
    return { ...prepared, options };
  }

  /** Ciò che serve prima di chiamare un servizio: film, configurazione e ingresso del responsabile dell'atmosfera. */
  private async prepare(projectId: string, sceneId: string | undefined) {
    const project = this.projects.get(projectId);
    if (
      sceneId !== undefined &&
      !this.moodboard.scenes(projectId).some((scene) => scene.sceneId === sceneId)
    ) {
      throw domainError(400, 'invalid_request', { details: { field: 'sceneId' } });
    }
    const latest =
      this.screenplays.latest(projectId, 'final') ?? this.screenplays.latest(projectId, 'draft');
    if (latest === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'screenplay' } });
    }

    const config = await this.config();
    const style = config.presets.styles.find((preset) => preset.id === project.style);
    const cinematography = config.presets.cinematography.find(
      (preset) => preset.id === project.cinematography,
    );
    if (style === undefined)
      throw domainError(422, 'config_invalid', { details: { field: 'style' } });
    if (cinematography === undefined) {
      throw domainError(422, 'config_invalid', { details: { field: 'cinematography' } });
    }

    const current = this.store.get(projectId);
    const part =
      sceneId === undefined
        ? current.film
        : current.scenes.find((scene) => scene.sceneId === sceneId);
    const input: MoodboardDesignerInput = {
      scope: sceneId === undefined ? 'film' : 'scene',
      idea: project.idea,
      genre: config.presets.genres.find((genre) => genre.id === project.genre) ?? {
        id: project.genre,
        label: project.genre,
      },
      tone: config.presets.tones.find((tone) => tone.id === project.tone) ?? {
        id: project.tone,
        label: project.tone,
      },
      style,
      cinematography,
      screenplay: latest.screenplay,
      sceneId: sceneId ?? null,
      moodboard:
        part === undefined || (part.palette.length === 0 && part.notes === '') ? null : part,
      referenceCount: REFERENCE_COUNT,
      language: project.language,
    };
    return { project, config, input };
  }

  /** La richiesta di un'immagine: il prompt è un modello di testo (nessun LLM, §4.4). */
  private async artistRequest(
    project: Project,
    config: TroupeConfig,
    prompt: string,
    idempotencyKey: string,
  ): Promise<MediaRequest> {
    const style = config.presets.styles.find((preset) => preset.id === project.style);
    if (style === undefined)
      throw domainError(422, 'config_invalid', { details: { field: 'style' } });

    const loaded = await this.configSource.load();
    const rendered = await renderImagePrompt({
      instructions: this.instructions,
      role: ARTIST,
      releaseRef: config.roles[ARTIST]?.instructions,
      userRef: loaded.settings?.roleSettings[ARTIST]?.instructions,
      input: { prompt, style, variants: 1 },
    });
    return {
      role: ARTIST,
      prompt: rendered,
      inputs: [],
      characterIds: [],
      params: { variants: 1 },
      idempotencyKey,
    };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

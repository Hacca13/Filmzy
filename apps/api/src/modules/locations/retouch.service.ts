import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  UPLOAD_MAX_BYTES,
  locationJobPayloadSchema,
  type LocationImages,
  type LocationJobPayload,
  type Project,
  type RetouchOperation,
  type RetouchQuery,
  type SheetOptions,
} from '@filmzy/contracts';
import { projectsDir, type LocationStore, type SheetStore, type UploadStore } from '@filmzy/db';
import { MediaError, markArea, maskHasPaint } from '@filmzy/media';
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
import { mediaStep } from '../media/media-step.js';
import { assetFile } from '../media/references.js';
import { ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { UPLOAD_STORE } from '../uploads/tokens.js';
import { detectImageType } from '../uploads/image-checks.js';
import { LocationsService } from './locations.service.js';
import { LOCATION_STORE } from './tokens.js';

const ROLE = 'retoucher';

/** Il tipo di lavoro in coda che ritocca un'immagine di un luogo. */
export const RETOUCH_JOB_KIND = 'location_retouch';

type MediaRequest = Parameters<MediaRunner['submit']>[1];
type MediaInput = MediaRequest['inputs'][number];

/**
 * Il ritocco col pennello delle immagini di un luogo (T4.9, D21): togli, sostituisci o cambia colore
 * in una zona che l'utente ha dipinto. Come ogni immagine è un **lavoro in coda** (regola 9), con
 * servizio e stima scelti prima (D36, D30), limite di spesa controllato prima di accodare e un solo
 * lavoro alla volta per luogo. Il risultato è un tentativo del luogo, e l'utente decide se usarlo
 * come riferimento (solo allora il luogo «cambia» e le inquadrature già fatte ingialliscono, R6).
 *
 * Si ritoccano solo immagini che Filmzy ha fatto o che sono passate dal controllo delle foto (D19):
 * una foto caricata senza controllo non si ritocca. Le parole dell'utente passano dal moderatore.
 * Nessun servizio del catalogo accetta una maschera vera: la zona dipinta si evidenzia **sull'immagine**
 * e il servizio riceve questa (`markArea`).
 */
@Injectable()
export class RetouchService implements OnModuleInit {
  private readonly log = new Logger('Ritocco');

  constructor(
    @Inject(LOCATION_STORE) private readonly store: LocationStore,
    @Inject(UPLOAD_STORE) private readonly uploads: UploadStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(INSTRUCTIONS_SOURCE) private readonly instructions: InstructionsSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly locations: LocationsService,
    private readonly moderation: ModerationService,
  ) {}

  onModuleInit(): void {
    this.runner.register(RETOUCH_JOB_KIND, (job) => this.retouch(job.payload));
  }

  /** I servizi tra cui scegliere per questo ritocco, con la stima. */
  async options(
    projectId: string,
    locationId: string,
    query: { assetId: string; operation: RetouchOperation },
  ): Promise<SheetOptions> {
    const project = this.projects.get(projectId);
    this.assertEligible(projectId, locationId, query.assetId);
    const config = await this.config();
    const source = await this.sourceInput(query.assetId);
    const request = await this.requestFor(
      project,
      config,
      { operation: query.operation, instruction: null },
      source,
      `${locationId}:retouch:0`,
    );
    return { options: await this.troupe.options(ROLE, request) };
  }

  /** «Ritocca»: controlla tutto, poi mette in coda un tentativo. La maschera è il file ricevuto. */
  async start(
    projectId: string,
    locationId: string,
    query: RetouchQuery,
    body: unknown,
  ): Promise<LocationImages> {
    const project = this.projects.get(projectId);
    this.assertEligible(projectId, locationId, query.assetId);
    const mask = this.assertMask(body);
    // Un tentativo già in corso rifiuta la richiesta: meglio saperlo prima di scrivere e leggere file.
    this.assertNoneRunning(locationId);

    const maskFile = await this.keepMask(projectId, mask);
    let queued = false;
    try {
      if (!(await mediaStep(() => maskHasPaint(maskFile)))) {
        throw domainError(400, 'invalid_request', { details: { field: 'mask' } });
      }
      if (query.instruction !== undefined) {
        await this.moderation.assertAllowed({
          text: query.instruction,
          context: 'retouch',
          language: project.language,
          projectId,
          ...(query.spendConfirmed === 'true' ? { spendConfirmed: true } : {}),
        });
      }

      const config = await this.config();
      const source = await this.sourceInput(query.assetId);
      const options = await this.troupe.options(
        ROLE,
        await this.requestFor(
          project,
          config,
          { operation: query.operation, instruction: query.instruction ?? null },
          source,
          `${locationId}:retouch:0`,
        ),
      );
      const chosen = await chooseMediaService({
        role: ROLE,
        options,
        body: {
          ...(query.modelId === undefined ? {} : { modelId: query.modelId }),
          ...(query.spendConfirmed === 'true' ? { spendConfirmed: true } : {}),
        },
        config,
        spend: this.spend,
        projectId,
      });

      // Come per le immagini del set: un tentativo alla volta, il controllo subito prima di aprirlo
      // (dopo le attese, con un doppio clic la seconda richiesta lo trova già aperto).
      this.assertNoneRunning(locationId);
      const retouch = {
        sourceAssetId: query.assetId,
        operation: query.operation,
        ...(query.instruction === undefined ? {} : { instruction: query.instruction }),
      };
      const attempt = this.store.startAttempt(locationId, chosen.label, retouch);
      const payload: LocationJobPayload = {
        projectId,
        locationId,
        attempt,
        modelId: chosen.modelId,
        ...(query.spendConfirmed === 'true' ? { spendConfirmed: true } : {}),
        retouch: {
          ...retouch,
          maskPath: path.relative(this.dataDir, maskFile).replaceAll('\\', '/'),
        },
      };
      try {
        this.runner.enqueue({
          kind: RETOUCH_JOB_KIND,
          payload,
          projectId,
          idempotencyKey: `${RETOUCH_JOB_KIND}:${locationId}:${String(attempt)}`,
        });
      } catch (error) {
        // Senza un lavoro il tentativo resterebbe in coda per sempre e bloccherebbe il luogo.
        this.store.finishAttempt(locationId, attempt, { status: 'failed', errorCode: 'unknown' });
        throw error;
      }
      queued = true;
    } finally {
      // La maschera serve al lavoro in coda; se non si è accodato niente non serve a nessuno.
      if (!queued) await rm(maskFile, { force: true });
    }
    return this.locations.images(projectId, locationId);
  }

  /** Un tentativo del luogo alla volta: oltre a costare due volte, i risultati si confonderebbero. */
  private assertNoneRunning(locationId: string): void {
    const latest = this.store.images(locationId).attempts[0];
    if (latest?.status === 'queued' || latest?.status === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'images' } });
    }
  }

  /**
   * Solo immagini di Filmzy (le sue immagini del luogo, ritocchi compresi) o foto caricate che hanno
   * passato il controllo (D19). Una foto senza controllo potrebbe avere persone dentro.
   */
  private assertEligible(projectId: string, locationId: string, assetId: string): void {
    const images = this.locations.images(projectId, locationId);
    const fromFilmzy = images.attempts.some(
      (attempt) => attempt.status === 'succeeded' && attempt.assetIds.includes(assetId),
    );
    if (fromFilmzy) return;

    const upload = this.uploads
      .list(projectId)
      .find((item) => item.assetId === assetId && item.locationId === locationId);
    if (upload?.checked === true) return;

    throw domainError(409, 'invalid_request', {
      details: { field: upload === undefined ? 'image' : 'unchecked' },
    });
  }

  /** La maschera deve essere un PNG, non vuoto e non troppo grande. */
  private assertMask(body: unknown): Buffer {
    if (
      !Buffer.isBuffer(body) ||
      body.length === 0 ||
      body.length > UPLOAD_MAX_BYTES ||
      detectImageType(body) !== 'image/png'
    ) {
      throw domainError(400, 'invalid_request', { details: { field: 'mask' } });
    }
    return body;
  }

  private async keepMask(projectId: string, mask: Buffer): Promise<string> {
    const dir = path.join(projectsDir(this.dataDir), projectId, 'ritocco');
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `maschera-${randomUUID()}.png`);
    await writeFile(file, mask);
    return file;
  }

  /** L'immagine da ritoccare, letta dalla cartella del film. */
  private async sourceInput(assetId: string): Promise<MediaInput> {
    const found = assetFile(this.files, this.dataDir, assetId);
    if (found === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'assetId' } });
    }
    return this.inputFromFile(found.file, found.contentType);
  }

  private async inputFromFile(file: string, contentType: string): Promise<MediaInput> {
    try {
      return {
        use: 'base_image',
        file: {
          fileName: path.basename(file),
          contentType,
          bytes: new Uint8Array(await readFile(file)),
        },
      };
    } catch (error) {
      this.log.warn(
        `Immagine da ritoccare illeggibile: ${(error as NodeJS.ErrnoException).code ?? 'errore'}.`,
      );
      throw domainError(404, 'not_found', { details: { field: 'assetId' } });
    }
  }

  /** La richiesta al servizio: il prompt è un modello di testo (nessun LLM, §4.4) sull'immagine marcata. */
  private async requestFor(
    project: Project,
    config: TroupeConfig,
    what: { operation: RetouchOperation; instruction: string | null },
    input: MediaInput,
    idempotencyKey: string,
  ): Promise<MediaRequest> {
    const style = config.presets.styles.find((preset) => preset.id === project.style);
    if (style === undefined) {
      throw domainError(422, 'config_invalid', { details: { field: 'style' } });
    }

    const loaded = await this.configSource.load();
    const prompt = await renderImagePrompt({
      instructions: this.instructions,
      role: ROLE,
      releaseRef: config.roles[ROLE]?.instructions,
      userRef: loaded.settings?.roleSettings[ROLE]?.instructions,
      input: { operation: what.operation, instruction: what.instruction, style },
    });
    return {
      role: ROLE,
      prompt,
      inputs: [input],
      characterIds: [],
      params: { variants: 1 },
      idempotencyKey,
    };
  }

  /**
   * Il lavoro in coda: evidenzia la zona, chiede il ritocco, copia il risultato nella cartella del film.
   * Un errore si scrive sul tentativo e il lavoro finisce lo stesso: un altro tentativo lo chiede l'utente.
   * I file provvisori (maschera, immagine marcata) non restano mai.
   */
  private async retouch(rawPayload: unknown): Promise<void> {
    const payload = locationJobPayloadSchema.parse(rawPayload);
    const { projectId, locationId, attempt, retouch } = payload;
    if (retouch === undefined) {
      this.log.warn('Ritocco in coda senza i suoi dati: lavoro lasciato perdere.');
      return;
    }

    const maskFile = this.insideDataDir(retouch.maskPath);
    const marked = path.join(
      projectsDir(this.dataDir),
      projectId,
      'ritocco',
      `marcata-${randomUUID()}.png`,
    );
    try {
      const location = this.store.get(locationId);
      if (location === undefined) {
        // Il luogo è stato tolto mentre il lavoro aspettava: non c'è più niente da fare.
        this.log.warn('Ritocco richiesto per un luogo che non c’è più: lavoro lasciato perdere.');
        return;
      }

      this.store.finishAttempt(locationId, attempt, { status: 'running' });
      const project = this.projects.get(projectId);
      const config = await this.config();
      const source = assetFile(this.files, this.dataDir, retouch.sourceAssetId);
      if (source === undefined || maskFile === undefined) {
        throw new ProviderError('invalid_request', false, 'Manca un file del ritocco.');
      }

      await markArea({ image: source.file, mask: maskFile, output: marked });
      const request = await this.requestFor(
        project,
        config,
        { operation: retouch.operation, instruction: retouch.instruction ?? null },
        await this.inputFromFile(marked, 'image/png'),
        `${locationId}:retouch:${String(attempt)}`,
      );

      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));
      const job = await media.submit(ROLE, request, {
        purpose: 'product',
        projectId,
        modelId: payload.modelId,
        ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
      });

      const { assets, receipt } = await waitForMedia(media, job.receiptId);
      if (assets.length === 0) {
        throw new ProviderError('invalid_output', false, 'Il servizio non ha restituito immagini.');
      }
      registerAssets(
        this.files,
        { dataDir: this.dataDir, projectId, generationId: receipt.id },
        assets,
      );
      this.store.finishAttempt(locationId, attempt, {
        status: 'succeeded',
        assetIds: assets.map((asset) => asset.assetId),
        receiptId: receipt.id,
        modelLabel: receipt.modelLabel,
        ...(receipt.actualCostUsd === undefined ? {} : { costUsd: receipt.actualCostUsd }),
      });
    } catch (error) {
      const errorCode =
        error instanceof ProviderError
          ? error.code
          : error instanceof MediaError
            ? 'media_failed'
            : 'unknown';
      this.log.warn(`Ritocco fallito: ${errorCode}.`);
      this.store.finishAttempt(locationId, attempt, { status: 'failed', errorCode });
    } finally {
      await Promise.all([
        rm(marked, { force: true }),
        ...(maskFile === undefined ? [] : [rm(maskFile, { force: true })]),
      ]);
    }
  }

  /** Il percorso scritto nel lavoro, controllato prima di usarlo: deve stare nella cartella dei dati. */
  private insideDataDir(relative: string): string | undefined {
    const root = path.resolve(this.dataDir);
    const file = path.resolve(root, relative);
    return file.startsWith(root + path.sep) ? file : undefined;
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

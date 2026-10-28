import path from 'node:path';

import {
  locationJobPayloadSchema,
  type AddLocationBody,
  type Location,
  type LocationImages,
  type LocationJobPayload,
  type Locations,
  type Project,
  type SheetOptions,
  type StartSheetBody,
} from '@filmzy/contracts';
import {
  projectsDir,
  type JobQueue,
  type LocationStore,
  type ScreenplayStore,
  type SheetStore,
} from '@filmzy/db';
import {
  enforceSpend,
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
import { DATA_DIR, JOB_QUEUE } from '../database/database.module.js';
import { INSTRUCTIONS_SOURCE } from '../instructions/tokens.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { registerAssets, renderImagePrompt, waitForMedia } from '../media/image-jobs.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SCREENPLAY_STORE } from '../screenplay/tokens.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { LOCATION_STORE } from './tokens.js';

const ROLE = 'set_designer';

/** Quante immagini se la configurazione del ruolo non lo dice: «3–4 immagini per luogo» (piano T3.7). */
const FALLBACK_VARIANTS = 3;

/** La richiesta di un lavoro di immagine, senza il servizio: lo sceglie chi la manda (D36). */
type MediaRequest = Parameters<MediaRunner['submit']>[1];

/** Il tipo di lavoro in coda che fa le immagini del set di un luogo. */
export const LOCATION_JOB_KIND = 'location_images';

/**
 * I luoghi del film (T3.7, D18, D19): lo sceneggiatore li propone nella bozza, l'utente li aggiunge,
 * e per ognuno si fanno le immagini del set (senza persone) e se ne sceglie una, che resta come
 * riferimento nella Bibbia. Le immagini sono un lavoro in coda (regola 9), i file si copiano subito
 * nella cartella del film (regola 11), servizio e stima si vedono prima (D36, D30) e il limite di
 * spesa si controlla **prima** di mettere in coda. Se la chiamata fallisce lo dice il tentativo
 * e decide l'utente: nessuna riserva (regola 6).
 */
@Injectable()
export class LocationsService implements OnModuleInit {
  private readonly log = new Logger('Luoghi');

  constructor(
    @Inject(LOCATION_STORE) private readonly store: LocationStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(SCREENPLAY_STORE) private readonly screenplays: ScreenplayStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(INSTRUCTIONS_SOURCE) private readonly instructions: InstructionsSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    @Inject(JOB_QUEUE) private readonly queue: JobQueue,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
  ) {}

  onModuleInit(): void {
    this.runner.register(LOCATION_JOB_KIND, (job) => this.makeImages(job.payload));
  }

  /** I luoghi del film e quelli proposti dalla bozza che non sono ancora stati aggiunti. */
  list(projectId: string): Locations {
    this.projects.get(projectId);
    const locations = this.store.list(projectId);
    const added = new Set(locations.flatMap((location) => location.proposalId ?? []));
    const proposals = this.proposals(projectId).filter((proposal) => !added.has(proposal.id));
    return { locations, proposals };
  }

  /** «Aggiungi»: la proposta della bozza diventa un luogo del film. */
  add(projectId: string, body: AddLocationBody): Location {
    this.projects.get(projectId);
    const proposal = this.proposals(projectId).find(
      (candidate) => candidate.id === body.proposalId,
    );
    if (proposal === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'proposalId' } });
    }
    if (this.store.list(projectId).some((location) => location.proposalId === proposal.id)) {
      throw domainError(409, 'invalid_request', { details: { field: 'proposalId' } });
    }

    const location = this.store.create(projectId, {
      name: proposal.name,
      description: proposal.description,
      prompt: proposal.prompt,
      proposalId: proposal.id,
    });
    this.projects.reach(projectId, 'locations');
    return location;
  }

  remove(projectId: string, locationId: string): void {
    this.projects.get(projectId);
    this.locationOf(projectId, locationId);
    this.store.remove(locationId);
  }

  /** I servizi tra cui scegliere, con la stima di tutte le immagini del tentativo. */
  async options(projectId: string, locationId: string): Promise<SheetOptions> {
    const { project, location } = this.target(projectId, locationId);
    const config = await this.config();
    const request = await this.requestFor(project, location, config, 0);
    return { options: await this.troupe.options(ROLE, request) };
  }

  /** «Crea le immagini»: controlla servizio e limiti di spesa, poi mette in coda un tentativo. */
  async start(
    projectId: string,
    locationId: string,
    body: StartSheetBody,
  ): Promise<LocationImages> {
    const { project, location } = this.target(projectId, locationId);
    const config = await this.config();

    // Mentre un tentativo lavora non se ne chiede un altro: si pagherebbe due volte lo stesso luogo.
    const latest = this.store.images(locationId).attempts[0];
    if (latest?.status === 'queued' || latest?.status === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'images' } });
    }

    const options = await this.troupe.options(
      ROLE,
      await this.requestFor(project, location, config, 0),
    );
    const chosen =
      body.modelId === undefined
        ? (options.find((option) => option.isDefault) ?? options[0])
        : options.find((option) => option.modelId === body.modelId);
    // Il servizio scelto è un requisito: se non è adatto non si passa a un altro (D36).
    if (chosen === undefined)
      throw domainError(409, 'no_eligible_model', { details: { role: ROLE } });

    const connectionId = config.models[chosen.modelId]?.connection;
    if (connectionId === undefined) {
      throw domainError(422, 'config_invalid', { details: { modelId: chosen.modelId } });
    }
    await enforceSpend(
      this.spend,
      {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      },
      {
        role: ROLE,
        connectionId,
        modelId: chosen.modelId,
        estimatedCostUsd: chosen.estimatedCostUsd,
      },
    );

    const attempt = this.store.startAttempt(locationId);
    const payload: LocationJobPayload = {
      projectId,
      locationId,
      attempt,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.queue.enqueue({
      kind: LOCATION_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${LOCATION_JOB_KIND}:${locationId}:${String(attempt)}`,
    });
    this.runner.wake();
    return this.store.images(locationId);
  }

  images(projectId: string, locationId: string): LocationImages {
    this.target(projectId, locationId);
    return this.store.images(locationId);
  }

  /** «Scegli questa»: l'immagine deve essere di un tentativo di quel luogo. */
  choose(projectId: string, locationId: string, assetId: string): LocationImages {
    this.target(projectId, locationId);
    const known = this.store
      .images(locationId)
      .attempts.some(
        (attempt) => attempt.status === 'succeeded' && attempt.assetIds.includes(assetId),
      );
    if (!known) throw domainError(409, 'invalid_request', { details: { field: 'assetId' } });

    this.store.choose(locationId, assetId);
    return this.store.images(locationId);
  }

  /**
   * Il lavoro in coda: una chiamata che dà più immagini. Un errore si scrive sul tentativo e il
   * lavoro finisce lo stesso: un altro tentativo lo chiede l'utente.
   */
  private async makeImages(rawPayload: unknown): Promise<void> {
    const payload = locationJobPayloadSchema.parse(rawPayload);
    const { projectId, locationId, attempt } = payload;

    const project = this.projects.get(projectId);
    const location = this.store.get(locationId);
    if (location === undefined) {
      // Il luogo è stato tolto mentre il lavoro aspettava: non c'è più niente da fare.
      this.log.warn('Immagini richieste per un luogo che non c’è più: lavoro lasciato perdere.');
      return;
    }

    try {
      this.store.finishAttempt(locationId, attempt, { status: 'running' });
      const config = await this.config();
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));
      const request = await this.requestFor(project, location, config, attempt);
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
      });
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Immagini del set fallite: ${errorCode}.`);
      this.store.finishAttempt(locationId, attempt, { status: 'failed', errorCode });
    }
  }

  /**
   * La richiesta al servizio: il prompt è un modello di testo (nessun LLM, §4.4) che parte dal
   * `prompt` in inglese del luogo e dallo stile del film. Quante immagini lo dice la configurazione
   * del ruolo, e finisce nella richiesta perché la stima conti tutte le immagini.
   */
  private async requestFor(
    project: Project,
    location: Location,
    config: TroupeConfig,
    attempt: number,
  ): Promise<MediaRequest> {
    const style = config.presets.styles.find((preset) => preset.id === project.style);
    if (style === undefined) {
      throw domainError(422, 'config_invalid', { details: { field: 'style' } });
    }

    const configured = config.roles[ROLE]?.params?.variants;
    const variants = typeof configured === 'number' ? configured : FALLBACK_VARIANTS;
    const loaded = await this.configSource.load();
    const prompt = await renderImagePrompt({
      instructions: this.instructions,
      role: ROLE,
      releaseRef: config.roles[ROLE]?.instructions,
      userRef: loaded.settings?.roleSettings[ROLE]?.instructions,
      input: { location, style, moodboard: null },
    });

    return {
      role: ROLE,
      prompt,
      inputs: [],
      characterIds: [],
      params: { variants },
      idempotencyKey: `${location.id}:images:${String(attempt)}`,
    };
  }

  /** I luoghi che l'ultima bozza della storia propone. */
  private proposals(projectId: string) {
    return this.screenplays.latest(projectId, 'draft')?.screenplay.locations ?? [];
  }

  private locationOf(projectId: string, locationId: string): Location {
    const location = this.store.list(projectId).find((candidate) => candidate.id === locationId);
    if (location === undefined) throw domainError(404, 'not_found', { details: { field: 'id' } });
    return location;
  }

  private target(projectId: string, locationId: string) {
    const project = this.projects.get(projectId);
    return { project, location: this.locationOf(projectId, locationId) };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

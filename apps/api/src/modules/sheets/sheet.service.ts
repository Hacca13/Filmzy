import path from 'node:path';

import {
  SHEET_ANGLES,
  sheetJobPayloadSchema,
  type Character,
  type CharacterSheet,
  type ModelOption,
  type Project,
  type SheetAngle,
  type SheetJobPayload,
  type SheetOptions,
  type StartSheetBody,
} from '@filmzy/contracts';
import { projectsDir, type CharacterStore, type JobQueue, type SheetStore } from '@filmzy/db';
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
import { CHARACTER_STORE, SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR, JOB_QUEUE } from '../database/database.module.js';
import { INSTRUCTIONS_SOURCE } from '../instructions/tokens.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { registerAssets, renderImagePrompt, waitForMedia } from '../media/image-jobs.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';

const ROLE = 'character_designer';

/** La richiesta di un lavoro di immagine, senza il servizio: lo sceglie chi la manda (D36). */
type MediaRequest = Parameters<MediaRunner['submit']>[1];

/** Il tipo di lavoro in coda che fa le tre immagini di una scheda. */
export const SHEET_JOB_KIND = 'character_sheet';

/**
 * Le schede dei personaggi (T3.6, D18): tre immagini su fondo neutro (fronte, profilo, tre quarti)
 * per ogni tentativo. Le immagini sono un lavoro in coda (regola d'oro 9) e i file si copiano subito
 * nella cartella del film (regola 11). L'utente vede la stima prima, sceglie il servizio («Cambia
 * servizio», D36) e, sopra un limite di spesa, decide se proseguire (D30): il controllo avviene
 * **prima** di mettere in coda, perché un lavoro in coda non può chiedere conferma a nessuno.
 *
 * Un'immagine che fallisce non ferma le altre: ogni angolazione ha il suo esito, e l'utente decide
 * se chiedere un altro tentativo (nessuna riserva automatica, regola 6).
 */
@Injectable()
export class SheetService implements OnModuleInit {
  private readonly log = new Logger('Schede');

  constructor(
    @Inject(SHEET_STORE) private readonly sheets: SheetStore,
    @Inject(CHARACTER_STORE) private readonly characters: CharacterStore,
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
    this.runner.register(SHEET_JOB_KIND, (job) => this.makeSheet(job.payload));
  }

  /** I servizi tra cui scegliere, con la stima **dell'intera scheda**. */
  async options(projectId: string, characterId: string): Promise<SheetOptions> {
    const { project, character } = this.target(projectId, characterId);
    const config = await this.config();
    const request = await this.requestFor(project, character, config, 'front', 0);
    const options = await this.troupe.options(ROLE, request);
    return { options: options.map((option) => wholeSheet(option)) };
  }

  /** «Crea la scheda»: controlla servizio e limiti di spesa, poi mette in coda un tentativo. */
  async start(
    projectId: string,
    characterId: string,
    body: StartSheetBody,
  ): Promise<CharacterSheet> {
    const { project, character } = this.target(projectId, characterId);
    const config = await this.config();

    const current = this.sheets.get(characterId);
    if (current.attempts[0]?.images.some((image) => isOpen(image.status)) === true) {
      throw domainError(409, 'invalid_request', { details: { field: 'sheet' } });
    }

    const request = await this.requestFor(project, character, config, 'front', 0);
    const options = (await this.troupe.options(ROLE, request)).map((option) => wholeSheet(option));
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

    const attempt = this.sheets.startAttempt(characterId);
    const payload: SheetJobPayload = {
      projectId,
      characterId,
      attempt,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.queue.enqueue({
      kind: SHEET_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${SHEET_JOB_KIND}:${characterId}:${String(attempt)}`,
    });
    this.runner.wake();
    return this.sheets.get(characterId);
  }

  get(projectId: string, characterId: string): CharacterSheet {
    this.target(projectId, characterId);
    return this.sheets.get(characterId);
  }

  /** «Blocca il volto»: il tentativo scelto deve avere tutte e tre le immagini pronte. */
  lock(projectId: string, characterId: string, attempt: number): CharacterSheet {
    this.target(projectId, characterId);
    const found = this.sheets.get(characterId).attempts.find((item) => item.attempt === attempt);
    const complete =
      found?.images.length === SHEET_ANGLES.length &&
      found.images.every((image) => image.status === 'succeeded');
    if (!complete) throw domainError(409, 'invalid_request', { details: { field: 'attempt' } });

    this.sheets.lock(characterId, attempt);
    return this.sheets.get(characterId);
  }

  unlock(projectId: string, characterId: string): CharacterSheet {
    this.target(projectId, characterId);
    this.sheets.lock(characterId, undefined);
    return this.sheets.get(characterId);
  }

  /**
   * Il lavoro in coda: le tre angolazioni insieme, ognuna col suo esito. Un errore su un'immagine si
   * scrive su quella immagine e non ferma le altre; il lavoro intero non fallisce (non c'è niente da
   * riprovare da soli: un altro tentativo lo chiede l'utente).
   */
  private async makeSheet(rawPayload: unknown): Promise<void> {
    const payload = sheetJobPayloadSchema.parse(rawPayload);
    const { projectId, characterId, attempt } = payload;

    const project = this.projects.get(projectId);
    const character = this.characters.list(projectId).find((item) => item.id === characterId);
    if (character === undefined) {
      // Il personaggio è stato tolto mentre il lavoro aspettava: non c'è più niente da fare.
      this.log.warn(
        'Scheda richiesta per un personaggio che non c’è più: lavoro lasciato perdere.',
      );
      return;
    }

    const config = await this.config();
    const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'immagini'));

    await Promise.all(
      SHEET_ANGLES.map((angle) =>
        this.makeImage({ payload, project, character, config, media, angle }).catch(
          (error: unknown) => {
            const errorCode = error instanceof ProviderError ? error.code : 'unknown';
            this.log.warn(`Immagine della scheda fallita: ${errorCode}.`);
            this.sheets.update(characterId, attempt, angle, { status: 'failed', errorCode });
          },
        ),
      ),
    );
  }

  private async makeImage(args: {
    payload: SheetJobPayload;
    project: Project;
    character: Character;
    config: TroupeConfig;
    media: MediaRunner;
    angle: SheetAngle;
  }): Promise<void> {
    const { payload, project, character, config, media, angle } = args;
    const { characterId, attempt } = payload;

    this.sheets.update(characterId, attempt, angle, { status: 'running' });
    const request = await this.requestFor(project, character, config, angle, attempt);
    const job = await media.submit(ROLE, request, {
      purpose: 'product',
      projectId: project.id,
      modelId: payload.modelId,
      ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
    });

    const { assets, receipt } = await waitForMedia(media, job.receiptId);
    const asset = assets[0];
    if (asset === undefined) {
      throw new ProviderError(
        'invalid_output',
        false,
        'Il servizio non ha restituito nessuna immagine.',
      );
    }
    registerAssets(
      this.sheets,
      { dataDir: this.dataDir, projectId: project.id, generationId: receipt.id },
      [asset],
    );
    this.sheets.update(characterId, attempt, angle, {
      status: 'succeeded',
      assetId: asset.assetId,
      receiptId: receipt.id,
    });
  }

  /**
   * La richiesta al servizio per un'angolazione: il prompt è un modello di testo (nessun LLM,
   * §4.4), con l'aspetto del personaggio e lo stile del film. Le istruzioni sono quelle scelte per
   * il ruolo («Chi fa cosa») o, in mancanza, quelle della release.
   */
  private async requestFor(
    project: Project,
    character: Character,
    config: TroupeConfig,
    angle: SheetAngle,
    attempt: number,
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
      input: { character, style, angle, moodboard: null },
    });

    return {
      role: ROLE,
      prompt,
      inputs: [],
      characterIds: [],
      params: {},
      idempotencyKey: `${character.id}:sheet:${String(attempt)}:${angle}`,
    };
  }

  private target(projectId: string, characterId: string) {
    const project = this.projects.get(projectId);
    const character = this.characters.list(projectId).find((item) => item.id === characterId);
    if (character === undefined) throw domainError(404, 'not_found', { details: { field: 'id' } });
    return { project, character };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

const isOpen = (status: string): boolean => status === 'queued' || status === 'running';

/** `troupe.options` stima **una** immagine: la scheda ne vuole tre, e l'utente deve vedere il totale. */
function wholeSheet(option: ModelOption): ModelOption {
  return { ...option, estimatedCostUsd: option.estimatedCostUsd * SHEET_ANGLES.length };
}

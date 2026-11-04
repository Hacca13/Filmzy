import { rm } from 'node:fs/promises';
import path from 'node:path';

import {
  audioJobPayloadSchema,
  composerInputSchema,
  sfxArtistInputSchema,
  type AudioClip,
  type AudioJobPayload,
  type AudioOverview,
  type ChooseAudioVariantBody,
  type CreateAudioClipBody,
  type Project,
  type SheetOptions,
  type SoundSuggestions,
  type SoundSuggestionsEstimate,
  type SoundPlannerInput,
  type SuggestSoundsBody,
  type StartSheetBody,
  type UploadAudioQuery,
} from '@filmzy/contracts';
import { projectsDir, type AudioStore, type SheetStore, type ShotStore } from '@filmzy/db';
import { videoDurationS } from '@filmzy/media';
import {
  LocalAssetStore,
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
import { ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { sceneIdOf } from '../shots/plan-shots.js';
import { ShotsService } from '../shots/shots.service.js';
import { shotOf } from '../shots/shot-access.js';
import { SHOT_STORE } from '../shots/tokens.js';
import { STALE_WORK_MS } from '../shots/work.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { readAudioBody } from './audio-file.js';
import { settleCues } from './sound-cues.js';
import { AUDIO_STORE } from './tokens.js';

/** Il tipo di lavoro in coda che genera una variante. */
export const AUDIO_JOB_KIND = 'audio_generate';

/** Chi fa cosa e quale funzione lo accende, per ogni tipo di clip che si genera. */
const GENERATED = {
  music: { role: 'composer', feature: 'music' },
  sfx: { role: 'sfx_artist', feature: 'sound_effects' },
} as const;

type GeneratedKind = keyof typeof GENERATED;

const isGenerated = (kind: string): kind is GeneratedKind => kind in GENERATED;

/**
 * Musica ed effetti (T5.5, D24, architettura §5.5). La musica sta su una scena, un effetto su
 * un'inquadratura; ogni «Genera» è una variante, fatta da un servizio che l'utente può scegliere e che
 * è un requisito (D36). La prima variante riuscita diventa quella in uso; le altre si scelgono a mano.
 *
 * Il suono non tocca mai il video: cambiare variante o togliere una clip non rifà niente. La descrizione
 * la scrive l'utente, quindi passa dal moderatore prima di ogni spesa; stima e limiti si controllano
 * **prima** di mettere in coda; il file si copia subito nella cartella del film (regola 11); un lavoro
 * ripetuto su una variante già chiusa non rifà niente (regola 10).
 */
@Injectable()
export class AudioService implements OnModuleInit {
  private readonly log = new Logger('Audio');
  /** I film per cui il sound designer sta scrivendo: un doppio clic non paga due volte. */
  private readonly suggesting = new Set<string>();

  constructor(
    @Inject(AUDIO_STORE) private readonly store: AudioStore,
    @Inject(SHOT_STORE) private readonly shots: ShotStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(INSTRUCTIONS_SOURCE) private readonly instructions: InstructionsSource,
    @Inject(SPEND_LEDGER) private readonly spend: SpendGuard,
    @Inject(MEDIA_RUNNER_FACTORY) private readonly mediaFor: (dir: string) => MediaRunner,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly screenplays: ScreenplayService,
    private readonly moderation: ModerationService,
    private readonly plans: ShotsService,
  ) {}

  onModuleInit(): void {
    this.runner.register(AUDIO_JOB_KIND, (job) => this.makeVariant(job.payload));
  }

  overview(projectId: string): AudioOverview {
    this.projects.get(projectId);
    const clips = this.store.clips(projectId);
    for (const clip of clips) this.closeLost(clip);
    return { tracks: this.store.tracks(projectId), clips: this.store.clips(projectId) };
  }

  /** Una clip nuova, ancora senza file: «Genera» è un passo a parte, perché costa. */
  async createClip(projectId: string, body: CreateAudioClipBody): Promise<AudioClip> {
    this.projects.get(projectId);
    const config = await this.config();
    if (!config.features[GENERATED[body.kind].feature]) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
    this.assertPlace(projectId, body);

    const clip = this.store.createClip({
      projectId,
      kind: body.kind,
      sceneId: body.sceneId,
      ...(body.shotId === undefined ? {} : { shotId: body.shotId }),
      ...(body.startS === undefined ? {} : { startS: body.startS }),
      durationS: body.durationS,
      description: body.description,
      ...(body.mood === undefined ? {} : { mood: body.mood }),
      source: 'generated',
    });
    this.projects.reach(projectId, 'sound');
    return clip;
  }

  /**
   * Un file dell'utente (D27): diventa una clip con una variante sola, già in uso. La durata la legge
   * ffmpeg dal file. Non chiama nessun servizio: la clip non si può nemmeno generare, e la descrizione
   * resta qui. Il nome sul disco lo decide il codice (il checksum). Un file che non si riesce a leggere
   * non resta sul disco.
   */
  async upload(projectId: string, query: UploadAudioQuery, body: unknown): Promise<AudioClip> {
    this.projects.get(projectId);
    this.assertPlace(projectId, query);
    const { bytes, contentType } = readAudioBody(body);

    const stored = await new LocalAssetStore(
      path.join(projectsDir(this.dataDir), projectId, 'caricate'),
    ).put({ fileName: 'audio', contentType, bytes });
    const existed = this.files.getAsset(stored.assetId) !== undefined;
    try {
      const durationS = await mediaStep(() => videoDurationS(stored.path));
      if (durationS === undefined || durationS <= 0) {
        throw domainError(400, 'invalid_request', { details: { field: 'file' } });
      }
      registerAssets(this.files, { dataDir: this.dataDir, projectId }, [stored]);
      const clip = this.store.createClip({
        projectId,
        kind: query.kind,
        sceneId: query.sceneId,
        ...(query.shotId === undefined ? {} : { shotId: query.shotId }),
        ...(query.startS === undefined ? {} : { startS: query.startS }),
        durationS,
        description: query.description,
        source: 'uploaded',
      });
      const variant = this.store.startVariant(clip.id, {});
      this.store.finishVariant(variant.id, { status: 'succeeded', assetId: stored.assetId });
      this.store.chooseVariant(clip.id, variant.id);
      this.projects.reach(projectId, 'sound');
      return this.clipOf(projectId, clip.id);
    } catch (error) {
      // Senza il suo record il file non serve a nessuno; se era già di un'altra clip, resta.
      if (!existed) await rm(stored.path, { force: true });
      throw error;
    }
  }

  /** I servizi tra cui scegliere, con la stima. Una durata che nessuno regge dà un elenco vuoto. */
  async options(projectId: string, clipId: string): Promise<SheetOptions> {
    const { clip, kind } = this.generatedClip(projectId, clipId);
    return { options: await this.pricedOptions(clip, kind) };
  }

  /** «Genera»: limiti di spesa, moderatore, poi una variante in coda. */
  async start(projectId: string, clipId: string, body: StartSheetBody): Promise<AudioClip> {
    const project = this.projects.get(projectId);
    const { clip, kind } = this.generatedClip(projectId, clipId);
    const config = await this.config();
    const chosen = await chooseMediaService({
      role: GENERATED[kind].role,
      options: await this.pricedOptions(clip, kind),
      body,
      config,
      spend: this.spend,
      projectId,
    });
    await this.moderation.assertAllowed({
      text: clip.description,
      context: 'sound',
      language: project.language,
      projectId,
    });

    // Due richieste insieme (un doppio clic) si pagherebbero due volte. Il controllo sta qui, dopo le
    // attese e subito prima di aprire la variante, senza altre attese in mezzo.
    if (this.isWorking(clipId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'variants' } });
    }
    const variant = this.store.startVariant(clipId, {
      modelId: chosen.modelId,
      modelLabel: chosen.label,
    });
    const payload: AudioJobPayload = {
      projectId,
      clipId,
      variantId: variant.id,
      modelId: chosen.modelId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    };
    this.runner.enqueue({
      kind: AUDIO_JOB_KIND,
      payload,
      projectId,
      idempotencyKey: `${AUDIO_JOB_KIND}:${variant.id}`,
    });
    return this.clipOf(projectId, clipId);
  }

  /** «Cambia»: la variante da usare. Deve essere pronta e di questa clip. Il video non cambia. */
  chooseVariant(projectId: string, clipId: string, body: ChooseAudioVariantBody): AudioClip {
    this.projects.get(projectId);
    const clip = this.clipOf(projectId, clipId);
    const variant = clip.variants.find((candidate) => candidate.id === body.variantId);
    if (variant?.status !== 'succeeded') {
      throw domainError(409, 'invalid_request', { details: { field: 'variantId' } });
    }
    this.store.chooseVariant(clipId, variant.id);
    return this.clipOf(projectId, clipId);
  }

  /** «Elimina»: toglie la clip e le sue varianti. I video e i file restano. */
  removeClip(projectId: string, clipId: string): AudioOverview {
    this.projects.get(projectId);
    this.clipOf(projectId, clipId);
    this.store.removeClip(clipId);
    return this.overview(projectId);
  }

  /** Quanto costerebbe chiedere le proposte, senza chiamare nessuno (D30). */
  async estimateSuggestions(projectId: string): Promise<SoundSuggestionsEstimate> {
    const { input } = await this.plannerInput(projectId);
    return { estimate: await this.troupe.estimate('sound_planner', input) };
  }

  /**
   * «Suggerisci i suoni» (D24): il sound designer legge la stesura e le inquadrature e propone. Non si
   * salva niente: l'utente accetta o scarta ogni proposta, e accettarla crea una clip da generare.
   */
  async suggest(projectId: string, body: SuggestSoundsBody): Promise<SoundSuggestions> {
    if (this.suggesting.has(projectId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'suggestions' } });
    }
    this.suggesting.add(projectId);
    try {
      const { input, scenes, allowed } = await this.plannerInput(projectId);
      const { data } = await this.troupe.run('sound_planner', input, {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      });
      return { suggestions: settleCues(data.cues, scenes, allowed) };
    } finally {
      this.suggesting.delete(projectId);
    }
  }

  private async plannerInput(projectId: string) {
    const project = this.projects.get(projectId);
    const config = await this.config();
    const allowed = { music: config.features.music, sfx: config.features.sound_effects };
    if (!allowed.music && !allowed.sfx) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
    const { scenes } = await this.plans.plans(projectId);
    const final = this.screenplays.latest(projectId, 'final');
    const input: SoundPlannerInput = {
      screenplay: final.screenplay,
      scenes: final.screenplay.scenes.map((scene) => ({ ...scene, id: sceneIdOf(scene.number) })),
      // Solo le inquadrature di un piano che vale: quelle di una scena da rifare spariranno.
      shots: scenes.filter((scene) => !scene.stale).flatMap((scene) => scene.shots),
      ...filmPresets(project, config),
      language: project.language,
    };
    return { input, scenes, allowed };
  }

  /**
   * Il lavoro in coda. Un errore si scrive sulla variante e il lavoro finisce lo stesso: un'altra la
   * chiede l'utente, e nessun altro servizio viene provato da solo (regola 6).
   */
  private async makeVariant(rawPayload: unknown): Promise<void> {
    const payload = audioJobPayloadSchema.parse(rawPayload);
    const { projectId, clipId, variantId } = payload;

    const stored = this.store.getClip(clipId);
    const variant = stored?.clip.variants.find((candidate) => candidate.id === variantId);
    if (stored === undefined || variant === undefined) {
      this.log.warn('Variante chiesta per una clip che non c’è più: lavoro lasciato perdere.');
      return;
    }
    if (variant.status === 'succeeded' || variant.status === 'failed') return;
    if (!isGenerated(stored.clip.kind)) return;
    const role = GENERATED[stored.clip.kind].role;

    try {
      this.store.finishVariant(variantId, { status: 'running' });
      const prompt = await this.promptFor(stored.clip, stored.clip.kind, projectId);
      const media = this.mediaFor(path.join(projectsDir(this.dataDir), projectId, 'audio'));
      const job = await media.submit(
        role,
        {
          role,
          prompt,
          inputs: [],
          characterIds: [],
          durationS: stored.clip.durationS,
          params: {},
          idempotencyKey: `${clipId}:audio:${variantId}`,
        },
        {
          purpose: 'product',
          projectId,
          modelId: payload.modelId,
          ...(payload.spendConfirmed === true ? { spendConfirmed: true } : {}),
        },
      );

      const { assets, receipt } = await waitForMedia(media, job.receiptId);
      const file = assets[0];
      if (file === undefined) {
        throw new ProviderError('invalid_output', false, 'Il servizio non ha restituito il suono.');
      }
      registerAssets(this.files, { dataDir: this.dataDir, projectId, generationId: receipt.id }, [
        file,
      ]);
      // La clip può essere stata tolta mentre il servizio lavorava: il file resta, la scelta no.
      const saved = this.store.finishVariant(variantId, {
        status: 'succeeded',
        assetId: file.assetId,
        receiptId: receipt.id,
        modelId: receipt.modelId,
        modelLabel: receipt.modelLabel,
        ...(receipt.actualCostUsd === undefined ? {} : { costUsd: receipt.actualCostUsd }),
      });
      if (saved && this.store.getClip(clipId)?.clip.chosenVariantId === undefined) {
        this.store.chooseVariant(clipId, variantId);
      }
    } catch (error) {
      const errorCode = error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Variante fallita: ${errorCode}.`);
      this.store.finishVariant(variantId, { status: 'failed', errorCode });
    }
  }

  /** Il prompt è un modello di testo, senza LLM: la descrizione arriva così com'è (D24). */
  private async promptFor(
    clip: AudioClip,
    kind: GeneratedKind,
    projectId: string,
  ): Promise<string> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) {
      throw new ProviderError('config_invalid', true, 'La configurazione non si è caricata.');
    }
    const role = GENERATED[kind].role;
    return renderImagePrompt({
      instructions: this.instructions,
      role,
      releaseRef: loaded.config.roles[role]?.instructions,
      userRef: loaded.settings?.roleSettings[role]?.instructions,
      input:
        kind === 'music'
          ? musicInput(clip, this.projects.get(projectId), loaded.config)
          : sfxArtistInputSchema.parse({
              cue: { description: clip.description, durationS: clip.durationS },
              variants: 1,
            }),
    });
  }

  private pricedOptions(clip: AudioClip, kind: GeneratedKind) {
    const role = GENERATED[kind].role;
    return this.troupe.options(role, {
      role,
      // Solo per scegliere e stimare: conta la durata, e non viene mai inviato.
      prompt: clip.description,
      inputs: [],
      characterIds: [],
      durationS: clip.durationS,
      params: {},
      idempotencyKey: `${clip.id}:stima`,
    });
  }

  /** La scena c'è nella stesura finale; un effetto sta su un'inquadratura di quella scena, entro la sua durata. */
  private assertPlace(
    projectId: string,
    body: Pick<CreateAudioClipBody, 'sceneId' | 'shotId' | 'startS'>,
  ): void {
    const final = this.screenplays.latest(projectId, 'final');
    if (!final.screenplay.scenes.some((scene) => sceneIdOf(scene.number) === body.sceneId)) {
      throw domainError(404, 'not_found', { details: { field: 'sceneId' } });
    }
    if (body.shotId === undefined) return;

    const { spec } = shotOf(this.shots, projectId, body.shotId);
    if (spec.sceneId !== body.sceneId) {
      throw domainError(400, 'invalid_request', { details: { field: 'shotId' } });
    }
    if ((body.startS ?? 0) >= spec.intent.durationS) {
      throw domainError(400, 'invalid_request', { details: { field: 'startS' } });
    }
  }

  private clipOf(projectId: string, clipId: string): AudioClip {
    const stored = this.store.getClip(clipId);
    if (stored?.projectId !== projectId) {
      throw domainError(404, 'not_found', { details: { field: 'clipId' } });
    }
    return stored.clip;
  }

  /** Solo la musica e gli effetti si generano: un file caricato ha la sua variante e basta (D27). */
  private generatedClip(
    projectId: string,
    clipId: string,
  ): { clip: AudioClip; kind: GeneratedKind } {
    const clip = this.clipOf(projectId, clipId);
    if (clip.source !== 'generated' || !isGenerated(clip.kind)) {
      throw domainError(409, 'invalid_request', { details: { field: 'source' } });
    }
    return { clip, kind: clip.kind };
  }

  private isWorking(clipId: string): boolean {
    const stored = this.store.getClip(clipId);
    if (stored === undefined) return false;
    this.closeLost(stored.clip);
    return (this.store.getClip(clipId)?.clip.variants ?? []).some(
      (variant) => variant.status === 'queued' || variant.status === 'running',
    );
  }

  /** Una variante rimasta a metà da troppo tempo si è persa: si chiude, o bloccherebbe per sempre la clip. */
  private closeLost(clip: AudioClip): void {
    const now = Date.now();
    for (const variant of clip.variants) {
      const open = variant.status === 'queued' || variant.status === 'running';
      if (open && now - Date.parse(variant.createdAt) > STALE_WORK_MS) {
        this.store.finishVariant(variant.id, { status: 'failed', errorCode: 'timeout' });
      }
    }
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

/** Genere, tono e stile del film come li leggono i ruoli: un genere o un tono tolto dal catalogo resta col suo id. */
function filmPresets(project: Project, config: TroupeConfig) {
  const style = config.presets.styles.find((preset) => preset.id === project.style);
  if (style === undefined) {
    throw new ProviderError('config_invalid', false, 'Lo stile del film non è nel catalogo.');
  }
  return {
    genre: config.presets.genres.find((genre) => genre.id === project.genre) ?? {
      id: project.genre,
      label: project.genre,
    },
    tone: config.presets.tones.find((tone) => tone.id === project.tone) ?? {
      id: project.tone,
      label: project.tone,
    },
    style,
  };
}

/** Cosa legge il compositore: senza un'atmosfera scritta, vale il tono del film. */
function musicInput(clip: AudioClip, project: Project, config: TroupeConfig) {
  return composerInputSchema.parse({
    cue: {
      description: clip.description,
      mood: clip.mood ?? project.tone,
      durationS: clip.durationS,
    },
    ...filmPresets(project, config),
  });
}

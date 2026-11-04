import { rm } from 'node:fs/promises';
import path from 'node:path';

import {
  audioJobPayloadSchema,
  composerInputSchema,
  sfxArtistInputSchema,
  type AudioClip,
  type AudioJobPayload,
  type AudioOverview,
  type AudioTimeline,
  type ChooseAudioVariantBody,
  type CreateAudioClipBody,
  type Project,
  type SheetOptions,
  type SoundSuggestions,
  type SoundSuggestionsEstimate,
  type SoundPlannerInput,
  type SetTakeNativeAudioBody,
  type SuggestSoundsBody,
  type StartSheetBody,
  type UpdateAudioClipBody,
  type UpdateAudioTrackBody,
  type UploadAudioQuery,
} from '@filmzy/contracts';
import {
  projectsDir,
  type AudioStore,
  type SheetStore,
  type ShotStore,
  type TakeStore,
} from '@filmzy/db';
import { audioDurationS, hasAudioStream } from '@filmzy/media';
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
import { BibleService } from '../bible/bible.service.js';
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
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { sceneIdOf } from '../shots/plan-shots.js';
import { ShotsService } from '../shots/shots.service.js';
import { assertPlanCurrent, shotOf } from '../shots/shot-access.js';
import { SHOT_STORE, TAKE_STORE } from '../shots/tokens.js';
import { STALE_WORK_MS } from '../shots/work.js';
import { CONFIG_SOURCE, MEDIA_RUNNER_FACTORY, SPEND_LEDGER, TROUPE } from '../troupe/tokens.js';
import { readAudioBody } from './audio-file.js';
import { settleCues } from './sound-cues.js';
import { buildTimeline, sceneLengthS } from './timeline.js';
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
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
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
    private readonly bible: BibleService,
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

  /** La linea del tempo del film (T5.6): le inquadrature in fila, con il take che finirà nel film. */
  async timeline(projectId: string): Promise<AudioTimeline> {
    const { scenes } = await this.plans.plans(projectId);
    return buildTimeline(scenes, this.takes.keptTakes(projectId), this.store.clips(projectId));
  }

  updateTrack(projectId: string, trackId: string, body: UpdateAudioTrackBody): AudioOverview {
    this.projects.get(projectId);
    if (!this.store.updateTrack(projectId, trackId, body)) {
      throw domainError(404, 'not_found', { details: { field: 'trackId' } });
    }
    return this.overview(projectId);
  }

  /**
   * L'audio originale di un take (D24, D43). Accenderlo su una clip senza suono non servirebbe a niente:
   * lo si dice subito. Chi lo accende vuole sentirlo, quindi si riapre anche la traccia, che parte muta.
   */
  async setNativeAudio(
    projectId: string,
    takeId: string,
    body: SetTakeNativeAudioBody,
  ): Promise<AudioOverview> {
    this.projects.get(projectId);
    const found = this.takes.get(takeId);
    const shot = found === undefined ? undefined : this.shots.get(found.shotId);
    if (found === undefined || shot?.projectId !== projectId) {
      throw domainError(404, 'not_found', { details: { field: 'takeId' } });
    }
    if (body.on) {
      const { assetId } = found.take;
      const clip = assetId === undefined ? undefined : assetFile(this.files, this.dataDir, assetId);
      if (clip === undefined) throw domainError(404, 'not_found', { details: { field: 'takeId' } });
      if (!(await mediaStep(() => hasAudioStream(clip.file)))) {
        throw domainError(409, 'invalid_request', { details: { field: 'nativeAudio' } });
      }
    }
    // Mentre ffmpeg leggeva, il piano può essere stato rifatto: il take non c'è più.
    if (!this.takes.setNativeAudio(takeId, body.on)) {
      throw domainError(404, 'not_found', { details: { field: 'takeId' } });
    }
    if (body.on) {
      const native = this.store.tracks(projectId).find((track) => track.kind === 'native');
      if (native?.muted === true) this.store.updateTrack(projectId, native.id, { muted: false });
    }
    return this.overview(projectId);
  }

  /**
   * Il pannello del blocco (T5.6): com'è il suono e dove parte. Non tocca le varianti già fatte: valgono
   * dal prossimo «Genera». La musica parte con la scena, e un file caricato dura quanto il file.
   */
  updateClip(projectId: string, clipId: string, body: UpdateAudioClipBody): AudioClip {
    this.projects.get(projectId);
    const clip = this.clipOf(projectId, clipId);
    if (body.startS !== undefined) {
      if (clip.kind === 'music') {
        throw domainError(400, 'invalid_request', { details: { field: 'startS' } });
      }
      this.assertPlace(projectId, { ...clip, startS: body.startS });
    }
    if (body.durationS !== undefined && clip.source !== 'generated') {
      throw domainError(409, 'invalid_request', { details: { field: 'source' } });
    }
    this.store.updateClip(clipId, body);
    return this.clipOf(projectId, clipId);
  }

  /** Una clip nuova, ancora senza file: «Genera» è un passo a parte, perché costa. */
  async createClip(projectId: string, body: CreateAudioClipBody): Promise<AudioClip> {
    this.projects.get(projectId);
    const config = await this.config();
    if (!config.features[GENERATED[body.kind].feature]) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
    this.assertPlace(projectId, body);
    if (body.kind === 'music') this.assertNoMusicYet(projectId, body.sceneId);

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
    if (query.kind === 'music') this.assertNoMusicYet(projectId, query.sceneId);
    return this.keepFile(projectId, body, (assetId, durationS) =>
      this.store.createUploadedClip(
        {
          projectId,
          kind: query.kind,
          sceneId: query.sceneId,
          ...(query.shotId === undefined ? {} : { shotId: query.shotId }),
          ...(query.startS === undefined ? {} : { startS: query.startS }),
          durationS,
          description: query.description,
          source: 'uploaded',
        },
        assetId,
      ),
    );
  }

  /**
   * «Carica un file» su un blocco che c'è già (T5.6): è una variante come le altre, subito in uso, e il
   * blocco dura quanto il file. Vale la regola di sempre, il file resta qui (D27), e le varianti generate
   * restano da scegliere. Su un blocco che ha perso il suo posto non servirebbe: non si sentirebbe.
   */
  async uploadVariant(projectId: string, clipId: string, body: unknown): Promise<AudioClip> {
    this.projects.get(projectId);
    this.assertPlace(projectId, this.clipOf(projectId, clipId));
    return this.keepFile(projectId, body, (assetId, durationS) => {
      this.store.addUploadedVariant(clipId, assetId, durationS);
      return this.clipOf(projectId, clipId);
    });
  }

  /**
   * Salva un file dell'utente e lo legge: se non c'è un suono o qualcosa va storto, non resta sul disco
   * (a meno che fosse già di un'altra clip). Il nome sul disco è il checksum.
   */
  private async keepFile(
    projectId: string,
    body: unknown,
    save: (assetId: string, durationS: number) => AudioClip,
  ): Promise<AudioClip> {
    const { bytes, contentType } = readAudioBody(body);

    const stored = await new LocalAssetStore(
      path.join(projectsDir(this.dataDir), projectId, 'caricate'),
    ).put({ fileName: 'audio', contentType, bytes });
    const existed = this.files.getAsset(stored.assetId) !== undefined;
    try {
      const durationS = await mediaStep(() => audioDurationS(stored.path));
      if (durationS === undefined || durationS <= 0) {
        throw domainError(400, 'invalid_request', { details: { field: 'audioFile' } });
      }
      registerAssets(this.files, { dataDir: this.dataDir, projectId }, [stored]);
      const clip = save(stored.assetId, durationS);
      this.projects.reach(projectId, 'sound');
      return clip;
    } catch (error) {
      // Senza il suo record il file non serve a nessuno; se era già di un'altra clip, resta. Se non si
      // riesce a toglierlo l'utente deve comunque leggere il motivo vero, non questo.
      if (!existed) {
        await rm(stored.path, { force: true }).catch(() => {
          this.log.warn('Un file caricato non si è potuto togliere dal disco.');
        });
      }
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
    if (!config.features[GENERATED[kind].feature]) {
      throw domainError(409, 'invalid_request', { details: { field: 'feature' } });
    }
    // La stesura può essere cambiata da quando la clip è nata: non si paga per un posto che non c'è più.
    this.assertPlace(projectId, clip);
    const chosen = await chooseMediaService({
      role: GENERATED[kind].role,
      options: await this.pricedOptions(clip, kind),
      body,
      config,
      spend: this.spend,
      projectId,
    });
    // Anche l'atmosfera la scrive l'utente, e finisce nel prompt.
    await this.moderation.assertAllowed({
      text: clip.mood === undefined ? clip.description : `${clip.description}\n${clip.mood}`,
      context: 'sound',
      language: project.language,
      projectId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
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
    try {
      this.runner.enqueue({
        kind: AUDIO_JOB_KIND,
        payload,
        projectId,
        idempotencyKey: `${AUDIO_JOB_KIND}:${variant.id}`,
      });
    } catch (error) {
      // Senza un lavoro la variante resterebbe in coda e bloccherebbe la clip.
      this.store.finishVariant(variant.id, { status: 'failed', errorCode: 'unknown' });
      throw error;
    }
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
      const withMusic = this.store
        .clips(projectId)
        .filter((clip) => clip.kind === 'music')
        .map((clip) => clip.sceneId);
      return { suggestions: settleCues(data.cues, scenes, allowed, withMusic) };
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
    // Già partita e il programma si è chiuso: il servizio può aver già lavorato, e il suo lavoro è perso.
    // Rimandarla si pagherebbe due volte (regola 10): si chiude, e un'altra la chiede l'utente.
    if (variant.status === 'running') {
      this.log.warn('Variante interrotta da un riavvio: non si rimanda da sola.');
      this.store.finishVariant(variantId, { status: 'failed', errorCode: 'timeout' });
      return;
    }
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

  /** Un blocco di musica per scena (D24): per cambiarla si cambia la variante, o si toglie la clip. */
  private assertNoMusicYet(projectId: string, sceneId: string): void {
    const taken = this.store
      .clips(projectId)
      .some((clip) => clip.kind === 'music' && clip.sceneId === sceneId);
    if (taken) throw domainError(409, 'invalid_request', { details: { field: 'music' } });
  }

  /**
   * Il posto di una clip: la scena c'è nella stesura finale e si parte dentro la sua durata; un'inquadratura
   * è di quella scena, con un piano che vale ancora, perché rifarlo toglierebbe l'effetto già pagato.
   */
  private assertPlace(
    projectId: string,
    body: Pick<CreateAudioClipBody, 'sceneId' | 'shotId' | 'startS'>,
  ): void {
    const final = this.screenplays.latest(projectId, 'final');
    const scene = final.screenplay.scenes.find(({ number }) => sceneIdOf(number) === body.sceneId);
    if (scene === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'sceneId' } });
    }
    const startS = body.startS ?? 0;
    if (body.shotId === undefined) {
      // Lo stesso criterio della linea del tempo: altrimenti una voce accettata qui finirebbe fuori scena.
      const planned = this.shots.plan(projectId, scene.number)?.shots ?? [];
      if (startS >= sceneLengthS(planned, scene.durationS)) {
        throw domainError(400, 'invalid_request', { details: { field: 'startS' } });
      }
      return;
    }

    const stored = shotOf(this.shots, projectId, body.shotId);
    if (stored.spec.sceneId !== body.sceneId) {
      throw domainError(400, 'invalid_request', { details: { field: 'shotId' } });
    }
    if (startS >= stored.spec.intent.durationS) {
      throw domainError(400, 'invalid_request', { details: { field: 'startS' } });
    }
    assertPlanCurrent({
      store: this.shots,
      screenplays: this.screenplays,
      known: this.bible.knownIds(projectId),
      projectId,
      stored,
    });
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

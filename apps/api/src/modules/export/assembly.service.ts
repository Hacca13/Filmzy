import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  JOB_INTERRUPTED,
  assemblyJobPayloadSchema,
  type AssemblyScene,
  type AssemblyTitles,
  type AssemblyView,
  type AudioClip,
  type AudioTrack,
  type FilmAssembly,
  type ScenePlan,
} from '@filmzy/contracts';
import {
  projectsDir,
  type AssemblyStore,
  type AudioStore,
  type KeptTake,
  type SceneChoiceStore,
  type SheetStore,
  type StoredAssembly,
  type TakeStore,
} from '@filmzy/db';
import {
  MediaError,
  audioDurationS,
  concatClips,
  evenSize,
  hasAudioStream,
  mixSounds,
  muxFilm,
  normalizeClip,
  renderTitleCard,
  videoDurationS,
  videoSize,
  type FilmFormat,
  type MixSound,
} from '@filmzy/media';
import { ProviderError } from '@filmzy/troupe';
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { buildTimeline, sceneGap, sceneLengthS, tickedScenes } from '../audio/timeline.js';
import { AUDIO_STORE, SCENE_CHOICES } from '../audio/tokens.js';
import { BibleService } from '../bible/bible.service.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { registerAssets } from '../media/image-jobs.js';
import { moveIntoPlace } from '../media/move-file.js';
import { existingAssetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { sceneIdOf } from '../shots/plan-shots.js';
import { ShotsService } from '../shots/shots.service.js';
import { TAKE_STORE } from '../shots/tokens.js';
import { isLostWork, isOpenStatus } from '../shots/work.js';
import {
  earlierFilmName,
  failureReason,
  fileErrorCode,
  filmAssetId,
  removeEntries,
} from './export-files.js';
import { ExportService } from './export.service.js';
import { LEVEL_OF, heardClips, planMix, type SoundFile } from './mix-plan.js';
import { ASSEMBLY_STORE } from './tokens.js';

/** Il tipo di lavoro in coda che monta il film. */
export const ASSEMBLY_JOB_KIND = 'film_assemble';

/** La dicitura nei titoli di coda: c'è di default (D28). */
const AI_NOTICE = 'Contiene contenuti generati con intelligenza artificiale';

const OPENING_S = 3;
const CLOSING_S = 5;
const FILM_FPS = 24;

/** Il prefisso delle cartelle di lavoro: una per ogni giro, per riconoscerle e toglierle. */
const WORK_PREFIX = 'lavoro-';

/** Quello che finisce nel film in questo momento. */
interface Snapshot {
  /** Solo le scene spuntate: le altre non entrano nel film, e nemmeno i loro suoni (D85). */
  scenes: ScenePlan[];
  /** Tutte le scene, per l'elenco. */
  rows: AssemblyScene[];
  plannedDurationS: number;
  kept: Record<string, KeptTake>;
  tracks: AudioTrack[];
  clips: AudioClip[];
  titles: AssemblyTitles;
  fingerprint: string;
}

/**
 * Il montaggio (T5.7, architettura §9): normalizza i take scelti togliendo l'audio originale salvo che
 * l'utente l'abbia acceso, li incolla, mixa le tracce e aggiunge i titoli con la dicitura AI. Non chiama
 * nessun fornitore, quindi non costa e si può rifare; dopo un riavvio però non riparte da solo, come ogni
 * altro lavoro (D84). Il film finisce nella cartella del film.
 */
@Injectable()
export class AssemblyService implements OnModuleInit {
  private readonly log = new Logger('Montaggio');

  constructor(
    @Inject(ASSEMBLY_STORE) private readonly store: AssemblyStore,
    @Inject(AUDIO_STORE) private readonly audio: AudioStore,
    @Inject(SCENE_CHOICES) private readonly sceneChoices: SceneChoiceStore,
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly plans: ShotsService,
    private readonly bible: BibleService,
    private readonly exports: ExportService,
  ) {}

  onModuleInit(): void {
    this.runner.register(
      ASSEMBLY_JOB_KIND,
      (job) => this.makeFilm(job.payload),
      (job) => this.closeInterrupted(job.payload),
    );
  }

  /**
   * Il programma si è chiuso prima della fine: si chiude, e un altro montaggio lo chiede l'utente (D84). I
   * pezzi a metà pesano quanto il film: si tolgono subito, perché il lavoro non ripartirà a farlo.
   */
  private async closeInterrupted(rawPayload: unknown): Promise<void> {
    const { projectId, assemblyId } = assemblyJobPayloadSchema.parse(rawPayload);
    if (isOpenStatus(this.store.get(assemblyId)?.assembly.status)) {
      this.store.finish(assemblyId, { status: 'failed', errorCode: JOB_INTERRUPTED });
    }
    await this.removeLeftovers(path.join(projectsDir(this.dataDir), projectId, 'montaggio'));
  }

  async view(projectId: string): Promise<AssemblyView> {
    return this.viewOf(projectId, await this.snapshot(projectId));
  }

  /** La spunta di una scena (D85): togliere non cancella niente, e una scena senza video non si spunta. */
  async setSceneIncluded(
    projectId: string,
    sceneNumber: number,
    included: boolean,
  ): Promise<AssemblyView> {
    const { rows } = await this.snapshot(projectId);
    const row = rows.find((candidate) => candidate.sceneNumber === sceneNumber);
    if (row === undefined) throw domainError(404, 'not_found');
    if (included && row.gap !== undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'sceneNotReady' } });
    }
    this.assertNotMounting(projectId);
    this.sceneChoices.setIncluded(projectId, sceneNumber, included);
    return this.view(projectId);
  }

  /** «Monta il film»: controlla che ci sia almeno una scena, poi mette in coda. Non costa niente. */
  async start(projectId: string): Promise<AssemblyView> {
    const snapshot = await this.snapshot(projectId);
    if (snapshot.scenes.length === 0) {
      throw domainError(409, 'invalid_request', { details: { field: 'assembly' } });
    }
    // Il controllo sta qui, dopo le attese e subito prima di aprire il tentativo: un doppio clic ne apre uno.
    this.assertNotMounting(projectId);
    // Un lavoro alla volta per film: ricodificare usa già tutti i processori.
    if (this.exports.isWorking(projectId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'exportWorking' } });
    }

    const assembly = this.store.start(projectId, snapshot.fingerprint);
    try {
      this.runner.enqueue({
        kind: ASSEMBLY_JOB_KIND,
        payload: { projectId, assemblyId: assembly.id },
        projectId,
        idempotencyKey: `${ASSEMBLY_JOB_KIND}:${assembly.id}`,
      });
    } catch (error) {
      // Senza un lavoro il tentativo resterebbe aperto e bloccherebbe il pulsante.
      this.store.finish(assembly.id, { status: 'failed', errorCode: 'unknown' });
      throw error;
    }
    this.projects.reach(projectId, 'export');
    return this.viewOf(projectId, snapshot);
  }

  /** L'ultimo tentativo e l'ultimo film riuscito: uno che fallisce non nasconde quello buono. */
  private async viewOf(projectId: string, snapshot: Snapshot): Promise<AssemblyView> {
    this.closeLost(projectId);
    const latest = this.store.latest(projectId);
    const [film, ...others] = this.store.succeeded(projectId);
    return {
      scenes: snapshot.rows,
      filmDurationS: snapshot.rows.reduce(
        (total, { included, durationS }) => (included ? total + durationS : total),
        0,
      ),
      plannedDurationS: snapshot.plannedDurationS,
      ...(latest === undefined ? {} : { latest: latest.assembly }),
      ...(film === undefined ? {} : { film: film.assembly }),
      earlier: await this.earlierFilms(film, others),
      upToDate: film?.fingerprint === snapshot.fingerprint,
      exportWorking: this.exports.isWorking(projectId),
      titles: snapshot.titles,
    };
  }

  /**
   * I film montati prima dell'ultimo che ci sono ancora sul disco (D87). Rifare un film identico riusa lo
   * stesso file: si mostra una volta sola, e mai se è l'ultimo.
   */
  private async earlierFilms(
    film: StoredAssembly | undefined,
    others: readonly StoredAssembly[],
  ): Promise<FilmAssembly[]> {
    const current = film?.assembly.assetId;
    const seen = new Set(current === undefined ? [] : [current]);
    const candidates = others.flatMap(({ assembly }) => {
      if (assembly.assetId === undefined || seen.has(assembly.assetId)) return [];
      seen.add(assembly.assetId);
      return [{ assembly, assetId: assembly.assetId }];
    });
    const found = await Promise.all(
      candidates.map(({ assetId }) => existingAssetFile(this.files, this.dataDir, assetId)),
    );
    return candidates.flatMap(({ assembly }, index) =>
      found[index] === undefined ? [] : [assembly],
    );
  }

  /** Dov'è un film già montato, per salvarne una copia. Altrimenti «non trovato». */
  async filmFile(projectId: string, assemblyId: string): Promise<{ file: string; name: string }> {
    const { file, createdAt } = await this.storedFilm(projectId, assemblyId);
    return { file, name: earlierFilmName(this.projects.get(projectId).title, new Date(createdAt)) };
  }

  /**
   * «Togli» su un film di prima: solo l'utente toglie un film (D87). L'ultimo non si toglie: è quello che si
   * vede e si esporta. Non mentre si monta: rifare un film identico riusa lo stesso file. Se un programma lo
   * tiene aperto il sistema può non lasciarlo togliere, e lo si dice.
   */
  async removeEarlier(projectId: string, assemblyId: string): Promise<void> {
    const { file, assetId } = await this.storedFilm(projectId, assemblyId);
    if (assetId === this.store.lastSucceeded(projectId)?.assembly.assetId) {
      throw domainError(409, 'invalid_request', { details: { field: 'currentFilm' } });
    }
    this.assertNotMounting(projectId);
    try {
      await rm(file, { force: true });
    } catch (error) {
      this.log.warn(
        `Il film di prima non si è potuto togliere: ${failureReason(error, this.dataDir)}.`,
      );
      throw domainError(409, 'media_failed', {
        retryable: true,
        details: { field: 'earlierFilm' },
      });
    }
  }

  private async storedFilm(
    projectId: string,
    assemblyId: string,
  ): Promise<{ file: string; assetId: string; createdAt: string }> {
    this.projects.get(projectId);
    const stored = this.store.get(assemblyId);
    const assetId = stored?.projectId === projectId ? stored.assembly.assetId : undefined;
    const file =
      assetId === undefined
        ? undefined
        : await existingAssetFile(this.files, this.dataDir, assetId);
    if (stored === undefined || assetId === undefined || file === undefined) {
      throw domainError(404, 'not_found');
    }
    return { file, assetId, createdAt: stored.assembly.createdAt };
  }

  private assertNotMounting(projectId: string): void {
    this.closeLost(projectId);
    if (isOpenStatus(this.store.latest(projectId)?.assembly.status)) {
      throw domainError(409, 'invalid_request', { details: { field: 'assemblyWorking' } });
    }
  }

  /** Il lavoro in coda: un errore si scrive sul tentativo, e il lavoro finisce lo stesso. */
  private async makeFilm(rawPayload: unknown): Promise<void> {
    const { projectId, assemblyId } = assemblyJobPayloadSchema.parse(rawPayload);
    const stored = this.store.get(assemblyId);
    if (stored === undefined) {
      this.log.warn(
        'Montaggio richiesto per un tentativo che non c’è più: lavoro lasciato perdere.',
      );
      return;
    }
    if (stored.assembly.status === 'succeeded' || stored.assembly.status === 'failed') return;

    const filmDir = path.join(projectsDir(this.dataDir), projectId, 'montaggio');
    // Una cartella per ogni giro: quella di un giro interrotto può essere ancora in uso da un ffmpeg
    // sopravvissuto, e Windows non la lascerebbe togliere.
    const workDir = path.join(filmDir, `${WORK_PREFIX}${randomUUID()}`);
    try {
      this.store.finish(assemblyId, { status: 'running' });
      await mkdir(workDir, { recursive: true });
      await this.removeLeftovers(filmDir, workDir);

      const snapshot = await this.snapshot(projectId);
      if (snapshot.scenes.length === 0) {
        // Qualcosa è cambiato mentre il lavoro aspettava: l'utente rilegge cosa manca e rifà.
        throw new ProviderError('invalid_request', false, 'Non c’è nessuna scena da montare.');
      }
      // Da qui vale ciò che si monta davvero, non ciò che c'era quando è stato chiesto.
      this.store.finish(assemblyId, { status: 'running', fingerprint: snapshot.fingerprint });
      const beat = () => {
        this.store.finish(assemblyId, { status: 'running' });
      };
      const { assetId, durationS } = await this.assemble(
        { projectId, snapshot, workDir, filmDir },
        beat,
      );
      this.store.finish(assemblyId, { status: 'succeeded', assetId, durationS });
    } catch (error) {
      const errorCode =
        error instanceof MediaError || error instanceof ProviderError
          ? error.code
          : fileErrorCode(error);
      this.log.warn(`Montaggio fallito: ${failureReason(error, this.dataDir)}.`);
      this.store.finish(assemblyId, { status: 'failed', errorCode });
    } finally {
      // I pezzi intermedi pesano quanto il film: non restano, qualunque cosa sia successa.
      await rm(workDir, { recursive: true, force: true }).catch(() => {
        this.log.warn('La cartella di lavoro del montaggio non si è potuta togliere.');
      });
    }
  }

  /** Le cartelle di giri interrotti: si tolgono se si può, e se sono ancora in uso resteranno al prossimo giro. */
  private removeLeftovers(filmDir: string, current?: string): Promise<void> {
    return removeEntries(
      filmDir,
      (name) => name.startsWith(WORK_PREFIX) && path.join(filmDir, name) !== current,
    );
  }

  private async assemble(
    place: { projectId: string; snapshot: Snapshot; workDir: string; filmDir: string },
    beat: () => void,
  ): Promise<{ assetId: string; durationS: number }> {
    const { projectId, snapshot, workDir, filmDir } = place;
    const { scenes, kept, tracks, clips, titles } = snapshot;
    const shots = scenes.flatMap((scene) => scene.shots);
    const inputs = new Map<string, string>();
    for (const shot of shots) inputs.set(shot.id, await this.keptFile(kept[shot.id]));

    const firstInput = inputs.get(shots[0]?.id ?? '');
    const format = firstInput === undefined ? undefined : filmFormat(await videoSize(firstInput));
    if (format === undefined)
      throw new MediaError('ffmpeg_failed', 'La prima clip non è un video.');
    const native = tracks.find(({ kind }) => kind === 'native');
    const nativeHeard = native !== undefined && !native.muted && native.volume > 0;

    const pieces = ['apertura.mp4'];
    await renderTitleCard({
      output: 'apertura.mp4',
      workDir,
      format,
      durationS: OPENING_S,
      lines: [{ text: titles.title, scale: 0.09 }],
    });

    // Una clip alla volta: la ricodifica usa già tutti i processori.
    const realS = new Map<string, number>();
    let anyNative = false;
    for (const [index, shot] of shots.entries()) {
      const input = inputs.get(shot.id);
      if (input === undefined) throw new ProviderError('not_found', false, 'Manca un video.');
      const keepAudio =
        nativeHeard && kept[shot.id]?.nativeAudio === true && (await hasAudioStream(input));
      anyNative ||= keepAudio;
      const piece = `clip-${String(index)}.mp4`;
      const output = path.join(workDir, piece);
      await normalizeClip({ input, output, format, keepAudio });
      realS.set(shot.id, (await videoDurationS(output)) ?? shot.intent.durationS);
      pieces.push(piece);
      beat();
    }

    await renderTitleCard({
      output: 'chiusura.mp4',
      workDir,
      format,
      durationS: CLOSING_S,
      lines: [
        { text: titles.title, scale: 0.07 },
        ...(titles.cast === undefined ? [] : [{ text: titles.cast, scale: 0.045 }]),
        { text: titles.aiNotice, scale: 0.035 },
      ],
    });
    pieces.push('chiusura.mp4');
    await concatClips({ inputs: pieces, output: 'video.mp4', workDir });
    beat();

    // Le posizioni si rifanno con le durate vere: un video più lungo del previsto non sposta i suoni dopo.
    const timeline = buildTimeline(withRealDurations(scenes, realS), kept, clips);
    const totalS = OPENING_S + timeline.durationS + CLOSING_S;
    const video = path.join(workDir, 'video.mp4');
    const sounds: MixSound[] = planMix({
      timeline,
      clips,
      tracks,
      files: await this.soundFiles(heardClips(clips, tracks, timeline)),
      offsetS: OPENING_S,
    });
    if (nativeHeard && anyNative) {
      // L'audio dei take sta già nel video, al suo posto: entra nel mix come una traccia.
      sounds.push({
        file: video,
        startS: 0,
        durationS: totalS,
        volume: native.volume,
        fadeInS: 0,
        fadeOutS: 0,
        levelLufs: LEVEL_OF.native,
      });
    }

    const finished = path.join(workDir, 'film.mp4');
    if (sounds.length === 0) {
      await muxFilm({ video, output: finished });
    } else {
      const mix = path.join(workDir, 'mix.m4a');
      await mixSounds({ sounds, durationS: totalS, output: mix, workDir });
      await muxFilm({ video, audio: mix, output: finished });
    }

    const durationS = (await videoDurationS(finished)) ?? totalS;
    const assetId = await this.keepFilm(projectId, finished, filmDir);
    return { assetId, durationS };
  }

  /**
   * Il film resta nella cartella del film, col nome che viene dal suo contenuto (regola 11). Se c'è
   * già vuol dire che è identico: si tiene quello, che il lettore può avere aperto e Windows non lo
   * lascerebbe sostituire.
   */
  private async keepFilm(projectId: string, file: string, filmDir: string): Promise<string> {
    const checksum = await checksumOf(file);
    const assetId = filmAssetId(projectId, checksum);
    const target = path.join(filmDir, `${assetId}.mp4`);
    const existing = await stat(target).catch(() => undefined);
    if (existing === undefined) await moveIntoPlace(file, target);
    const { size } = await stat(target);
    registerAssets(this.files, { dataDir: this.dataDir, projectId }, [
      { assetId, path: target, contentType: 'video/mp4', bytes: size, checksum },
    ]);
    return assetId;
  }

  /** Il file in uso di ogni suono che si sente, con la sua durata vera: serve a sapere quanto si può sentire. */
  private async soundFiles(clips: readonly AudioClip[]): Promise<Record<string, SoundFile>> {
    const entries = await Promise.all(
      clips.map(async (clip): Promise<[string, SoundFile]> => {
        const variant = clip.variants.find(({ id }) => id === clip.chosenVariantId);
        const file = await this.existingFile(variant?.assetId);
        const durationS = await audioDurationS(file);
        if (durationS === undefined) {
          throw new MediaError('ffmpeg_failed', 'Un suono in uso non ha una durata leggibile.');
        }
        return [clip.id, { file, durationS }];
      }),
    );
    return Object.fromEntries(entries);
  }

  private keptFile(take: KeptTake | undefined): Promise<string> {
    return this.existingFile(take?.assetId);
  }

  /** Dov'è un file del film. Se non c'è più si ferma con il motivo. */
  private async existingFile(assetId: string | undefined): Promise<string> {
    const file =
      assetId === undefined
        ? undefined
        : await existingAssetFile(this.files, this.dataDir, assetId);
    if (file === undefined) {
      throw new ProviderError('not_found', false, 'Un file del film non c’è più.');
    }
    return file;
  }

  /** Cosa finirebbe nel film adesso, con le scene spuntate. */
  private async snapshot(projectId: string): Promise<Snapshot> {
    const project = this.projects.get(projectId);
    const { scenes: allScenes } = await this.plans.plans(projectId);
    const kept = this.takes.keptTakes(projectId);
    const excluded = this.sceneChoices.excluded(projectId);
    const scenes = tickedScenes(allScenes, kept, excluded);
    const tracks = this.audio.tracks(projectId);
    // Solo i suoni delle scene del film: cambiarne uno di una scena tolta non rende indietro il film.
    const sceneIds = new Set(scenes.map(({ sceneNumber }) => sceneIdOf(sceneNumber)));
    const clips = this.audio.clips(projectId).filter(({ sceneId }) => sceneIds.has(sceneId));
    const names = castOf(scenes, this.bible.knownIds(projectId).names.characters);
    const titles: AssemblyTitles = {
      title: project.title,
      ...(names.length === 0 ? {} : { cast: `Con ${joinNames(names)}` }),
      aiNotice: AI_NOTICE,
    };
    return {
      scenes,
      rows: sceneRows(allScenes, kept, scenes),
      plannedDurationS: project.durationS,
      kept,
      tracks,
      clips,
      titles,
      fingerprint: fingerprintOf({ scenes, kept, tracks, clips, titles }),
    };
  }

  /**
   * Un tentativo fermo da troppo tempo si è perso: si chiude, o bloccherebbe il pulsante. Conta l'ultimo
   * segno di vita, non la partenza: un montaggio lungo è vivo.
   */
  private closeLost(projectId: string): void {
    const stored = this.store.latest(projectId);
    if (stored === undefined) return;
    const { status, id } = stored.assembly;
    const open = status === 'queued' || status === 'running';
    if (open && isLostWork(stored.lastActivityAt)) {
      this.store.finish(id, { status: 'failed', errorCode: 'timeout' });
    }
  }
}

/** Il formato del film: quello della prima clip, con misure pari. Senza misura non è un video. */
function filmFormat(size: { width: number; height: number } | undefined): FilmFormat | undefined {
  return size === undefined
    ? undefined
    : { width: evenSize(size.width), height: evenSize(size.height), fps: FILM_FPS };
}

/**
 * Chi nominare nei titoli: chi si vede nel film, non chi sta in una scena tolta. Finché nessuna scena è nel
 * film sono tutti, così i titoli si leggono già prima.
 */
export function castOf(
  scenes: readonly ScenePlan[],
  names: Readonly<Record<string, string>>,
): string[] {
  if (scenes.length === 0) return Object.values(names);
  const seen = new Set(
    scenes.flatMap((scene) =>
      scene.shots.flatMap((shot) => shot.characters.map(({ characterId }) => characterId)),
    ),
  );
  return Object.entries(names).flatMap(([id, name]) => (seen.has(id) ? [name] : []));
}

/** L'elenco «Le scene del film»: tutte le scene nell'ordine della storia, con cosa manca a ognuna. */
export function sceneRows(
  scenes: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
  ticked: readonly ScenePlan[],
): AssemblyScene[] {
  return scenes.map((scene) => {
    const gap = sceneGap(scene, kept);
    const preview = scene.shots[0] === undefined ? undefined : kept[scene.shots[0].id]?.assetId;
    return {
      sceneNumber: scene.sceneNumber,
      heading: scene.heading,
      durationS: sceneLengthS(scene.shots, scene.durationS),
      ...(preview === undefined ? {} : { previewAssetId: preview }),
      included: ticked.includes(scene),
      ...(gap === undefined ? {} : { gap }),
    };
  });
}

function withRealDurations(
  scenes: readonly ScenePlan[],
  realS: ReadonlyMap<string, number>,
): ScenePlan[] {
  return scenes.map((scene) => ({
    ...scene,
    shots: scene.shots.map((shot) => ({
      ...shot,
      intent: { ...shot.intent, durationS: realS.get(shot.id) ?? shot.intent.durationS },
    })),
  }));
}

/** «Anna», «Anna e Marco», «Anna, Marco e Lia». */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

/**
 * L'impronta di ciò che entra nel film: se cambia, il film montato è indietro. Ci sono solo le cose che
 * si sentono o si vedono: una descrizione o una variante non scelta non cambiano il film.
 */
function fingerprintOf(args: {
  scenes: readonly ScenePlan[];
  kept: Readonly<Record<string, KeptTake>>;
  tracks: readonly AudioTrack[];
  clips: readonly AudioClip[];
  titles: AssemblyTitles;
}): string {
  const { scenes, kept, tracks, clips, titles } = args;
  const content = {
    shots: scenes.flatMap((scene) =>
      scene.shots.map((shot) => [shot.id, kept[shot.id]?.assetId, kept[shot.id]?.nativeAudio]),
    ),
    tracks: tracks.map(({ kind, muted, volume }) => [kind, muted, volume]),
    clips: clips.map((clip) => [
      clip.id,
      clip.sceneId,
      clip.shotId,
      clip.startS,
      clip.durationS,
      clip.volume,
      clip.variants.find(({ id }) => id === clip.chosenVariantId)?.assetId,
    ]),
    titles,
  };
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/** Il checksum di un file, senza caricarlo tutto in memoria: un film pesa. */
function checksumOf(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(hash.digest('hex'));
      });
  });
}

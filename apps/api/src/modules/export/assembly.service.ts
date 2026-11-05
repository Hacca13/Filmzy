import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  assemblyJobPayloadSchema,
  type AssemblyGap,
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
  type SheetStore,
  type TakeStore,
} from '@filmzy/db';
import {
  MediaError,
  audioDurationS,
  concatClips,
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
import { buildTimeline } from '../audio/timeline.js';
import { AUDIO_STORE } from '../audio/tokens.js';
import { BibleService } from '../bible/bible.service.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { DATA_DIR } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { registerAssets } from '../media/image-jobs.js';
import { assetFile } from '../media/references.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ShotsService } from '../shots/shots.service.js';
import { TAKE_STORE } from '../shots/tokens.js';
import { STALE_WORK_MS } from '../shots/work.js';
import { planMix, type SoundFile } from './mix-plan.js';
import { ASSEMBLY_STORE } from './tokens.js';

/** Il tipo di lavoro in coda che monta il film. */
export const ASSEMBLY_JOB_KIND = 'film_assemble';

/** La dicitura nei titoli di coda: c'è di default (D28). */
const AI_NOTICE = 'Contiene contenuti generati con intelligenza artificiale';

const OPENING_S = 3;
const CLOSING_S = 5;

/** La misura del film se nessun video la dice: non dovrebbe succedere, ma il montaggio non si ferma per questo. */
const FALLBACK_SIZE = { width: 1280, height: 720 };
const FILM_FPS = 24;

/** Le misure devono essere pari: il formato video più comune non ne accetta altre. */
const even = (value: number): number => value - (value % 2);

/** Quello che finisce nel film in questo momento. */
interface Snapshot {
  scenes: ScenePlan[];
  gaps: AssemblyGap[];
  kept: Record<string, KeptTake>;
  tracks: AudioTrack[];
  clips: AudioClip[];
  titles: AssemblyTitles;
  fingerprint: string;
}

/**
 * Il montaggio (T5.7, architettura §9): normalizza i take scelti togliendo l'audio originale salvo che
 * l'utente l'abbia acceso, li incolla, mixa le tracce e aggiunge i titoli con la dicitura AI. Non chiama
 * nessun fornitore, quindi non costa e si può rifare: per questo un lavoro ripreso dopo un riavvio
 * riparte da capo, senza i controlli che servono dove si paga. Il film finisce nella cartella del film.
 */
@Injectable()
export class AssemblyService implements OnModuleInit {
  private readonly log = new Logger('Montaggio');

  constructor(
    @Inject(ASSEMBLY_STORE) private readonly store: AssemblyStore,
    @Inject(AUDIO_STORE) private readonly audio: AudioStore,
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
    @Inject(SHEET_STORE) private readonly files: SheetStore,
    @Inject(DATA_DIR) private readonly dataDir: string,
    private readonly runner: JobRunner,
    private readonly projects: ProjectsService,
    private readonly plans: ShotsService,
    private readonly bible: BibleService,
  ) {}

  onModuleInit(): void {
    this.runner.register(ASSEMBLY_JOB_KIND, (job) => this.makeFilm(job.payload));
  }

  async view(projectId: string): Promise<AssemblyView> {
    const snapshot = await this.snapshot(projectId);
    this.closeLost(projectId);
    const stored = this.store.latest(projectId);
    return {
      gaps: snapshot.gaps,
      ...(stored === undefined ? {} : { latest: stored.assembly }),
      upToDate:
        stored?.assembly.status === 'succeeded' && stored.fingerprint === snapshot.fingerprint,
      titles: snapshot.titles,
    };
  }

  /** «Monta il film»: controlla che ci sia tutto, poi mette in coda. Non costa niente. */
  async start(projectId: string): Promise<AssemblyView> {
    const snapshot = await this.snapshot(projectId);
    if (snapshot.gaps.length > 0) {
      throw domainError(409, 'invalid_request', { details: { field: 'assembly' } });
    }
    // Il controllo sta qui, dopo le attese e subito prima di aprire il tentativo: un doppio clic ne apre uno.
    this.closeLost(projectId);
    const open = this.store.latest(projectId)?.assembly.status;
    if (open === 'queued' || open === 'running') {
      throw domainError(409, 'invalid_request', { details: { field: 'assemblyWorking' } });
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
    return this.view(projectId);
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
    const workDir = path.join(filmDir, `lavoro-${assemblyId}`);
    try {
      this.store.finish(assemblyId, { status: 'running' });
      // Un lavoro ripreso dopo un riavvio riparte pulito.
      await rm(workDir, { recursive: true, force: true });
      await mkdir(workDir, { recursive: true });

      const snapshot = await this.snapshot(projectId);
      if (snapshot.gaps.length > 0) {
        // Qualcosa è cambiato mentre il lavoro aspettava: l'utente rilegge cosa manca e rifà.
        throw new ProviderError('invalid_request', false, 'Manca qualcosa per montare il film.');
      }
      const { assetId, durationS } = await this.assemble(projectId, snapshot, workDir, filmDir);
      this.store.finish(assemblyId, { status: 'succeeded', assetId, durationS });
    } catch (error) {
      const errorCode =
        error instanceof MediaError || error instanceof ProviderError ? error.code : 'unknown';
      this.log.warn(`Montaggio fallito: ${errorCode}.`);
      this.store.finish(assemblyId, { status: 'failed', errorCode });
    } finally {
      // I pezzi intermedi pesano quanto il film: non restano, qualunque cosa sia successa.
      await rm(workDir, { recursive: true, force: true }).catch(() => {
        this.log.warn('La cartella di lavoro del montaggio non si è potuta togliere.');
      });
    }
  }

  private async assemble(
    projectId: string,
    snapshot: Snapshot,
    workDir: string,
    filmDir: string,
  ): Promise<{ assetId: string; durationS: number }> {
    const { scenes, kept, tracks, clips, titles } = snapshot;
    const shots = scenes.flatMap((scene) => scene.shots);
    const firstClip = this.keptFile(kept[shots[0]?.id ?? '']);
    const format = filmFormat(await videoSize(firstClip));
    const nativeOn = tracks.find(({ kind }) => kind === 'native')?.muted === false;

    // Una clip alla volta: la ricodifica usa già tutti i processori.
    const realS = new Map<string, number>();
    const pieces = ['apertura.mp4'];
    await renderTitleCard({
      output: 'apertura.mp4',
      workDir,
      format,
      durationS: OPENING_S,
      lines: [{ text: titles.title, scale: 0.09 }],
    });
    for (const [index, shot] of shots.entries()) {
      const take = kept[shot.id];
      const input = this.keptFile(take);
      const piece = `clip-${String(index)}.mp4`;
      const output = path.join(workDir, piece);
      await normalizeClip({
        input,
        output,
        format,
        keepAudio: nativeOn && take?.nativeAudio === true && (await hasAudioStream(input)),
      });
      realS.set(shot.id, (await videoDurationS(output)) ?? shot.intent.durationS);
      pieces.push(piece);
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

    // Le posizioni si rifanno con le durate vere: un video più lungo del previsto non sposta i suoni dopo.
    const timeline = buildTimeline(withRealDurations(scenes, realS), kept, clips);
    const totalS = OPENING_S + timeline.durationS + CLOSING_S;
    const video = path.join(workDir, 'video.mp4');
    const sounds: MixSound[] = planMix({
      timeline,
      clips,
      tracks,
      files: await this.soundFiles(clips),
      offsetS: OPENING_S,
    });
    const native = tracks.find(({ kind }) => kind === 'native');
    if (native !== undefined && !native.muted && native.volume > 0) {
      const anyOn = shots.some((shot) => kept[shot.id]?.nativeAudio === true);
      if (anyOn) {
        // L'audio dei take sta già nel video, al suo posto: entra nel mix come una traccia.
        sounds.push({
          file: video,
          startS: 0,
          durationS: totalS,
          volume: native.volume,
          fadeInS: 0,
          fadeOutS: 0,
        });
      }
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

  /** Il film resta nella cartella del film col checksum come nome, come ogni altro file (regola 11). */
  private async keepFilm(projectId: string, file: string, filmDir: string): Promise<string> {
    const checksum = await checksumOf(file);
    const target = path.join(filmDir, `${checksum}.mp4`);
    await rename(file, target);
    const { size } = await stat(target);
    registerAssets(this.files, { dataDir: this.dataDir, projectId }, [
      { assetId: checksum, path: target, contentType: 'video/mp4', bytes: size, checksum },
    ]);
    return checksum;
  }

  /** Il file in uso di ogni clip che ne ha uno, con la sua durata vera: serve a sapere quanto si può sentire. */
  private async soundFiles(clips: readonly AudioClip[]): Promise<Record<string, SoundFile>> {
    const files: Record<string, SoundFile> = {};
    for (const clip of clips) {
      const variant = clip.variants.find(({ id }) => id === clip.chosenVariantId);
      if (variant?.assetId === undefined) continue;
      const found = assetFile(this.files, this.dataDir, variant.assetId);
      if (found === undefined) {
        throw new ProviderError('not_found', false, 'Il file di un suono non c’è più.');
      }
      const durationS = await audioDurationS(found.file);
      if (durationS === undefined) {
        throw new MediaError('ffmpeg_failed', 'Un suono in uso non ha una durata leggibile.');
      }
      files[clip.id] = { file: found.file, durationS };
    }
    return files;
  }

  private keptFile(take: KeptTake | undefined): string {
    const found =
      take === undefined ? undefined : assetFile(this.files, this.dataDir, take.assetId);
    if (found === undefined) {
      throw new ProviderError('not_found', false, 'Il file di un video non c’è più.');
    }
    return found.file;
  }

  /** Cosa finirebbe nel film adesso, e cosa manca ancora. */
  private async snapshot(projectId: string): Promise<Snapshot> {
    const project = this.projects.get(projectId);
    const { scenes } = await this.plans.plans(projectId);
    const kept = this.takes.keptTakes(projectId);
    const tracks = this.audio.tracks(projectId);
    const clips = this.audio.clips(projectId);
    const names = Object.values(this.bible.knownIds(projectId).names.characters);
    const titles: AssemblyTitles = {
      title: project.title,
      ...(names.length === 0 ? {} : { cast: `Con ${joinNames(names)}` }),
      aiNotice: AI_NOTICE,
    };
    return {
      scenes,
      gaps: gapsOf(scenes, kept),
      kept,
      tracks,
      clips,
      titles,
      fingerprint: fingerprintOf({ scenes, kept, tracks, clips, titles }),
    };
  }

  /** Un tentativo rimasto a metà da troppo tempo si è perso: si chiude, o bloccherebbe il pulsante. */
  private closeLost(projectId: string): void {
    const stored = this.store.latest(projectId);
    if (stored === undefined) return;
    const { status, createdAt, id } = stored.assembly;
    const open = status === 'queued' || status === 'running';
    if (open && Date.now() - Date.parse(createdAt) > STALE_WORK_MS) {
      this.store.finish(id, { status: 'failed', errorCode: 'timeout' });
    }
  }
}

/** Il formato del film: quello della prima clip, con misure pari. */
function filmFormat(size: { width: number; height: number } | undefined): FilmFormat {
  const { width, height } = size ?? FALLBACK_SIZE;
  return { width: even(width), height: even(height), fps: FILM_FPS };
}

/** Cosa manca per montare: una scena da pensare, una da rifare, inquadrature senza video. */
export function gapsOf(
  scenes: readonly ScenePlan[],
  kept: Readonly<Record<string, KeptTake>>,
): AssemblyGap[] {
  return scenes.flatMap((scene): AssemblyGap[] => {
    const { sceneNumber } = scene;
    if (!scene.planned || scene.shots.length === 0) return [{ sceneNumber, kind: 'not_planned' }];
    if (scene.stale) return [{ sceneNumber, kind: 'stale' }];
    const missing = scene.shots.filter((shot) => kept[shot.id] === undefined).length;
    return missing === 0 ? [] : [{ sceneNumber, kind: 'no_take', missing }];
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

export type { FilmAssembly };

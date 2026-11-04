import {
  AUDIO_UPLOAD_CONTENT_TYPES,
  AUDIO_UPLOAD_MAX_BYTES,
  type AudioClip,
  type AudioTimeline,
  type AudioTimelineScene,
  type AudioTimelineShot,
  type AudioTrackKind,
  type AudioVariant,
  type CreateAudioClipBody,
} from '@filmzy/contracts';

import { ApiError } from '../../api/client';
import type { SoundEditor } from '../../api/audio';
import { formatEstimate } from '../../lib/format';
import { describeError } from '../../settings/messages';
import { failureText } from '../failure';

/**
 * Le piccole decisioni dell'editor delle tracce (T5.6), fuori dai componenti così si provano a parte.
 * Dove cade un suono e cosa si può fare lo decide il server: qui si dice solo come mostrarlo.
 */

export const TRACK_LABELS: Record<AudioTrackKind, string> = {
  native: 'Video',
  dialogue: 'Dialoghi',
  music: 'Musica',
  sfx: 'Effetti',
};

/** Il testo che accompagna ogni file caricato (D27): si legge prima di scegliere il file. */
export const UPLOAD_NOTE =
  'Il file resta sul tuo computer e non viene inviato a nessun servizio AI. I diritti sul file sono tuoi.';

const MEGABYTE = 1024 * 1024;

/** I tipi che il selettore di file propone: gli stessi che il server accetta. */
export const AUDIO_ACCEPT = AUDIO_UPLOAD_CONTENT_TYPES.join(',');

/** «01:26»: un momento del film, come sul righello. */
export function formatClock(seconds: number): string {
  const rounded = Math.round(seconds);
  const minutes = String(Math.floor(rounded / 60)).padStart(2, '0');
  return `${minutes}:${String(rounded % 60).padStart(2, '0')}`;
}

/** «2 s», «1,5 s»: la durata di un suono. */
export function formatSeconds(seconds: number): string {
  return `${seconds.toLocaleString('it-IT', { maximumFractionDigits: 1 })} s`;
}

/** Quante tacche ha il righello: abbastanza da orientarsi, poche da leggerle tutte. */
const RULER_STEPS = 6;

/** I momenti da scrivere sul righello, dall'inizio alla fine del film. Un film vuoto non ne ha. */
export function rulerMarks(durationS: number): number[] {
  if (durationS <= 0) return [];
  return Array.from({ length: RULER_STEPS + 1 }, (_, step) => (durationS * step) / RULER_STEPS);
}

/** Dove sta un momento sulla traccia, in percentuale: mai fuori dalla traccia. */
export function percentOf(seconds: number, durationS: number): number {
  if (durationS <= 0) return 0;
  return Math.min(100, Math.max(0, (seconds / durationS) * 100));
}

const isOpen = ({ status }: AudioVariant) => status === 'queued' || status === 'running';

/** Qualche suono è in coda o in lavorazione: serve continuare a guardare. */
export function soundIsWorking(editor: SoundEditor): boolean {
  return editor.clips.some((clip) => clip.variants.some(isOpen));
}

/** Questo suono sta lavorando: mentre dura non se ne chiede un altro. */
export function clipIsWorking(clip: AudioClip): boolean {
  return clip.variants.some(isOpen);
}

export function variantInUse(clip: AudioClip): AudioVariant | undefined {
  return clip.variants.find((variant) => variant.id === clip.chosenVariantId);
}

export type BlockState = 'empty' | 'working' | 'failed' | 'ready';

/** Come si presenta un blocco sulla traccia: la variante in uso vince, anche se un'altra sta lavorando. */
export function blockState(clip: AudioClip): BlockState {
  if (clipIsWorking(clip)) return 'working';
  if (variantInUse(clip) !== undefined) return 'ready';
  return clip.variants[0]?.status === 'failed' ? 'failed' : 'empty';
}

const BLOCK_NOTES: Record<BlockState, string | undefined> = {
  empty: 'Da generare',
  working: 'In lavorazione',
  failed: 'Non riuscito',
  ready: undefined,
};

/** La nota del blocco, per chi non vede ancora un suono pronto. */
export function blockNote(clip: AudioClip): string | undefined {
  return BLOCK_NOTES[blockState(clip)];
}

/** Cosa si scrive di una variante: chi l'ha fatta e quanto è costata, o cosa sta succedendo. */
export function variantText(variant: AudioVariant): string {
  switch (variant.status) {
    case 'queued':
      return 'In coda…';
    case 'running':
      return 'Stiamo preparando il tuo suono…';
    case 'failed':
      return soundFailureText(variant.errorCode);
    case 'succeeded':
      if (variant.modelLabel === undefined) return 'Il tuo file';
      return variant.costUsd === undefined
        ? `Fatto con ${variant.modelLabel}`
        : `Fatto con ${variant.modelLabel} · costato ${formatEstimate(variant.costUsd)}`;
  }
}

/** Come ovunque, ma per un rifiuto del contenuto c'è la frase del disegno: si cambia la descrizione. */
export function soundFailureText(code: string | undefined): string {
  return code === 'content_rejected'
    ? 'Questo suono non si può generare così, prova a descriverlo in un altro modo'
    : failureText(code);
}

/** Perché un file non si manda, in parole semplici; `undefined` se può andare. Il server ricontrolla. */
export function audioFileProblem(file: { type: string; size: number }): string | undefined {
  if (!(AUDIO_UPLOAD_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    return 'Questo file non è un suono che posso usare. Vanno bene WAV, MP3 o M4A.';
  }
  if (file.size === 0) return 'Questo file è vuoto.';
  if (file.size > AUDIO_UPLOAD_MAX_BYTES) {
    return `Questo file è troppo grande: arriva fino a ${String(AUDIO_UPLOAD_MAX_BYTES / MEGABYTE)} MB.`;
  }
  return undefined;
}

/** Un file che ffmpeg non sa leggere non è un video: il messaggio di sempre parlerebbe di video. */
export function describeAudioError(error: unknown): string {
  return error instanceof ApiError && error.serverCode === 'media_failed'
    ? 'Non riesco a leggere questo file. Prova con un altro.'
    : describeError(error);
}

/** Le scene che possono prendere una musica: una per scena (D24). */
export function scenesWithoutMusic(
  timeline: AudioTimeline,
  clips: readonly AudioClip[],
): AudioTimelineScene[] {
  const taken = new Set(clips.filter(({ kind }) => kind === 'music').map((clip) => clip.sceneId));
  return timeline.scenes.filter(({ sceneId }) => !taken.has(sceneId));
}

/** Le inquadrature che possono prendere un effetto: quelle di un piano che vale ancora (D81). */
export function shotsForEffects(timeline: AudioTimeline): AudioTimelineShot[] {
  const stale = new Set(timeline.scenes.filter(({ stale }) => stale).map((scene) => scene.sceneId));
  return timeline.shots.filter(({ sceneId }) => !stale.has(sceneId));
}

export function sceneName(timeline: AudioTimeline, sceneId: string): string {
  const scene = timeline.scenes.find((candidate) => candidate.sceneId === sceneId);
  return scene === undefined ? 'Scena che non c’è più' : `Scena ${String(scene.sceneNumber)}`;
}

/** «Scena 1 · Anna guarda l'orologio»: un'inquadratura, come la si riconosce. */
export function shotName(timeline: AudioTimeline, shot: AudioTimelineShot): string {
  return `${sceneName(timeline, shot.sceneId)} · ${shot.action}`;
}

/** «Musica · Scena 1», «Effetto · Scena 2 · Anna apre la porta»: dove andrebbe una proposta. */
export function suggestionPlace(timeline: AudioTimeline, body: CreateAudioClipBody): string {
  if (body.kind === 'music') return `Musica · ${sceneName(timeline, body.sceneId)}`;
  const shot = timeline.shots.find(({ shotId }) => shotId === body.shotId);
  return shot === undefined
    ? `Effetto · ${sceneName(timeline, body.sceneId)}`
    : `Effetto · ${shotName(timeline, shot)}`;
}

import { randomUUID } from 'node:crypto';

import {
  audioClipSchema,
  audioTrackSchema,
  audioVariantSchema,
  type AudioClip,
  type AudioClipSource,
  type AudioTrack,
  type AudioTrackKind,
  type AudioVariant,
  type SheetImageStatus,
} from '@filmzy/contracts';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import {
  audioClips,
  audioTracks,
  audioVariants,
  type AudioClipRow,
  type AudioTrackRow,
  type AudioVariantRow,
} from './schema.js';

/** Una clip nuova, ancora senza file. */
export interface NewAudioClip {
  projectId: string;
  kind: AudioTrackKind;
  sceneId: string;
  shotId?: string;
  startS?: number;
  durationS: number;
  description: string;
  mood?: string;
  source: AudioClipSource;
}

/** Cosa cambia di una clip: quello che manca resta com'è; `mood: null` toglie l'atmosfera. */
export interface AudioClipPatch {
  description?: string;
  mood?: string | null;
  startS?: number;
  durationS?: number;
}

/** Cosa cambia di una traccia: quello che manca resta com'è. */
export interface AudioTrackPatch {
  muted?: boolean;
  volume?: number;
}

/** Il servizio che farà una variante, scelto dall'utente (D36). Manca per un file caricato (D27). */
export interface NewAudioVariant {
  modelId?: string;
  modelLabel?: string;
}

export interface AudioVariantPatch {
  status: SheetImageStatus;
  assetId?: string;
  receiptId?: string;
  costUsd?: number;
  errorCode?: string;
  /** Il servizio che ha lavorato davvero, preso dallo scontrino (D36). */
  modelId?: string;
  modelLabel?: string;
}

export interface StoredAudioClip {
  projectId: string;
  clip: AudioClip;
}

/**
 * Le tracce audio (T5.5, architettura §5.5). Ce n'è una per tipo in ogni film e nascono alla prima
 * lettura; l'audio originale dei take parte muto (D24). Togliere una clip toglie le sue varianti, non
 * i file e niente del video.
 */
export interface AudioStore {
  /** Le tracce del film, nell'ordine di `AUDIO_TRACK_KINDS`; quelle che mancano si creano. */
  tracks: (projectId: string) => AudioTrack[];
  /** Muto e volume; `false` se la traccia non è di quel film. */
  updateTrack: (projectId: string, trackId: string, patch: AudioTrackPatch) => boolean;
  createClip: (clip: NewAudioClip) => AudioClip;
  updateClip: (clipId: string, patch: AudioClipPatch) => void;
  /** Un file dell'utente su una clip che c'è già: diventa una variante, subito in uso, e il blocco dura quanto lui (D27). */
  addUploadedVariant: (clipId: string, assetId: string, durationS: number) => void;
  /** Una clip con il file dell'utente, già pronta e in uso: o tutto o niente (D27). */
  createUploadedClip: (clip: NewAudioClip, assetId: string) => AudioClip;
  getClip: (clipId: string) => StoredAudioClip | undefined;
  /** Le clip del film con le loro varianti, nell'ordine in cui sono nate. */
  clips: (projectId: string) => AudioClip[];
  removeClip: (clipId: string) => void;
  /** Apre una variante in coda per la clip. */
  startVariant: (clipId: string, service: NewAudioVariant) => AudioVariant;
  /** Aggiorna una variante; `false` se non c'è più (la clip è stata tolta). */
  finishVariant: (variantId: string, patch: AudioVariantPatch) => boolean;
  /** La variante con la clip a cui appartiene. */
  getVariant: (variantId: string) => { clipId: string; variant: AudioVariant } | undefined;
  /** La variante in uso, o nessuna con `undefined`. */
  chooseVariant: (clipId: string, variantId: string | undefined) => void;
}

export interface AudioStoreOptions {
  now?: () => Date;
}

/** Le tracce di un film appena nato: l'audio dei take è spento, le altre si sentono. */
const DEFAULT_TRACKS: readonly { kind: AudioTrackKind; muted: boolean }[] = [
  { kind: 'native', muted: true },
  { kind: 'dialogue', muted: false },
  { kind: 'music', muted: false },
  { kind: 'sfx', muted: false },
];

const toTrack = (row: AudioTrackRow): AudioTrack =>
  audioTrackSchema.parse({ id: row.id, kind: row.kind, muted: row.muted, volume: row.volume });

const toVariant = (row: AudioVariantRow): AudioVariant =>
  audioVariantSchema.parse({
    id: row.id,
    status: row.status,
    ...(row.modelId === null ? {} : { modelId: row.modelId }),
    ...(row.modelLabel === null ? {} : { modelLabel: row.modelLabel }),
    ...(row.assetId === null ? {} : { assetId: row.assetId }),
    ...(row.costUsd === null ? {} : { costUsd: row.costUsd }),
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
    createdAt: new Date(row.createdAt).toISOString(),
  });

function toClip(row: AudioClipRow, kind: string | undefined, variants: AudioVariant[]): AudioClip {
  return audioClipSchema.parse({
    id: row.id,
    trackId: row.trackId,
    kind,
    sceneId: row.sceneId,
    ...(row.shotId === null ? {} : { shotId: row.shotId }),
    startS: row.startS,
    durationS: row.durationS,
    volume: row.volume,
    fadeInS: row.fadeInS,
    fadeOutS: row.fadeOutS,
    description: row.description,
    ...(row.mood === null ? {} : { mood: row.mood }),
    ...(row.chosenVariantId === null ? {} : { chosenVariantId: row.chosenVariantId }),
    source: row.source,
    variants,
  });
}

export function createAudioStore(db: FilmzyDb, options: AudioStoreOptions = {}): AudioStore {
  const now = options.now ?? (() => new Date());

  const tracks = (projectId: string): AudioTrack[] => {
    const read = () =>
      db.select().from(audioTracks).where(eq(audioTracks.projectId, projectId)).all();
    let rows = read();
    if (rows.length < DEFAULT_TRACKS.length) {
      db.insert(audioTracks)
        .values(
          DEFAULT_TRACKS.map(({ kind, muted }) => ({
            id: randomUUID(),
            projectId,
            kind,
            muted,
            volume: 1,
          })),
        )
        .onConflictDoNothing()
        .run();
      rows = read();
    }
    const order = DEFAULT_TRACKS.map(({ kind }) => kind as string);
    return rows.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)).map(toTrack);
  };

  const variantsOf = (clipIds: readonly string[]): Map<string, AudioVariant[]> => {
    const grouped = new Map<string, AudioVariant[]>();
    if (clipIds.length === 0) return grouped;
    const rows = db
      .select()
      .from(audioVariants)
      .where(inArray(audioVariants.clipId, [...clipIds]))
      .orderBy(desc(audioVariants.createdAt))
      .all();
    for (const row of rows) {
      grouped.set(row.clipId, [...(grouped.get(row.clipId) ?? []), toVariant(row)]);
    }
    return grouped;
  };

  const trackIdOf = (clip: NewAudioClip): string => {
    const track = tracks(clip.projectId).find((candidate) => candidate.kind === clip.kind);
    if (track === undefined) throw new Error(`Manca la traccia «${clip.kind}» del film.`);
    return track.id;
  };

  const clipValues = (clip: NewAudioClip, trackId: string) => {
    const at = now().getTime();
    return {
      id: randomUUID(),
      projectId: clip.projectId,
      trackId,
      sceneId: clip.sceneId,
      shotId: clip.shotId ?? null,
      startS: clip.startS ?? 0,
      durationS: clip.durationS,
      volume: 1,
      fadeInS: 0,
      fadeOutS: 0,
      description: clip.description,
      mood: clip.mood ?? null,
      chosenVariantId: null,
      source: clip.source,
      createdAt: at,
      updatedAt: at,
    };
  };

  const kindOfTrack = (projectId: string): Map<string, string> =>
    new Map(tracks(projectId).map((track) => [track.id, track.kind]));

  return {
    tracks,

    updateTrack(projectId, trackId, patch) {
      const { changes } = db
        .update(audioTracks)
        .set(patch)
        .where(and(eq(audioTracks.id, trackId), eq(audioTracks.projectId, projectId)))
        .run();
      return changes > 0;
    },

    updateClip(clipId, patch) {
      db.update(audioClips)
        .set({ ...patch, updatedAt: now().getTime() })
        .where(eq(audioClips.id, clipId))
        .run();
    },

    addUploadedVariant(clipId, assetId, durationS) {
      const at = now().getTime();
      const variantId = randomUUID();
      db.transaction((tx) => {
        tx.insert(audioVariants)
          .values({
            id: variantId,
            clipId,
            status: 'succeeded',
            assetId,
            createdAt: at,
            updatedAt: at,
          })
          .run();
        tx.update(audioClips)
          .set({ chosenVariantId: variantId, durationS, updatedAt: at })
          .where(eq(audioClips.id, clipId))
          .run();
      });
    },

    createClip(clip) {
      const row = db
        .insert(audioClips)
        .values(clipValues(clip, trackIdOf(clip)))
        .returning()
        .get();
      return toClip(row, clip.kind, []);
    },

    createUploadedClip(clip, assetId) {
      const trackId = trackIdOf(clip);
      const at = now().getTime();
      const variantId = randomUUID();
      const row = db.transaction((tx) => {
        const created = tx
          .insert(audioClips)
          .values({ ...clipValues(clip, trackId), chosenVariantId: variantId })
          .returning()
          .get();
        tx.insert(audioVariants)
          .values({
            id: variantId,
            clipId: created.id,
            status: 'succeeded',
            assetId,
            createdAt: at,
            updatedAt: at,
          })
          .run();
        return created;
      });
      return toClip(row, clip.kind, variantsOf([row.id]).get(row.id) ?? []);
    },

    getClip(clipId) {
      const row = db.select().from(audioClips).where(eq(audioClips.id, clipId)).get();
      if (row === undefined) return undefined;
      return {
        projectId: row.projectId,
        clip: toClip(
          row,
          kindOfTrack(row.projectId).get(row.trackId),
          variantsOf([clipId]).get(clipId) ?? [],
        ),
      };
    },

    clips(projectId) {
      const rows = db
        .select()
        .from(audioClips)
        .where(eq(audioClips.projectId, projectId))
        .orderBy(asc(audioClips.createdAt))
        .all();
      const kinds = kindOfTrack(projectId);
      const variants = variantsOf(rows.map((row) => row.id));
      return rows.map((row) => toClip(row, kinds.get(row.trackId), variants.get(row.id) ?? []));
    },

    removeClip(clipId) {
      db.transaction((tx) => {
        tx.delete(audioVariants).where(eq(audioVariants.clipId, clipId)).run();
        tx.delete(audioClips).where(eq(audioClips.id, clipId)).run();
      });
    },

    startVariant(clipId, service) {
      const at = now().getTime();
      const row = db
        .insert(audioVariants)
        .values({
          id: randomUUID(),
          clipId,
          status: 'queued',
          modelId: service.modelId ?? null,
          modelLabel: service.modelLabel ?? null,
          createdAt: at,
          updatedAt: at,
        })
        .returning()
        .get();
      return toVariant(row);
    },

    finishVariant(variantId, patch) {
      const changed = db
        .update(audioVariants)
        .set({
          status: patch.status,
          ...(patch.assetId === undefined ? {} : { assetId: patch.assetId }),
          ...(patch.receiptId === undefined ? {} : { receiptId: patch.receiptId }),
          ...(patch.costUsd === undefined ? {} : { costUsd: patch.costUsd }),
          // Un lavoro dato per perso che poi riesce non deve restare con il suo errore.
          errorCode: patch.errorCode ?? null,
          ...(patch.modelId === undefined ? {} : { modelId: patch.modelId }),
          ...(patch.modelLabel === undefined ? {} : { modelLabel: patch.modelLabel }),
          updatedAt: now().getTime(),
        })
        .where(eq(audioVariants.id, variantId))
        .returning({ id: audioVariants.id })
        .all();
      return changed.length > 0;
    },

    getVariant(variantId) {
      const row = db.select().from(audioVariants).where(eq(audioVariants.id, variantId)).get();
      return row === undefined ? undefined : { clipId: row.clipId, variant: toVariant(row) };
    },

    chooseVariant(clipId, variantId) {
      db.update(audioClips)
        .set({ chosenVariantId: variantId ?? null, updatedAt: now().getTime() })
        .where(eq(audioClips.id, clipId))
        .run();
    },
  };
}

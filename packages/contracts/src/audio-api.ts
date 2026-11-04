import { z } from 'zod';

import {
  assetIdSchema,
  idSchema,
  modelIdSchema,
  sceneIdSchema,
  shotIdSchema,
  takeIdSchema,
} from './ids.js';
import { sheetImageStatusSchema } from './sheet-api.js';
import { estimateSchema } from './spend.js';

/**
 * Le tracce audio di un film (T5.5, D24, D27, architettura §5.5): il suono sta su tracce separate dal
 * video, così cambiare una musica o un effetto non tocca le clip. La musica è un blocco per scena,
 * un effetto è agganciato a un'inquadratura. Ogni «Genera» è una variante, come un take per il video;
 * un file caricato ha una variante sola e non va mai a un fornitore AI (D27).
 */

export const AUDIO_TRACK_KINDS = ['native', 'dialogue', 'music', 'sfx'] as const;

export const audioTrackKindSchema = z.enum(AUDIO_TRACK_KINDS);

export type AudioTrackKind = z.infer<typeof audioTrackKindSchema>;

/** Una traccia del film: ce n'è una per tipo, con il suo muto e il suo volume. */
export const audioTrackSchema = z.object({
  id: idSchema,
  kind: audioTrackKindSchema,
  muted: z.boolean(),
  volume: z.number().min(0).max(1),
});

export type AudioTrack = z.infer<typeof audioTrackSchema>;

export const AUDIO_CLIP_SOURCES = ['generated', 'native', 'uploaded'] as const;

export const audioClipSourceSchema = z.enum(AUDIO_CLIP_SOURCES);

export type AudioClipSource = z.infer<typeof audioClipSourceSchema>;

export const audioVariantSchema = z.object({
  id: idSchema,
  status: sheetImageStatusSchema,
  /** Il servizio che ha lavorato (o che lavorerà): manca per un file caricato, che nessun servizio ha fatto. */
  modelId: modelIdSchema.optional(),
  modelLabel: z.string().min(1).optional(),
  /** Il file, già nella cartella del film (regola 11). Solo se la variante è pronta. */
  assetId: assetIdSchema.optional(),
  /** Il costo reale, dallo scontrino chiuso. */
  costUsd: z.number().nonnegative().optional(),
  errorCode: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export type AudioVariant = z.infer<typeof audioVariantSchema>;

/**
 * Una clip sulla sua traccia. `shotId` c'è per un effetto, e `startS` conta dall'inizio di
 * quell'inquadratura; la musica sta sulla scena. `chosenVariantId` è la variante in uso.
 */
export const audioClipSchema = z.object({
  id: idSchema,
  trackId: idSchema,
  kind: audioTrackKindSchema,
  sceneId: sceneIdSchema,
  shotId: shotIdSchema.optional(),
  startS: z.number().nonnegative(),
  durationS: z.number().positive(),
  volume: z.number().min(0).max(1),
  fadeInS: z.number().nonnegative(),
  fadeOutS: z.number().nonnegative(),
  description: z.string().min(1),
  /** L'atmosfera di una musica. */
  mood: z.string().min(1).optional(),
  chosenVariantId: idSchema.optional(),
  source: audioClipSourceSchema,
  /** Le varianti, dalla più recente. */
  variants: z.array(audioVariantSchema),
});

export type AudioClip = z.infer<typeof audioClipSchema>;

/** Tutto il suono di un film. */
export const audioOverviewSchema = z.object({
  tracks: z.array(audioTrackSchema),
  clips: z.array(audioClipSchema),
});

export type AudioOverview = z.infer<typeof audioOverviewSchema>;

/**
 * Una clip nuova, ancora senza nessun file: la musica sta su una scena, un effetto su un'inquadratura.
 * La descrizione la scrive l'utente e passa dal moderatore quando si genera.
 */
export const createAudioClipBodySchema = z
  .strictObject({
    kind: z.enum(['music', 'sfx']),
    sceneId: sceneIdSchema,
    shotId: shotIdSchema.optional(),
    startS: z.number().nonnegative().optional(),
    durationS: z.number().positive(),
    description: z.string().trim().min(1),
    mood: z.string().trim().min(1).optional(),
  })
  .refine((body) => (body.kind === 'sfx') === (body.shotId !== undefined), {
    message: 'Un effetto sta su un’inquadratura, la musica sulla scena.',
    path: ['shotId'],
  })
  .refine((body) => body.kind !== 'music' || body.startS === undefined, {
    message: 'La musica parte con la scena.',
    path: ['startS'],
  });

export type CreateAudioClipBody = z.infer<typeof createAudioClipBodySchema>;

/** «Suggerisci i suoni»: la conferma del limite di spesa, se serve. */
export const suggestSoundsBodySchema = z.strictObject({
  spendConfirmed: z.boolean().optional(),
});

export type SuggestSoundsBody = z.infer<typeof suggestSoundsBodySchema>;

/**
 * Le proposte del sound designer: non si salvano, l'utente accetta o scarta ognuna (D24). Hanno già la
 * forma di una clip da creare, così accettarne una è la stessa richiesta di sempre.
 */
export const soundSuggestionsSchema = z.object({
  suggestions: z.array(createAudioClipBodySchema),
});

export type SoundSuggestions = z.infer<typeof soundSuggestionsSchema>;

/** Quanto costerebbe chiedere le proposte, senza chiamare nessuno (D30). */
export const soundSuggestionsEstimateSchema = z.object({ estimate: estimateSchema });

export type SoundSuggestionsEstimate = z.infer<typeof soundSuggestionsEstimateSchema>;

/** I tipi che si possono dichiarare per un file audio: il tipo vero si legge poi dai primi byte. */
export const AUDIO_UPLOAD_CONTENT_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
] as const;

/** Quanto può pesare un file audio (byte): abbastanza per la musica di un corto. */
export const AUDIO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

/**
 * Un file audio dell'utente (D27): dove va e che cos'è. La durata la legge il server dal file. Il file è
 * il corpo della richiesta, e non va mai a un fornitore AI.
 */
export const uploadAudioQuerySchema = z
  .strictObject({
    kind: z.enum(['dialogue', 'music', 'sfx']),
    sceneId: sceneIdSchema,
    shotId: shotIdSchema.optional(),
    startS: z.coerce.number().nonnegative().optional(),
    description: z.string().trim().min(1),
  })
  .refine((query) => query.kind !== 'music' || query.shotId === undefined, {
    message: 'La musica sta sulla scena.',
    path: ['shotId'],
  })
  .refine((query) => query.kind !== 'sfx' || query.shotId !== undefined, {
    message: 'Un effetto sta su un’inquadratura.',
    path: ['shotId'],
  })
  .refine((query) => query.kind !== 'music' || query.startS === undefined, {
    message: 'La musica parte con la scena.',
    path: ['startS'],
  });

export type UploadAudioQuery = z.infer<typeof uploadAudioQuerySchema>;

/** Muto e volume di una traccia (T5.6): quello che manca resta com'è. */
export const updateAudioTrackBodySchema = z
  .strictObject({
    muted: z.boolean().optional(),
    volume: z.number().min(0).max(1).optional(),
  })
  .refine((body) => body.muted !== undefined || body.volume !== undefined, {
    message: 'Niente da cambiare.',
  });

export type UpdateAudioTrackBody = z.infer<typeof updateAudioTrackBodySchema>;

/**
 * Il pannello del blocco (T5.6): com'è il suono e dove parte. Quello che manca resta com'è; `mood: null`
 * toglie l'atmosfera. La durata di un file caricato è quella del file, e la musica parte con la scena.
 */
export const updateAudioClipBodySchema = z
  .strictObject({
    description: z.string().trim().min(1).optional(),
    mood: z.string().trim().min(1).nullable().optional(),
    startS: z.number().nonnegative().optional(),
    durationS: z.number().positive().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Niente da cambiare.',
  });

export type UpdateAudioClipBody = z.infer<typeof updateAudioClipBodySchema>;

/** L'audio originale di un take, che parte spento (D24, D43): lo si accende o lo si rispegne. */
export const setTakeNativeAudioBodySchema = z.strictObject({ on: z.boolean() });

export type SetTakeNativeAudioBody = z.infer<typeof setTakeNativeAudioBodySchema>;

/** Una scena sulla linea del tempo del film. */
export const audioTimelineSceneSchema = z.object({
  sceneId: sceneIdSchema,
  sceneNumber: z.number().int().positive(),
  heading: z.string().min(1),
  startS: z.number().nonnegative(),
  durationS: z.number().positive(),
  /** Il piano è da rifare: le sue inquadrature spariranno, e con loro i suoni agganciati. */
  stale: z.boolean(),
});

export type AudioTimelineScene = z.infer<typeof audioTimelineSceneSchema>;

/** Un'inquadratura sulla linea del tempo, con il take che finirà nel film, se ce n'è uno. */
export const audioTimelineShotSchema = z.object({
  shotId: shotIdSchema,
  sceneId: sceneIdSchema,
  startS: z.number().nonnegative(),
  durationS: z.number().positive(),
  action: z.string().min(1),
  takeId: takeIdSchema.optional(),
  assetId: assetIdSchema.optional(),
  /** L'audio originale di quel take è acceso. */
  nativeAudio: z.boolean(),
});

export type AudioTimelineShot = z.infer<typeof audioTimelineShotSchema>;

/** Dove si sente una clip, in secondi dall'inizio del film. */
export const audioPlacementSchema = z.object({
  startS: z.number().nonnegative(),
  durationS: z.number().positive(),
});

export type AudioPlacement = z.infer<typeof audioPlacementSchema>;

/**
 * La linea del tempo del film (T5.6): tutte le posizioni le calcola il server (regola 8). Una clip senza
 * posizione in `placements` ha perso il suo posto (la scena o l'inquadratura non c'è più).
 */
export const audioTimelineSchema = z.object({
  durationS: z.number().nonnegative(),
  scenes: z.array(audioTimelineSceneSchema),
  shots: z.array(audioTimelineShotSchema),
  placements: z.record(idSchema, audioPlacementSchema),
});

export type AudioTimeline = z.infer<typeof audioTimelineSchema>;

/** «Cambia»: la variante da usare. */
export const chooseAudioVariantBodySchema = z.strictObject({
  variantId: idSchema,
});

export type ChooseAudioVariantBody = z.infer<typeof chooseAudioVariantBodySchema>;

/** Cosa porta in coda il lavoro «genera una variante» (`audio_generate`). */
export const audioJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  clipId: idSchema,
  variantId: idSchema,
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type AudioJobPayload = z.infer<typeof audioJobPayloadSchema>;

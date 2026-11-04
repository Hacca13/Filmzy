import { z } from 'zod';

import { assetIdSchema, idSchema, modelIdSchema, sceneIdSchema, shotIdSchema } from './ids.js';
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

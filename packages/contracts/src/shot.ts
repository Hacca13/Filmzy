import { z } from 'zod';

import {
  assetIdSchema,
  characterIdSchema,
  configKeySchema,
  generationIdSchema,
  locationIdSchema,
  sceneIdSchema,
  shotIdSchema,
  takeIdSchema,
} from './ids.js';
import { SHOT_SPEC_SCHEMA_VERSION } from './versions.js';

/**
 * Un'immagine scelta dall'utente per un'inquadratura (architettura §5.2, D20). `upload` è
 * un'immagine caricata (luogo o oggetto, mai persone: D19) e porta `assetId`; `generate` chiede di
 * generarla (il risultato è un take `keyframe`); `take_frame` è il fotogramma al secondo `atS` del
 * take `takeId`; `moodboard` è un'immagine del moodboard del film, non segnata «solo per
 * l'analisi» (D37, D38).
 */
export const shotImageSchema = z.object({
  use: z.enum(['reference', 'first_frame', 'last_frame']),
  from: z.enum(['upload', 'generate', 'take_frame', 'moodboard']),
  assetId: assetIdSchema.optional(),
  takeId: takeIdSchema.optional(),
  atS: z.number().nonnegative().optional(),
});

export type ShotImage = z.infer<typeof shotImageSchema>;

/** Stato di continuità di entrata o di uscita di un'inquadratura (architettura §5.2, §8). */
export const continuityStateSchema = z.object({
  locationId: locationIdSchema,
  timeOfDay: z.string().min(1),
  present: z.array(characterIdSchema),
  costumes: z.record(characterIdSchema, z.string().min(1)),
  props: z.array(z.string().min(1)),
});

export type ContinuityState = z.infer<typeof continuityStateSchema>;

/** Un personaggio presente nell'inquadratura, con il costume di quella scena. */
export const shotCharacterSchema = z.object({
  characterId: characterIdSchema,
  costume: z.string().min(1),
  references: z.array(z.object({ assetId: assetIdSchema })),
});

export type ShotCharacter = z.infer<typeof shotCharacterSchema>;

/** Cosa succede nell'inquadratura (architettura §5.2): la parte di `ShotSpec` che legge il direttore della fotografia. */
export const shotIntentSchema = z.object({
  action: z.string().min(1),
  emotion: z.string().min(1),
  framing: z.string().min(1),
  cameraMovement: configKeySchema,
  lighting: z.string().min(1),
  durationS: z.number().positive(),
});

export type ShotIntent = z.infer<typeof shotIntentSchema>;

/** Sostituzione della fotografia del film per una singola inquadratura (architettura §5.2). */
export const cinematographyOverrideSchema = z.object({
  camera: z.string().min(1).optional(),
  lighting: z.string().min(1).optional(),
  lens: z.string().min(1).optional(),
  grade: z.string().min(1).optional(),
});

export type CinematographyOverride = z.infer<typeof cinematographyOverrideSchema>;

/**
 * Scheda inquadratura, versione 0.2 (architettura §5.2, aggiornata il 20/10/2026 con le immagini
 * dell'inquadratura, D20). `images` è vuoto finché l'utente non sceglie: `cameraMovement` è l'id
 * di un `camera_movements`, `dialogue` resta vuoto nell'MVP.
 */
export const shotSpecSchema = z.object({
  schema: z.literal(SHOT_SPEC_SCHEMA_VERSION),
  id: shotIdSchema,
  sceneId: sceneIdSchema,
  order: z.number().int().nonnegative(),
  intent: shotIntentSchema,
  characters: z.array(shotCharacterSchema),
  location: z.object({
    locationId: locationIdSchema,
    references: z.array(z.object({ assetId: assetIdSchema })),
  }),
  images: z.array(shotImageSchema),
  dialogue: z.array(
    z.object({
      characterId: characterIdSchema,
      text: z.string().min(1),
      voiceId: z.string().min(1).optional(),
      language: z.string().min(1),
    }),
  ),
  cinematography: z.union([z.literal('inherit'), cinematographyOverrideSchema]),
  continuity: z.object({
    entry: continuityStateSchema,
    exit: continuityStateSchema,
  }),
});

export type ShotSpec = z.infer<typeof shotSpecSchema>;

/** Un tentativo di generazione per un'inquadratura (architettura §5.2). */
export const takeSchema = z.object({
  id: takeIdSchema,
  shotId: shotIdSchema,
  kind: z.enum(['storyboard', 'keyframe', 'preview', 'final']),
  generationId: generationIdSchema,
  assetId: assetIdSchema,
  chosen: z.boolean(),
  checks: z.array(z.string().min(1)),
});

export type Take = z.infer<typeof takeSchema>;

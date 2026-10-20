import { z } from 'zod';

import { configKeySchema } from './ids.js';

/**
 * I preset come li vedono il dominio e le istruzioni: in **camelCase** (CLAUDE.md «Convenzioni»),
 * perché sono anche variabili dei template (per esempio `{{ movement.endFrameHint }}`). Nei file
 * di `config/presets/` le stesse voci sono in snake_case: la conversione la fa il caricatore
 * (`config/presets.ts`, T0.4).
 */

/** Stile visivo: `hint` è la frase in inglese che i ruoli aggiungono ai prompt (D15). */
export const stylePresetSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  hint: z.string().min(1),
  enabled: z.boolean(),
});

export type StylePreset = z.infer<typeof stylePresetSchema>;

/** Fotografia del film: `camera`, `lighting`, `lens` e `grade` sono in inglese. */
export const cinematographyPresetSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  camera: z.string().min(1),
  lighting: z.string().min(1),
  lens: z.string().min(1),
  grade: z.string().min(1),
  enabled: z.boolean(),
});

export type CinematographyPreset = z.infer<typeof cinematographyPresetSchema>;

/**
 * Movimento di macchina (D20). `hint` descrive il movimento nel prompt della clip,
 * `endFrameHint` come cambia l'inquadratura alla fine, per generare l'ultimo fotogramma.
 */
export const cameraMovementSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  hint: z.string().min(1),
  endFrameHint: z.string().min(1),
  enabled: z.boolean(),
});

export type CameraMovement = z.infer<typeof cameraMovementSchema>;

/** Tag di un personaggio: il ruolo che ha nella storia (D22). */
export const characterTagSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
});

export type CharacterTag = z.infer<typeof characterTagSchema>;

/** Genere o tono scelti nel wizard "La tua idea". */
export const genreSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
});

export type Genre = z.infer<typeof genreSchema>;

export const toneSchema = genreSchema;

export type Tone = z.infer<typeof toneSchema>;

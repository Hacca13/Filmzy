import { z } from 'zod';

import { configKeySchema } from '../ids.js';

/**
 * Stile visivo (`config/presets/styles.yaml`): `hint` è la frase in inglese che i ruoli
 * aggiungono ai prompt (D15).
 */
export const stylePresetSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  hint: z.string().min(1),
  enabled: z.boolean(),
});

export type StylePreset = z.infer<typeof stylePresetSchema>;

/**
 * Fotografia del film (`config/presets/cinematography.yaml`): `camera`, `lighting`, `lens` e
 * `grade` sono in inglese, li legge il direttore della fotografia.
 */
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
 * Movimento di macchina (`config/presets/camera_movements.yaml`, D20): `hint` descrive il
 * movimento nel prompt della clip, `end_frame_hint` come cambia l'inquadratura alla fine, per
 * generare l'ultimo fotogramma.
 */
export const cameraMovementSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  hint: z.string().min(1),
  end_frame_hint: z.string().min(1),
  enabled: z.boolean(),
});

export type CameraMovement = z.infer<typeof cameraMovementSchema>;

/** Tag di un personaggio (`config/presets/character_tags.yaml`, D22). */
export const characterTagSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
});

export type CharacterTag = z.infer<typeof characterTagSchema>;

/** Genere o tono proposti nel wizard "La tua idea" (`config/presets/genres.yaml`). */
export const genreSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
});

export type Genre = z.infer<typeof genreSchema>;

export const toneSchema = genreSchema;

export type Tone = z.infer<typeof toneSchema>;

/** Contenitori dei file di seme di `config/presets/`: `version` più l'elenco con la chiave del file. */
export const stylesFileSchema = z.object({
  version: z.literal(1),
  styles: z.array(stylePresetSchema),
});

export const cinematographyFileSchema = z.object({
  version: z.literal(1),
  cinematography: z.array(cinematographyPresetSchema),
});

export const cameraMovementsFileSchema = z.object({
  version: z.literal(1),
  camera_movements: z.array(cameraMovementSchema),
});

export const characterTagsFileSchema = z.object({
  version: z.literal(1),
  character_tags: z.array(characterTagSchema),
});

export const genresFileSchema = z.object({
  version: z.literal(1),
  genres: z.array(genreSchema),
  tones: z.array(toneSchema),
});

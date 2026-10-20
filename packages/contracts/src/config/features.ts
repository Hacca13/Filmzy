import { z } from 'zod';

/** Le funzioni attive del programma (`config/features.yaml`, CLAUDE.md «Da non fare»). */
export const featuresSchema = z.strictObject({
  real_people: z.boolean(),
  dialogue: z.boolean(),
  dubbing: z.boolean(),
  music: z.boolean(),
  sound_effects: z.boolean(),
  preview_gate: z.boolean(),
  keyframes: z.boolean(),
  image_upload: z.boolean(),
  retouch: z.boolean(),
  moodboard: z.boolean(),
  c2pa_marking: z.boolean(),
});

export type Features = z.infer<typeof featuresSchema>;

/**
 * Limiti applicati dal backend (architettura §4.3, D30, D36): `maxCharacters` è l'unico valore
 * fisso dell'MVP; i tetti di spesa sono valori iniziali, facoltativi, senza preimpostati, perché
 * quelli veri stanno in `settings` (§4.5).
 */
export const limitsSchema = z.strictObject({
  max_characters: z.number().int().positive(),
  film_budget_usd: z.number().positive().optional(),
  confirm_above_usd: z.number().positive().optional(),
});

export type Limits = z.infer<typeof limitsSchema>;

/** Il file di seme `config/features.yaml`. */
export const featuresFileSchema = z.object({
  version: z.literal(1),
  features: featuresSchema,
  limits: limitsSchema,
});

export type FeaturesFile = z.infer<typeof featuresFileSchema>;

import { z } from 'zod';

import { genreSchema, stylePresetSchema, toneSchema } from '../presets.js';

/** `composer`: musica per una scena, dall'atmosfera e dalla durata (architettura §5.3). */
export const composerInputSchema = z.object({
  cue: z.object({
    description: z.string().min(1),
    mood: z.string().min(1),
    durationS: z.number().positive(),
  }),
  genre: genreSchema,
  tone: toneSchema,
  style: stylePresetSchema,
});

export type ComposerInput = z.infer<typeof composerInputSchema>;

/** `sfx_artist`: 2-3 varianti di un effetto sonoro (architettura §5.3). */
export const sfxArtistInputSchema = z.object({
  cue: z.object({
    description: z.string().min(1),
    durationS: z.number().positive(),
  }),
  variants: z.number().int().positive(),
});

export type SfxArtistInput = z.infer<typeof sfxArtistInputSchema>;

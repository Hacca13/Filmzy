import { z } from 'zod';

import { assetIdSchema, generationIdSchema, projectIdSchema, sceneIdSchema } from './ids.js';

/** Un colore della palette (architettura §5.7). */
export const colorSchema = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  name: z.string().min(1).optional(),
  use: z.enum(['dominante', 'accento', 'ombra']).optional(),
});

export type Color = z.infer<typeof colorSchema>;

/**
 * Un'immagine di riferimento del moodboard. `analysisOnly` è vero per le immagini caricate con
 * persone (D38): servono solo per descrizione, atmosfera e colori, non si scelgono come immagine
 * di un'inquadratura. `generationId` c'è solo per `origin: 'generated'`.
 */
export const moodReferenceSchema = z.object({
  assetId: assetIdSchema,
  origin: z.enum(['generated', 'uploaded']),
  analysisOnly: z.boolean(),
  description: z.string().min(1),
  moodTags: z.array(z.string().min(1)),
  palette: z.array(colorSchema),
  generationId: generationIdSchema.optional(),
});

export type MoodReference = z.infer<typeof moodReferenceSchema>;

/** Palette, consigli e riferimenti del film o di una scena (architettura §5.7). */
export const moodboardPartSchema = z.object({
  palette: z.array(colorSchema),
  notes: z.string(),
  references: z.array(moodReferenceSchema),
});

export type MoodboardPart = z.infer<typeof moodboardPartSchema>;

/**
 * Il moodboard di un progetto: una parte per il film e una per ogni scena (D37). Una parte di
 * scena vuota non toglie nulla: vale quella del film.
 */
export const moodboardSchema = z.object({
  projectId: projectIdSchema,
  film: moodboardPartSchema,
  scenes: z.array(z.object({ sceneId: sceneIdSchema }).extend(moodboardPartSchema.shape)),
});

export type Moodboard = z.infer<typeof moodboardSchema>;

/**
 * La vista di solo testo del moodboard che leggono i ruoli (architettura §5.7): le immagini non
 * vanno da sole ai modelli di generazione.
 */
export const moodboardBriefSchema = z.object({
  palette: z.array(colorSchema),
  notes: z.string(),
  referenceDescriptions: z.array(z.string().min(1)),
  scene: z
    .object({
      palette: z.array(colorSchema),
      notes: z.string(),
    })
    .optional(),
});

export type MoodboardBrief = z.infer<typeof moodboardBriefSchema>;

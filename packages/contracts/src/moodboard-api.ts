import { z } from 'zod';

import { sceneIdSchema } from './ids.js';
import { colorSchema, moodboardSchema } from './moodboard.js';

/**
 * Il moodboard del film (T4.10, D37): palette, consigli e immagini di riferimento per tutto il film e,
 * se serve, per singole scene. È facoltativo ma consigliato. Qui le rotte con cui l'utente lo vede e
 * lo corregge a mano; generarlo e caricare immagini hanno le loro.
 */

/** Quanti colori al massimo in una palette: oltre, non è più una palette. */
export const MAX_PALETTE_COLORS = 8;

/** Quanto possono essere lunghi i consigli: luce, colore, macchina, ritmo — non un racconto. */
export const MOODBOARD_NOTES_MAX_CHARS = 2000;

/** Una scena su cui il moodboard può avere una parte sua: il numero e il titolo, come si leggono nella stesura. */
export const moodboardSceneSchema = z.object({
  sceneId: sceneIdSchema,
  number: z.number().int().positive(),
  heading: z.string().min(1),
});

export type MoodboardScene = z.infer<typeof moodboardSceneSchema>;

/** `GET /projects/:id/moodboard`. */
export const moodboardViewSchema = z.object({
  /** La funzione \`moodboard\` è accesa. Spenta, l'interfaccia non offre il passo. */
  enabled: z.boolean(),
  moodboard: moodboardSchema,
  /** Le scene dell'ultima stesura, per sceglierne una; vuoto finché la storia non c'è. */
  scenes: z.array(moodboardSceneSchema),
});

export type MoodboardView = z.infer<typeof moodboardViewSchema>;

/**
 * Salva palette e consigli del film (senza \`sceneId\`) o di una scena (D37). Sostituisce quelli di
 * prima. Una parte vuota (nessun colore, nessun consiglio) toglie la parte: per una scena torna a
 * valere quella del film.
 */
export const saveMoodboardPartBodySchema = z.strictObject({
  sceneId: sceneIdSchema.optional(),
  palette: z.array(colorSchema).max(MAX_PALETTE_COLORS),
  notes: z.string().max(MOODBOARD_NOTES_MAX_CHARS),
});

export type SaveMoodboardPartBody = z.infer<typeof saveMoodboardPartBodySchema>;

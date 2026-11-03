import { z } from 'zod';

import { modelIdSchema, sceneIdSchema } from './ids.js';
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

/** Come sta andando la creazione delle immagini di riferimento dell'ultima richiesta (T4.10). */
export const MOODBOARD_RUN_STATUSES = ['queued', 'running', 'succeeded', 'failed'] as const;

export const moodboardRunSchema = z.object({
  id: z.string().min(1),
  sceneId: sceneIdSchema.optional(),
  status: z.enum(MOODBOARD_RUN_STATUSES),
  /** Quante immagini sono già arrivate. */
  images: z.number().int().nonnegative(),
  errorCode: z.string().min(1).optional(),
  /** Il servizio che le fa, con il nome amichevole, e quanto è costato davvero. */
  modelLabel: z.string().min(1).optional(),
  costUsd: z.number().nonnegative().optional(),
  createdAt: z.iso.datetime(),
});

export type MoodboardRun = z.infer<typeof moodboardRunSchema>;

/** `GET /projects/:id/moodboard`. */
export const moodboardViewSchema = z.object({
  /** La funzione \`moodboard\` è accesa. Spenta, l'interfaccia non offre il passo. */
  enabled: z.boolean(),
  moodboard: moodboardSchema,
  /** Le scene dell'ultima stesura, per sceglierne una; vuoto finché la storia non c'è. */
  scenes: z.array(moodboardSceneSchema),
  /** L'ultima richiesta di immagini, se ce n'è stata una (T4.10). */
  run: moodboardRunSchema.optional(),
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

/**
 * «Crea il moodboard» (T4.10): il responsabile dell'atmosfera propone colori e consigli, che
 * **sostituiscono** quelli della parte, e un lavoro in coda crea le immagini di riferimento. Il servizio
 * delle immagini si può scegliere (D36); `spendConfirmed` è il «sì, proseguo» di un limite di spesa.
 */
export const generateMoodboardBodySchema = z.strictObject({
  sceneId: sceneIdSchema.optional(),
  modelId: modelIdSchema.optional(),
  spendConfirmed: z.boolean().optional(),
});

export type GenerateMoodboardBody = z.infer<typeof generateMoodboardBodySchema>;

/** `GET …/moodboard/options?sceneId=`: i servizi per le immagini e la stima di tutto il lavoro. */
export const moodboardOptionsQuerySchema = z.strictObject({
  sceneId: sceneIdSchema.optional(),
});

/** Cosa porta in coda il lavoro «crea le immagini del moodboard» (`moodboard_images`). */
export const moodboardJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  runId: z.string().min(1),
  sceneId: sceneIdSchema.optional(),
  prompts: z.array(z.string().min(1)).min(1),
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type MoodboardJobPayload = z.infer<typeof moodboardJobPayloadSchema>;

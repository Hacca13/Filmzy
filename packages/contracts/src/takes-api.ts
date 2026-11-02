import { z } from 'zod';

import { assetIdSchema, modelIdSchema, shotIdSchema, takeIdSchema } from './ids.js';
import { sheetImageStatusSchema } from './sheet-api.js';

/**
 * I take video di un'inquadratura (T4.3, architettura §7): ogni «Genera» è un take, una clip fatta
 * da un servizio. Un take dice **con quale servizio** è stato fatto e quanto è costato davvero (lo
 * scontrino), così rigenerare con un altro servizio dà un secondo take che si riconosce (D36).
 */

/**
 * Quanto può essere lungo il prompt visivo di un video, in caratteri: lo dice il direttore della
 * fotografia alle sue istruzioni. Un limite del programma, come la durata delle inquadrature: il
 * bench di T4.0 può cambiarlo.
 */
export const VIDEO_PROMPT_MAX_CHARS = 900;

export const shotTakeSchema = z.object({
  id: takeIdSchema,
  status: sheetImageStatusSchema,
  /** Il servizio che ha lavorato (o che lavorerà, finché il take è in coda): il nome amichevole sta in `modelLabel`. */
  modelId: modelIdSchema,
  modelLabel: z.string().min(1),
  /** La clip, già copiata nella cartella del film (regola 11). Solo se il take è riuscito. */
  assetId: assetIdSchema.optional(),
  /** Il costo reale della clip, dallo scontrino chiuso. Solo se il take è riuscito. */
  costUsd: z.number().nonnegative().optional(),
  errorCode: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export type ShotTake = z.infer<typeof shotTakeSchema>;

/** I take di un'inquadratura, dal più recente. */
export const shotTakesSchema = z.object({
  shotId: shotIdSchema,
  takes: z.array(shotTakeSchema),
});

export type ShotTakes = z.infer<typeof shotTakesSchema>;

/** Cosa porta in coda il lavoro «genera il take» (`take_generate`). */
export const takeJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  shotId: shotIdSchema,
  takeId: takeIdSchema,
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type TakeJobPayload = z.infer<typeof takeJobPayloadSchema>;

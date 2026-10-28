import { z } from 'zod';

import { assetIdSchema, characterIdSchema, modelIdSchema } from './ids.js';
import { modelOptionSchema } from './generation.js';

/**
 * La scheda del personaggio (T3.6, D18): tre immagini su fondo neutro, una per angolazione, per
 * ogni tentativo. L'utente può chiederne altri, sceglie il tentativo che gli piace e **blocca il
 * volto**: da quel momento le tre immagini sono i riferimenti del personaggio per tutto il film.
 */

/** Le tre angolazioni della scheda, nell'ordine in cui si mostrano. */
export const SHEET_ANGLES = ['front', 'profile', 'three_quarter'] as const;

export const sheetAngleSchema = z.enum(SHEET_ANGLES);

export type SheetAngle = z.infer<typeof sheetAngleSchema>;

/** Com'è andata una singola immagine: in coda, in lavorazione, pronta o fallita. */
export const sheetImageStatusSchema = z.enum(['queued', 'running', 'succeeded', 'failed']);

export type SheetImageStatus = z.infer<typeof sheetImageStatusSchema>;

export const sheetImageSchema = z.object({
  angle: sheetAngleSchema,
  status: sheetImageStatusSchema,
  /** Il file, quando c'è: si apre da `GET /api/assets/:assetId`. */
  assetId: assetIdSchema.optional(),
  /** Perché è fallita (codice del dominio), quando è fallita. */
  errorCode: z.string().min(1).optional(),
});

export type SheetImage = z.infer<typeof sheetImageSchema>;

/** Un tentativo: le tre immagini nate dalla stessa richiesta. */
export const sheetAttemptSchema = z.object({
  attempt: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  images: z.array(sheetImageSchema),
});

export type SheetAttempt = z.infer<typeof sheetAttemptSchema>;

/** La scheda di un personaggio: i tentativi dal più recente e quello su cui il volto è bloccato. */
export const characterSheetSchema = z.object({
  characterId: characterIdSchema,
  attempts: z.array(sheetAttemptSchema),
  lockedAttempt: z.number().int().positive().optional(),
});

export type CharacterSheet = z.infer<typeof characterSheetSchema>;

/**
 * I servizi tra cui scegliere per la scheda («Cambia servizio», D36), con la stima **dell'intera
 * scheda** (tre immagini) e non di una sola.
 */
export const sheetOptionsSchema = z.object({
  options: z.array(modelOptionSchema),
});

export type SheetOptions = z.infer<typeof sheetOptionsSchema>;

/** «Crea la scheda»: il servizio scelto, se diverso dal predefinito, e la conferma del limite di spesa (D30). */
export const startSheetBodySchema = z.strictObject({
  modelId: modelIdSchema.optional(),
  spendConfirmed: z.boolean().optional(),
});

export type StartSheetBody = z.infer<typeof startSheetBodySchema>;

/** «Blocca il volto»: il tentativo scelto, che deve avere tutte e tre le immagini pronte. */
export const lockSheetBodySchema = z.strictObject({
  attempt: z.number().int().positive(),
});

export type LockSheetBody = z.infer<typeof lockSheetBodySchema>;

/**
 * Cosa porta in coda il lavoro «fai le tre immagini della scheda» (`character_sheet`): il tentativo
 * da riempire, il servizio già scelto e la conferma del limite di spesa, se l'utente l'ha data.
 */
export const sheetJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  characterId: characterIdSchema,
  attempt: z.number().int().positive(),
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type SheetJobPayload = z.infer<typeof sheetJobPayloadSchema>;

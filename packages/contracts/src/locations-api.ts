import { z } from 'zod';

import { locationSchema } from './bible.js';
import { assetIdSchema, idSchema, locationIdSchema, modelIdSchema } from './ids.js';
import { screenplayLocationProposalSchema } from './screenplay.js';
import { sheetImageStatusSchema } from './sheet-api.js';

/**
 * Le rotte dei luoghi (T3.7, D18, D19): i luoghi che la bozza propone, quelli che l'utente aggiunge
 * al film, le immagini del set (senza persone) e la scelta di quella che resta come riferimento.
 */

/** I luoghi del film e quelli che la bozza propone e non sono ancora stati aggiunti. */
export const locationsSchema = z.object({
  locations: z.array(locationSchema),
  proposals: z.array(screenplayLocationProposalSchema),
});

export type Locations = z.infer<typeof locationsSchema>;

/** «Aggiungi»: la proposta della bozza diventa un luogo del film. */
export const addLocationBodySchema = z.strictObject({
  proposalId: idSchema,
});

export type AddLocationBody = z.infer<typeof addLocationBodySchema>;

/** Un tentativo: le immagini del set nate dalla stessa richiesta (stato unico: è una sola chiamata). */
export const locationAttemptSchema = z.object({
  attempt: z.number().int().positive(),
  status: sheetImageStatusSchema,
  createdAt: z.iso.datetime(),
  /** I file, quando il tentativo è riuscito: si aprono da `GET /api/assets/:assetId`. */
  assetIds: z.array(assetIdSchema),
  errorCode: z.string().min(1).optional(),
});

export type LocationAttempt = z.infer<typeof locationAttemptSchema>;

/** Le immagini di un luogo: i tentativi dal più recente e l'immagine scelta come riferimento. */
export const locationImagesSchema = z.object({
  locationId: locationIdSchema,
  attempts: z.array(locationAttemptSchema),
  chosenAssetId: assetIdSchema.optional(),
});

export type LocationImages = z.infer<typeof locationImagesSchema>;

/** «Scegli questa»: l'immagine, che deve essere di un tentativo di quel luogo. */
export const chooseLocationImageBodySchema = z.strictObject({
  assetId: assetIdSchema,
});

export type ChooseLocationImageBody = z.infer<typeof chooseLocationImageBodySchema>;

/** Cosa porta in coda il lavoro «fai le immagini del set» (`location_images`). */
export const locationJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  locationId: locationIdSchema,
  attempt: z.number().int().positive(),
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type LocationJobPayload = z.infer<typeof locationJobPayloadSchema>;

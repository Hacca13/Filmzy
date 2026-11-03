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

/**
 * Il ritocco col pennello (T4.9, D21): togli un oggetto, sostituiscilo con altro, cambia il suo colore.
 * L'utente dipinge la zona e, per «sostituisci» e «cambia colore», dice con parole sue cosa vuole.
 */
export const RETOUCH_OPERATIONS = ['remove', 'replace', 'recolor'] as const;

export const retouchOperationSchema = z.enum(RETOUCH_OPERATIONS);

export type RetouchOperation = z.infer<typeof retouchOperationSchema>;

/** Quanto può essere lunga la richiesta di ritocco: una frase, non un racconto. */
export const RETOUCH_INSTRUCTION_MAX_CHARS = 300;

/** Cosa è stato chiesto in un ritocco: di quale immagine e che cosa. Lo mostra l'intestazione del tentativo. */
export const retouchInfoSchema = z.object({
  sourceAssetId: assetIdSchema,
  operation: retouchOperationSchema,
  instruction: z.string().min(1).optional(),
});

export type RetouchInfo = z.infer<typeof retouchInfoSchema>;

/**
 * Le domande di un ritocco (`POST /projects/:id/locations/:locationId/retouch?…`): la maschera è il
 * corpo della richiesta (PNG). `remove` non vuole parole; `replace` e `recolor` sì. Nell'indirizzo
 * tutto è testo, quindi il «sì, proseguo» del limite di spesa è la parola `true`.
 */
export const retouchQuerySchema = z
  .strictObject({
    assetId: assetIdSchema,
    operation: retouchOperationSchema,
    instruction: z.string().trim().min(1).max(RETOUCH_INSTRUCTION_MAX_CHARS).optional(),
    modelId: modelIdSchema.optional(),
    spendConfirmed: z.literal('true').optional(),
  })
  .superRefine((query, context) => {
    const needsWords = query.operation !== 'remove';
    if (needsWords && query.instruction === undefined) {
      context.addIssue({ code: 'custom', path: ['instruction'], message: 'serve una richiesta' });
    }
    if (!needsWords && query.instruction !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['instruction'],
        message: 'non serve una richiesta',
      });
    }
  });

export type RetouchQuery = z.infer<typeof retouchQuerySchema>;

/** Le domande per i servizi e la stima di un ritocco (`GET …/retouch/options?…`): l'immagine e l'operazione bastano. */
export const retouchOptionsQuerySchema = z.strictObject({
  assetId: assetIdSchema,
  operation: retouchOperationSchema,
});

/** Un tentativo: le immagini del set nate dalla stessa richiesta (stato unico: è una sola chiamata). */
export const locationAttemptSchema = z.object({
  attempt: z.number().int().positive(),
  status: sheetImageStatusSchema,
  createdAt: z.iso.datetime(),
  /** I file, quando il tentativo è riuscito: si aprono da `GET /api/assets/:assetId`. */
  assetIds: z.array(assetIdSchema),
  errorCode: z.string().min(1).optional(),
  /** Il servizio che fa (o ha fatto) il tentativo, con il nome amichevole: lo dice l'intestazione del tentativo. */
  modelLabel: z.string().min(1).optional(),
  /** Quanto è costato davvero, dallo scontrino chiuso. Solo se il tentativo è riuscito. */
  costUsd: z.number().nonnegative().optional(),
  /** Se il tentativo è un ritocco (T4.9) e non un set nuovo: di quale foto e che cosa. */
  retouch: retouchInfoSchema.optional(),
});

export type LocationAttempt = z.infer<typeof locationAttemptSchema>;

/** Le immagini di un luogo: i tentativi dal più recente e l'immagine scelta come riferimento. */
export const locationImagesSchema = z.object({
  locationId: locationIdSchema,
  attempts: z.array(locationAttemptSchema),
  /** Le foto del luogo caricate dall'utente (T4.8): si possono scegliere come riferimento come le altre. */
  uploadedAssetIds: z.array(assetIdSchema),
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
  /** Se è un ritocco: cosa chiede, e dov'è la maschera (relativa alla cartella dei dati). */
  retouch: retouchInfoSchema.extend({ maskPath: z.string().min(1) }).optional(),
});

export type LocationJobPayload = z.infer<typeof locationJobPayloadSchema>;

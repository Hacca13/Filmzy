import { z } from 'zod';

import { assetIdSchema, shotIdSchema, takeIdSchema } from './ids.js';
import { shotImageSchema } from './shot.js';
import { storyboardModeSchema } from './storyboard-api.js';

/**
 * «Imposta le immagini» (T4.2, D20): per ogni inquadratura l'utente decide quali immagini fanno da
 * ispirazione, da primo fotogramma («da qui parte») e da ultimo («qui finisce»). Il ruolo è un
 * requisito per il servizio che girerà il video, non un suggerimento. Per ora le immagini sono
 * quelle generate per quell'inquadratura (storyboard e ultimo fotogramma) e i fotogrammi presi dai suoi
 * take (T4.6): le persone le crea Filmzy (D19), e le immagini caricate arrivano dopo (T4.8).
 */

/** Quante immagini di ispirazione al massimo: poi il servizio ha i suoi limiti, che il controllo conosce. */
export const MAX_SHOT_REFERENCES = 3;

/** Un'immagine scelta: a cosa serve e quale. Da dove viene lo decide il server. */
export const shotImageChoiceSchema = z.strictObject({
  use: shotImageSchema.shape.use,
  assetId: assetIdSchema,
});

export type ShotImageChoice = z.infer<typeof shotImageChoiceSchema>;

/** Sostituisce tutte le immagini impostate dell'inquadratura (vuoto = decide l'aiuto regista). */
export const setShotImagesBodySchema = z.strictObject({
  images: z.array(shotImageChoiceSchema).max(MAX_SHOT_REFERENCES + 2),
});

export type SetShotImagesBody = z.infer<typeof setShotImagesBodySchema>;

/**
 * Un'immagine che l'inquadratura può usare: una variante di un tentativo riuscito (`storyboard`,
 * `end_frame`, col numero del tentativo) oppure un fotogramma preso da un suo take (`take_frame`, T4.6,
 * col take e il momento).
 */
export const imageCandidateSchema = z.object({
  assetId: assetIdSchema,
  mode: z.enum([...storyboardModeSchema.options, 'take_frame', 'upload']),
  attempt: z.number().int().positive().optional(),
  takeId: takeIdSchema.optional(),
  atS: z.number().nonnegative().optional(),
});

export type ImageCandidate = z.infer<typeof imageCandidateSchema>;

/**
 * Le immagini dell'inquadratura: quelle impostate, quelle tra cui scegliere e quanti servizi video
 * attivati accettano questa combinazione adesso. Con zero, il video non partirebbe (nessun servizio
 * adatto): lo si dice subito, prima di spendere, e non si passa a «solo ispirazione» in silenzio.
 */
export const shotImagesSchema = z.object({
  shotId: shotIdSchema,
  images: z.array(shotImageSchema),
  candidates: z.array(imageCandidateSchema),
  videoServices: z.number().int().nonnegative(),
});

export type ShotImages = z.infer<typeof shotImagesSchema>;

import { z } from 'zod';

import { assetIdSchema, configKeySchema, idSchema, shotIdSchema } from './ids.js';
import { projectChoiceSchema } from './projects-api.js';
import { shotSpecSchema } from './shot.js';
import { estimateSchema } from './spend.js';

/**
 * Le inquadrature (T3.9, architettura §3.1, §5.2): l'aiuto regista divide ogni scena della
 * sceneggiatura finale in inquadrature (ShotSpec), l'utente le vede in una striscia di card e può
 * cambiare il movimento di macchina scegliendolo da una lista.
 */

/**
 * Quanto può durare un'inquadratura, in secondi: lo dice l'aiuto regista alle sue istruzioni.
 * È un limite del programma e non un preset, come le durate del film: lo decide quello che i
 * modelli video sanno girare (il bench di T4.0 può cambiarlo).
 */
export const SHOT_DURATION_RANGE_S = { min: 3, max: 8 } as const;

/**
 * Una scena della stesura finale con le sue inquadrature. `planned` è falso finché l'aiuto regista
 * non le ha pensate; `stale` dice che la scena è cambiata dopo (la stesura è stata corretta o
 * riscritta) e le inquadrature vanno rifatte.
 */
export const scenePlanSchema = z.object({
  sceneNumber: z.number().int().positive(),
  heading: z.string().min(1),
  summary: z.string().min(1),
  durationS: z.number().positive(),
  planned: z.boolean(),
  stale: z.boolean(),
  /** Ciò che l'aiuto regista ha voluto spiegare (per esempio perché cambia la fotografia). */
  notes: z.string().min(1).optional(),
  shots: z.array(shotSpecSchema),
  /** La variante di storyboard scelta per ogni inquadratura che ne ha una: il riferimento visivo della card (T4.1). */
  chosenStoryboards: z.record(shotIdSchema, assetIdSchema),
});

export type ScenePlan = z.infer<typeof scenePlanSchema>;

/** Le scene dell'ultima stesura con le inquadrature, e i movimenti di macchina tra cui scegliere. */
export const shotPlansSchema = z.object({
  finalVersionId: idSchema,
  scenes: z.array(scenePlanSchema),
  cameraMovements: z.array(projectChoiceSchema),
});

export type ShotPlans = z.infer<typeof shotPlansSchema>;

/** «Pensa le inquadrature» di una scena: rifarla sostituisce le inquadrature di prima. */
export const planSceneBodySchema = z.strictObject({
  sceneNumber: z.number().int().positive(),
  spendConfirmed: z.boolean().optional(),
});

export type PlanSceneBody = z.infer<typeof planSceneBodySchema>;

/** Quanto costerebbe pensare le inquadrature di una scena, prima di chiederlo (D30). */
export const planSceneEstimateBodySchema = z.strictObject({
  sceneNumber: z.number().int().positive(),
});

export const planSceneEstimateSchema = z.object({ estimate: estimateSchema });

export type PlanSceneEstimate = z.infer<typeof planSceneEstimateSchema>;

/** Cambia il movimento di macchina di un'inquadratura: l'id deve stare tra quelli attivi. */
export const changeShotBodySchema = z.strictObject({
  cameraMovement: configKeySchema,
});

export type ChangeShotBody = z.infer<typeof changeShotBodySchema>;

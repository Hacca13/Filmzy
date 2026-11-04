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
/**
 * Una segnalazione di continuità su un'inquadratura (architettura §8): un codice, un motivo in italiano
 * e da dove viene. È un giallo: l'inquadratura resta com'è, e l'utente decide se rifarla.
 */
export const continuityFlagSchema = z.object({
  code: z.string().min(1),
  reason: z.string().min(1),
  origin: z.enum(['rule', 'llm', 'vision']),
  /** Un avviso leggero (R4, R8, R9): l'inquadratura va bene com'è, ma conviene dargli un'occhiata. Altrimenti è un giallo vero. */
  light: z.boolean(),
});

export type ContinuityFlag = z.infer<typeof continuityFlagSchema>;

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
  /** La clip che la card fa vedere per ogni inquadratura che ne ha una: quella del take scelto (T4.6) o, se non ce n'è, del più recente riuscito (T4.3). */
  clips: z.record(shotIdSchema, assetIdSchema),
  /**
   * Cosa si sta facendo adesso per ogni inquadratura che ha un lavoro in coda o in corso (T4.4): la card
   * lo dice e, quando il lavoro finisce, passa da sola a «pronto». Il video vince sulle immagini.
   */
  working: z.record(shotIdSchema, z.enum(['storyboard', 'end_frame', 'video'])),
  /** I gialli delle inquadrature che ne hanno (T4.9): per ora R6, un luogo cambiato dopo che l'inquadratura era stata fatta. */
  flags: z.record(shotIdSchema, z.array(continuityFlagSchema)),
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

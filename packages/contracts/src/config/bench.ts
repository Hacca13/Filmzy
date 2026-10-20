import { z } from 'zod';

import { configKeySchema, idSchema, modelIdSchema } from '../ids.js';

/** Un personaggio inventato per il bench (architettura §4.13), senza passare dal casting. */
export const benchCharacterSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  brief: z.string().min(1),
});

export type BenchCharacter = z.infer<typeof benchCharacterSchema>;

/** Quante immagini provare per ogni angolazione della scheda, da scegliere a mano. */
export const benchSheetSchema = z.object({
  model: modelIdSchema,
  angles: z.array(z.enum(['front', 'profile', 'three_quarter'])).min(1),
  attempts_per_angle: z.number().int().positive(),
});

export type BenchSheet = z.infer<typeof benchSheetSchema>;

export const benchShotSchema = z.object({
  id: idSchema,
  action: z.string().min(1),
  framing: z.string().min(1),
  characters: z.array(idSchema).min(1),
  lighting: z.string().min(1).optional(),
});

export type BenchShot = z.infer<typeof benchShotSchema>;

/** Voto alla cieca delle prove (architettura §4.13, §13: la scala va ancora decisa). */
export const benchVotingSchema = z.object({
  voters: z.number().int().positive(),
  blind: z.boolean(),
  criteria: z.array(z.string().min(1)).min(1),
  scale: z.tuple([z.number(), z.number()]),
  usable_threshold: z.number(),
});

export type BenchVoting = z.infer<typeof benchVotingSchema>;

export const benchSuccessSchema = z.object({
  usable_takes_per_shot: z.number().int().positive(),
});

export type BenchSuccess = z.infer<typeof benchSuccessSchema>;

/**
 * Un piano di bench (architettura §4.13, `config/bench/*.yaml`): matrice personaggi x
 * inquadrature x modelli x take, con il budget che ferma il bench prima di partire se la stima
 * lo supera.
 */
export const benchPlanSchema = z.object({
  name: z.string().min(1),
  budget_usd: z.number().positive(),
  style: configKeySchema,
  cinematography: configKeySchema,
  characters: z.array(benchCharacterSchema).min(1),
  sheet: benchSheetSchema,
  shots: z.array(benchShotSchema).min(1),
  models: z.array(modelIdSchema).min(1),
  takes_per_shot: z.number().int().positive(),
  duration_s: z.number().positive(),
  voting: benchVotingSchema,
  success: benchSuccessSchema,
});

export type BenchPlan = z.infer<typeof benchPlanSchema>;

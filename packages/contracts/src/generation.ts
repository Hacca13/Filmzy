import { z } from 'zod';

import { modelIdSchema, projectIdSchema, shotIdSchema } from './ids.js';

/** Perché si chiede una generazione (architettura §4.11): prodotto, prova, valutazione o bench. */
export const GENERATION_PURPOSES = ['product', 'draft_test', 'eval', 'bench'] as const;

export const generationPurposeSchema = z.enum(GENERATION_PURPOSES);

export type GenerationPurpose = z.infer<typeof generationPurposeSchema>;

/**
 * Il `ctx` di ogni richiesta alla troupe (architettura §4.1, §5.6): dice chi chiede e perché.
 * `modelId` è il servizio che l'utente ha scelto per questa singola generazione (D36): non entra
 * negli schemi di input dei ruoli, ma nel `ctx`.
 */
export const generationContextSchema = z.object({
  projectId: projectIdSchema.optional(),
  shotId: shotIdSchema.optional(),
  purpose: generationPurposeSchema,
  modelId: modelIdSchema.optional(),
  /**
   * L'utente ha visto che la generazione supera un limite di spesa e ha scelto di proseguire (D30):
   * i limiti sono impostazioni, non muri. Vale per questa richiesta sola.
   */
  spendConfirmed: z.boolean().optional(),
});

export type GenerationContext = z.infer<typeof generationContextSchema>;

/**
 * Un servizio tra cui l'utente può scegliere per «Cambia servizio» (architettura §5.6, D36):
 * nome amichevole, costo stimato e voto delle prove, se il servizio è già stato provato.
 */
export const modelOptionSchema = z.object({
  modelId: modelIdSchema,
  label: z.string().min(1),
  estimatedCostUsd: z.number().nonnegative(),
  quality: z.number().min(1).max(5).optional(),
  isDefault: z.boolean(),
});

export type ModelOption = z.infer<typeof modelOptionSchema>;

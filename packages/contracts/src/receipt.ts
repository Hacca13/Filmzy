import { z } from 'zod';

import { domainErrorCodeSchema } from './errors.js';
import { generationPurposeSchema } from './generation.js';
import {
  configKeySchema,
  connectionIdSchema,
  generationIdSchema,
  idSchema,
  modelIdSchema,
  projectIdSchema,
  shotIdSchema,
} from './ids.js';
import { roleIdSchema } from './roles.js';

/** Esito di una chiamata a un fornitore (architettura §4.11): non ci sono riserve automatiche. */
export const GENERATION_STATUSES = ['queued', 'running', 'succeeded', 'failed'] as const;

export const generationStatusSchema = z.enum(GENERATION_STATUSES);

export type GenerationStatus = z.infer<typeof generationStatusSchema>;

/** Versione e variante delle istruzioni usate (architettura §4.4, §4.11). */
export const receiptInstructionsRefSchema = z.object({
  id: idSchema,
  version: z.number().int().positive(),
  variant: configKeySchema.optional(),
});

export type ReceiptInstructionsRef = z.infer<typeof receiptInstructionsRefSchema>;

/** Uso riportato dal fornitore: token per i ruoli LLM, secondi e immagini per gli altri. */
export const generationUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  seconds: z.number().nonnegative().optional(),
  images: z.number().int().nonnegative().optional(),
});

export type GenerationUsage = z.infer<typeof generationUsageSchema>;

/**
 * Lo scontrino di una chiamata a un fornitore (architettura §4.11): chi e perché, con cosa, cosa è
 * successo, quanto. Ne esiste uno anche per le chiamate fallite: un rifiuto è `status: 'failed'`
 * con `errorCode: 'content_rejected'`, così il motivo ha una sola fonte.
 */
export const generationReceiptSchema = z.object({
  id: generationIdSchema,
  role: roleIdSchema,
  purpose: generationPurposeSchema,
  projectId: projectIdSchema.optional(),
  shotId: shotIdSchema.optional(),

  releaseId: idSchema,
  roleConfigHash: z.string().min(1),
  modelId: modelIdSchema,
  modelLabel: z.string().min(1),
  connectionId: connectionIdSchema,
  providerModel: z.string().min(1),
  instructions: receiptInstructionsRefSchema.optional(),
  params: z.record(z.string(), z.unknown()).optional(),

  inputHash: z.string().min(1),
  idempotencyKey: z.string().min(1),
  providerRequestId: z.string().min(1).optional(),
  status: generationStatusSchema,
  errorCode: domainErrorCodeSchema.optional(),
  attempts: z.number().int().positive(),

  usage: generationUsageSchema.optional(),
  estimatedCostUsd: z.number().nonnegative(),
  actualCostUsd: z.number().nonnegative().optional(),
  createdAt: z.iso.datetime(),
  durationMs: z.number().nonnegative().optional(),
});

export type GenerationReceipt = z.infer<typeof generationReceiptSchema>;

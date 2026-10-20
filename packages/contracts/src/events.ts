import { z } from 'zod';

import { domainErrorSchema } from './errors.js';
import {
  assetIdSchema,
  generationIdSchema,
  projectIdSchema,
  shotIdSchema,
  takeIdSchema,
} from './ids.js';

/**
 * Eventi che partono dai lavori in coda e arrivano all'interfaccia via SSE (architettura §5.4).
 * `take.rejected` ha la stessa forma di `take.failed`: è il caso in cui `error.code` è
 * `content_rejected` (§4.10), ma resta un tipo a parte perché l'interfaccia lo mostra senza
 * «Riprova».
 */
export const generationQueuedEventSchema = z.object({
  type: z.literal('generation.queued'),
  generationId: generationIdSchema,
  projectId: projectIdSchema.optional(),
  shotId: shotIdSchema.optional(),
});

export const generationRunningEventSchema = z.object({
  type: z.literal('generation.running'),
  generationId: generationIdSchema,
});

export const takeReadyEventSchema = z.object({
  type: z.literal('take.ready'),
  generationId: generationIdSchema,
  shotId: shotIdSchema,
  takeId: takeIdSchema,
  assetId: assetIdSchema,
});

export const takeFailedEventSchema = z.object({
  type: z.literal('take.failed'),
  generationId: generationIdSchema,
  shotId: shotIdSchema,
  error: domainErrorSchema,
});

export const takeRejectedEventSchema = z.object({
  type: z.literal('take.rejected'),
  generationId: generationIdSchema,
  shotId: shotIdSchema,
  error: domainErrorSchema,
});

export const imageReadyEventSchema = z.object({
  type: z.literal('image.ready'),
  generationId: generationIdSchema,
  assetId: assetIdSchema,
});

export const imageFailedEventSchema = z.object({
  type: z.literal('image.failed'),
  generationId: generationIdSchema,
  error: domainErrorSchema,
});

export const audioReadyEventSchema = z.object({
  type: z.literal('audio.ready'),
  generationId: generationIdSchema,
  assetId: assetIdSchema,
});

export const audioFailedEventSchema = z.object({
  type: z.literal('audio.failed'),
  generationId: generationIdSchema,
  error: domainErrorSchema,
});

/** Una segnalazione di continuità (architettura §8): un codice, un motivo in italiano e un'origine. */
export const continuityFlaggedEventSchema = z.object({
  type: z.literal('continuity.flagged'),
  shotId: shotIdSchema,
  code: z.string().min(1),
  reason: z.string().min(1),
  origin: z.enum(['rule', 'llm', 'vision']),
});

export const exportReadyEventSchema = z.object({
  type: z.literal('export.ready'),
  projectId: projectIdSchema,
  assetId: assetIdSchema,
});

export const domainEventSchema = z.discriminatedUnion('type', [
  generationQueuedEventSchema,
  generationRunningEventSchema,
  takeReadyEventSchema,
  takeFailedEventSchema,
  takeRejectedEventSchema,
  imageReadyEventSchema,
  imageFailedEventSchema,
  audioReadyEventSchema,
  audioFailedEventSchema,
  continuityFlaggedEventSchema,
  exportReadyEventSchema,
]);

export type DomainEvent = z.infer<typeof domainEventSchema>;

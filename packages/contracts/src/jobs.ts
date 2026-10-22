import { z } from 'zod';

import { projectIdSchema } from './ids.js';

/**
 * I lavori della coda interna (architettura §7). La coda sta in SQLite, in un processo solo: non
 * c'è nessun Redis e nessun secondo esecutore. Questi schemi sono il confine fra il server e
 * l'interfaccia, che mostra «cosa sto facendo» e permette di annullare.
 *
 * `payload` è il dato del lavoro e lo valida il modulo che lo esegue: qui resta sconosciuto,
 * perché la coda non deve conoscere i domini (immagini, video, suoni, esportazione).
 */
export const JOB_STATUSES = ['queued', 'running', 'done', 'failed', 'cancelled'] as const;

export const jobStatusSchema = z.enum(JOB_STATUSES);

export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobSchema = z.object({
  id: z.string().min(1),
  /** Che lavoro è: lo decide il modulo che lo mette in coda (per esempio `take.generate`). */
  kind: z.string().min(1),
  status: jobStatusSchema,
  payload: z.unknown(),
  projectId: projectIdSchema.optional(),
  /** Un lavoro ripetuto non conta due volte (regola d'oro 10): la chiave lo riconosce. */
  idempotencyKey: z.string().min(1).optional(),
  priority: z.number().int(),
  attempts: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  /** Non prima di questo momento: è così che funziona l'attesa crescente fra due tentativi. */
  runAfter: z.iso.datetime(),
  errorCode: z.string().min(1).optional(),
  errorMessage: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  startedAt: z.iso.datetime().optional(),
  finishedAt: z.iso.datetime().optional(),
});

export type Job = z.infer<typeof jobSchema>;

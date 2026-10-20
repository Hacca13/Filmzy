import { z } from 'zod';

/** Risposta di `GET /api/health`: dice all'interfaccia se il server locale è in piedi. */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

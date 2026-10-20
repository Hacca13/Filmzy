import { z } from 'zod';

import { connectionIdSchema, modelIdSchema } from './ids.js';

/**
 * Il servizio fissato per una richiesta e il suo costo previsto (architettura §4.1): il lavoro in
 * coda usa questo servizio, anche se nel frattempo le impostazioni cambiano.
 */
export const estimateSchema = z.object({
  modelId: modelIdSchema,
  modelLabel: z.string().min(1),
  estimatedCostUsd: z.number().nonnegative(),
});

export type Estimate = z.infer<typeof estimateSchema>;

/**
 * Tetti di spesa dell'utente (architettura §4.3, §5.6, D30, D36): tutti facoltativi e **senza
 * valori preimpostati**. `monthlyByConnection` e `monthlyByModel` non sono mappe esaurienti (le
 * chiavi sono id di connessioni e modelli, non un elenco fisso), quindi senza una voce il tetto
 * semplicemente non c'è.
 */
export const spendCapSchema = z.object({
  monthlyByConnection: z.record(connectionIdSchema, z.number().positive()).optional(),
  monthlyByModel: z.record(modelIdSchema, z.number().positive()).optional(),
  filmBudgetUsd: z.number().positive().optional(),
  confirmAboveUsd: z.number().positive().optional(),
});

export type SpendCap = z.infer<typeof spendCapSchema>;

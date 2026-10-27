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

/** I limiti che l'utente può accendere (D30): mensile di un fornitore, per film, «conferma sopra una cifra». */
export const SPEND_LIMITS = ['monthly_cap', 'film_budget', 'confirm_above'] as const;

export const spendLimitSchema = z.enum(SPEND_LIMITS);

export type SpendLimit = z.infer<typeof spendLimitSchema>;

/**
 * Il limite che una generazione supererebbe (errore `spend_cap_reached`): quale, di quanto, quanto
 * si è già speso in quell'ambito e quanto costerebbe la chiamata. Servono a chiedere all'utente se
 * alzarlo o proseguire.
 */
export const spendBreachSchema = z.object({
  limit: spendLimitSchema,
  limitUsd: z.number().nonnegative(),
  spentUsd: z.number().nonnegative(),
  estimatedUsd: z.number().nonnegative(),
});

export type SpendBreach = z.infer<typeof spendBreachSchema>;

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

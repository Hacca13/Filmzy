import { z } from 'zod';

import { connectionIdSchema, projectIdSchema } from './ids.js';

/**
 * La spesa per le impostazioni (T3.1, D30, D36): quanto si è speso nel mese per ogni fornitore e
 * quanto manca al suo limite, con l'avviso all'80% e al limite. La spesa si calcola dagli scontrini.
 * Il calcolo lo fa il server (regola 8): l'interfaccia mostra.
 */

/** `none`: nessun limite acceso. Sopra l'80% è `warning`, al 100% `reached` (D36). */
export const SPEND_LEVELS = ['none', 'ok', 'warning', 'reached'] as const;

export const spendLevelSchema = z.enum(SPEND_LEVELS);

export type SpendLevel = z.infer<typeof spendLevelSchema>;

export const providerSpendSchema = z.object({
  connectionId: connectionIdSchema,
  label: z.string().min(1),
  /** Speso nel mese corrente. */
  spentUsd: z.number().nonnegative(),
  /** Il limite mensile, se c'è: nessuno è preimpostato. */
  capUsd: z.number().positive().optional(),
  /** Quanto del limite si è usato, in percentuale. Assente senza limite. */
  percent: z.number().nonnegative().optional(),
  level: spendLevelSchema,
});

export type ProviderSpend = z.infer<typeof providerSpendSchema>;

/** `GET /spend`. */
export const spendOverviewSchema = z.object({
  /** L'inizio del mese a cui si riferisce la spesa dei fornitori. */
  monthStart: z.iso.datetime(),
  totalMonthUsd: z.number().nonnegative(),
  providers: z.array(providerSpendSchema),
  /** I limiti che non sono di un fornitore: per film e «chiedi conferma sopra». */
  filmBudgetUsd: z.number().positive().optional(),
  confirmAboveUsd: z.number().positive().optional(),
  /** Quanto si è speso per ogni film, dal più caro. */
  films: z.array(z.object({ projectId: projectIdSchema, spentUsd: z.number().nonnegative() })),
});

export type SpendOverview = z.infer<typeof spendOverviewSchema>;

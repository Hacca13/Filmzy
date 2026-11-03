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

/** Un film nell'elenco delle spese: quanto è costato dall'inizio e quanto questo mese. */
export const filmSpendLineSchema = z.object({
  projectId: projectIdSchema,
  /** Il titolo del film; per un film che non c'è più, una frase che lo dice. */
  title: z.string().min(1),
  spentUsd: z.number().nonnegative(),
  monthUsd: z.number().nonnegative(),
});

export type FilmSpendLine = z.infer<typeof filmSpendLineSchema>;

/** `GET /spend`. */
export const spendOverviewSchema = z.object({
  /** L'inizio del mese a cui si riferisce la spesa dei fornitori. */
  monthStart: z.iso.datetime(),
  totalMonthUsd: z.number().nonnegative(),
  providers: z.array(providerSpendSchema),
  /** I limiti che non sono di un fornitore: per film e «chiedi conferma sopra». */
  filmBudgetUsd: z.number().positive().optional(),
  confirmAboveUsd: z.number().positive().optional(),
  /**
   * Quanto si è speso questo mese per i film (T4.7). È meno di `totalMonthUsd` se ci sono spese che non
   * sono di un film, come le prove fatte dalle impostazioni.
   */
  filmsMonthUsd: z.number().nonnegative(),
  /** Quanti fornitori hanno speso qualcosa questo mese (T4.7). */
  servicesMonth: z.number().int().nonnegative(),
  /** Quanti film hanno speso qualcosa questo mese. */
  filmsMonth: z.number().int().nonnegative(),
  /** Quanto si è speso per ogni film che ha speso qualcosa, prima quelli del mese e dal più caro. */
  films: z.array(filmSpendLineSchema),
});

export type SpendOverview = z.infer<typeof spendOverviewSchema>;

/**
 * Quanto è costato un film (T4.7, D30), diviso per ruolo e per servizio: «Quanto ho speso». Il conto
 * viene dagli scontrini, lo stesso della spesa del mese: una chiamata fallita non spende. Il server
 * dà i nomi in parole semplici; l'interfaccia li mostra.
 */
export const roleSpendSchema = z.object({
  role: z.string().min(1),
  /** Il nome del ruolo come lo vede l'utente («Operatore di ripresa»). */
  label: z.string().min(1),
  spentUsd: z.number().nonnegative(),
  calls: z.number().int().nonnegative(),
});

export type RoleSpend = z.infer<typeof roleSpendSchema>;

export const serviceSpendSchema = z.object({
  modelId: z.string().min(1),
  /** Il nome del servizio nel catalogo («Kling · Standard»). */
  label: z.string().min(1),
  /** Il fornitore che l'ha fatto girare («fal.ai»). */
  providerLabel: z.string().min(1),
  spentUsd: z.number().nonnegative(),
  calls: z.number().int().nonnegative(),
});

export type ServiceSpend = z.infer<typeof serviceSpendSchema>;

/** `GET /spend/films/:projectId`. Ruoli e servizi dal più caro. */
export const filmSpendSchema = z.object({
  projectId: projectIdSchema,
  title: z.string().min(1),
  totalUsd: z.number().nonnegative(),
  /** La parte spesa nel mese corrente. */
  monthUsd: z.number().nonnegative(),
  roles: z.array(roleSpendSchema),
  services: z.array(serviceSpendSchema),
});

export type FilmSpend = z.infer<typeof filmSpendSchema>;

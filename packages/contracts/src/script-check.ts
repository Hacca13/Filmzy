import { z } from 'zod';

import { idSchema } from './ids.js';
import { scriptSupervisorIssueSchema } from './roles/llm.js';
import { estimateSchema } from './spend.js';

/**
 * Il controllo della storia (T5.2, architettura §8): la segretaria di edizione legge la stesura e le
 * inquadrature pensate e dice dove la trama non torna. Un'incoerenza è un giallo (`origin: 'llm'`):
 * resta com'è, e l'utente decide se rifare.
 */

/** Una cosa che non torna, come la vede l'utente: dove (scena e inquadratura, da 1), quanto pesa e perché. */
export const scriptCheckIssueSchema = z.object({
  id: idSchema,
  code: scriptSupervisorIssueSchema.shape.code,
  /** Un avviso leggero: conviene un'occhiata, ma l'inquadratura va bene com'è. */
  light: z.boolean(),
  reason: z.string().min(1),
  sceneNumber: z.number().int().positive().optional(),
  shotNumber: z.number().int().positive().optional(),
});

export type ScriptCheckIssue = z.infer<typeof scriptCheckIssueSchema>;

/**
 * `none`: il film non è mai stato controllato. `current`: il controllo vale per la storia di adesso.
 * `outdated`: dopo il controllo la stesura o le inquadrature sono cambiate; le segnalazioni restano da
 * leggere ma non ingialliscono più niente, e va rifatto.
 */
export const SCRIPT_CHECK_STATES = ['none', 'current', 'outdated'] as const;

export const scriptCheckViewSchema = z.object({
  state: z.enum(SCRIPT_CHECK_STATES),
  checkedAt: z.iso.datetime().optional(),
  issues: z.array(scriptCheckIssueSchema),
});

export type ScriptCheckView = z.infer<typeof scriptCheckViewSchema>;

/** «Controlla la storia»: costa una chiamata a un modello di testo, quindi può portare la conferma di spesa. */
export const runScriptCheckBodySchema = z.strictObject({
  spendConfirmed: z.boolean().optional(),
});

export type RunScriptCheckBody = z.infer<typeof runScriptCheckBodySchema>;

/** Quanto costerebbe il controllo, prima di chiederlo (D30). */
export const scriptCheckEstimateSchema = z.object({ estimate: estimateSchema });

export type ScriptCheckEstimate = z.infer<typeof scriptCheckEstimateSchema>;

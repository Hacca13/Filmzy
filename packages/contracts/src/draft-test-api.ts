import { z } from 'zod';

import { estimateSchema } from './spend.js';
import { generationReceiptSchema } from './receipt.js';

/**
 * La prova della bozza (T2.5, architettura §4.5 punto 2): si esegue un ruolo di testo dalla bozza
 * su un input di esempio fisso, con costo e scontrino, prima di pubblicare. Costa soldi veri con un
 * fornitore vero, quindi si vede la stima prima e il costo vero dopo.
 */

/** I ruoli che si possono provare: quelli di testo e accesi. Immagini e video arrivano con M4. */
export const testableRolesSchema = z.object({
  roles: z.array(z.object({ roleId: z.string().min(1), label: z.string().min(1) })),
});

export type TestableRoles = z.infer<typeof testableRolesSchema>;

/** `POST /troupe/test/:roleId/estimate`: il servizio che lavorerebbe e quanto costerebbe, circa. */
export const draftTestEstimateSchema = z.object({
  estimate: estimateSchema,
  /** L'input di esempio fisso del ruolo (D39), così si vede cosa verrebbe provato. */
  example: z.unknown(),
});

export type DraftTestEstimate = z.infer<typeof draftTestEstimateSchema>;

/**
 * Il corpo di `POST /troupe/test/:roleId/run`: `spendConfirmed` vuol dire che l'utente ha visto che
 * la prova supera un limite di spesa e ha scelto di proseguire (D30).
 */
export const draftTestRunBodySchema = z.object({ spendConfirmed: z.boolean().optional() });

export type DraftTestRunBody = z.infer<typeof draftTestRunBodySchema>;

/** `POST /troupe/test/:roleId/run`: l'esempio, il risultato e lo scontrino `draft_test`. */
export const draftTestResultSchema = z.object({
  example: z.unknown(),
  output: z.unknown(),
  receipt: generationReceiptSchema,
});

export type DraftTestResult = z.infer<typeof draftTestResultSchema>;

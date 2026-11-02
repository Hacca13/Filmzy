import { z } from 'zod';

import { idSchema } from './ids.js';
import { screenplaySchema } from './screenplay.js';

/**
 * Il riepilogo e la stesura ufficiale (T3.8, architettura §3.1, D18): il codice confronta la bozza
 * con le scelte fatte (cast e luoghi) e mostra le differenze; poi lo sceneggiatore scrive la
 * stesura ufficiale, che si può correggere a mano.
 */

/** Cosa può rispondere l'utente a una differenza che dipende da lui. «Cambia la mia scelta» non c'è: è tornare al cast o ai luoghi. */
export const REVIEW_DECISIONS = ['adapt', 'keep'] as const;

export const reviewDecisionSchema = z.enum(REVIEW_DECISIONS);

/** `adapt` = «Adatta la storia» (la stesura non lo nomina); `keep` = «Va bene così» (resta come comparsa o luogo generico). */
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

/**
 * Una differenza fra la bozza e le scelte (D18).
 * - `not_chosen`: la bozza cita un personaggio o un luogo che il film non ha. Qui l'utente decide.
 * - `not_in_draft`: il film ha un personaggio o un luogo che la bozza non cita. La stesura lo
 *   inserirà comunque, quindi non c'è niente da decidere (`choices` è vuoto): si può solo tornare
 *   indietro a cambiare la scelta.
 */
export const reviewDifferenceSchema = z.object({
  /** Stabile finché la differenza è la stessa: lega la risposta dell'utente alla differenza. */
  key: z.string().min(1),
  kind: z.enum(['character', 'location']),
  reason: z.enum(['not_chosen', 'not_in_draft']),
  name: z.string().min(1),
  /** Le risposte ammesse: lo decide il server, l'interfaccia mostra solo i pulsanti. */
  choices: z.array(reviewDecisionSchema),
});

export type ReviewDifference = z.infer<typeof reviewDifferenceSchema>;

/** Il riepilogo: la bozza confrontata (l'ultima versione) e le differenze. Senza differenze il passo si salta. */
export const draftReviewSchema = z.object({
  draftVersionId: idSchema,
  differences: z.array(reviewDifferenceSchema),
});

export type DraftReview = z.infer<typeof draftReviewSchema>;

/** La risposta dell'utente a una differenza. */
export const reviewAnswerSchema = z.strictObject({
  key: z.string().min(1),
  decision: reviewDecisionSchema,
});

export type ReviewAnswer = z.infer<typeof reviewAnswerSchema>;

/**
 * «Scrivi la sceneggiatura finale»: una risposta per ogni differenza su cui l'utente decide.
 * `spendConfirmed` è la conferma a superare un limite di spesa (D30).
 */
export const writeFinalBodySchema = z.strictObject({
  answers: z.array(reviewAnswerSchema),
  spendConfirmed: z.boolean().optional(),
});

export type WriteFinalBody = z.infer<typeof writeFinalBodySchema>;

/**
 * La stesura ufficiale corretta a mano: il testo intero, come lo ha cambiato l'utente. Il server
 * controlla che citi solo personaggi e luoghi del film.
 */
export const editFinalBodySchema = z.strictObject({
  screenplay: screenplaySchema,
});

export type EditFinalBody = z.infer<typeof editFinalBodySchema>;

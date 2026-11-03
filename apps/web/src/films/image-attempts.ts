import type { LocationAttempt } from '@filmzy/contracts';

import { formatEstimate } from '../lib/format';
import { failureText } from './failure';

/**
 * Le immagini fatte a tentativi (i luoghi, lo storyboard): ogni tentativo è un lavoro in coda con un
 * solo stato e, se riuscito, più immagini fra cui se ne sceglie una. Le piccole decisioni di come
 * mostrarle stanno qui, fuori dai componenti, così si provano a parte e si scrivono una volta sola.
 */

export type ImageAttempt = LocationAttempt;

export interface ImageSet {
  attempts: readonly ImageAttempt[];
  chosenAssetId?: string | undefined;
}

/** Qualche tentativo è ancora in coda o in lavorazione: serve continuare a guardare. */
export function attemptsAreWorking(set: ImageSet): boolean {
  return set.attempts.some(
    (attempt) => attempt.status === 'queued' || attempt.status === 'running',
  );
}

/**
 * Cosa si scrive di un tentativo che non ha ancora immagini, o che è fallito. `workingText` dice
 * cosa si sta disegnando («Sto disegnando il set…»); un fallimento dice perché, in parole semplici.
 */
export function describeAttempt(attempt: ImageAttempt, workingText: string): string {
  switch (attempt.status) {
    case 'queued':
      return 'In coda…';
    case 'running':
      return workingText;
    case 'succeeded':
      return attempt.assetIds.length === 0 ? 'Nessuna immagine' : 'Pronto';
    case 'failed':
      return failureText(attempt.errorCode);
  }
}

/**
 * Chi ha fatto il tentativo e quanto è costato, per la sua intestazione: «Seedream · Standard · 0,27 $».
 * Mentre lavora c'è solo il servizio scelto; senza nessuno dei due, niente.
 */
export function attemptWho(attempt: ImageAttempt): string {
  const cost = attempt.costUsd === undefined ? undefined : formatEstimate(attempt.costUsd);
  return [attempt.modelLabel, cost].filter((part) => part !== undefined).join(' · ');
}

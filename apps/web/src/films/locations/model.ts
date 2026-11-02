import type { LocationAttempt, LocationImages } from '@filmzy/contracts';

import { describeCode } from '../../settings/messages';

/**
 * Le piccole decisioni della schermata «I luoghi» (T3.7), fuori dai componenti così si provano a
 * parte. Cosa è pronto lo dice il server; qui si dice solo come mostrarlo.
 */

/** Qualche tentativo è ancora in coda o in lavorazione: serve continuare a guardare. */
export function imagesAreWorking(images: LocationImages): boolean {
  return images.attempts.some(
    (attempt) => attempt.status === 'queued' || attempt.status === 'running',
  );
}

/** Cosa si scrive di un tentativo che non ha ancora immagini, o che è fallito. */
export function attemptText(attempt: LocationAttempt): string {
  switch (attempt.status) {
    case 'queued':
      return 'In coda…';
    case 'running':
      return 'Sto disegnando il set…';
    case 'succeeded':
      return attempt.assetIds.length === 0 ? 'Nessuna immagine' : 'Pronto';
    case 'failed':
      return (
        describeCode(attempt.errorCode) ?? 'Non è riuscito. Puoi riprovare con un altro tentativo.'
      );
  }
}

/** Un luogo ha il suo riferimento quando una delle immagini è stata scelta. */
export function hasReference(images: LocationImages | undefined): boolean {
  return images?.chosenAssetId !== undefined;
}

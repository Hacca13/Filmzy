import type { LocationAttempt, LocationImages } from '@filmzy/contracts';

import { attemptsAreWorking, describeAttempt } from '../image-attempts';

/**
 * Le piccole decisioni della schermata «I luoghi» (T3.7), fuori dai componenti così si provano a
 * parte. Cosa è pronto lo dice il server; qui si dice solo come mostrarlo.
 */

/** Qualche tentativo è ancora in coda o in lavorazione: serve continuare a guardare. */
export const imagesAreWorking = (images: LocationImages): boolean => attemptsAreWorking(images);

/** Cosa si scrive di un tentativo che non ha ancora immagini, o che è fallito. */
export const attemptText = (attempt: LocationAttempt): string =>
  describeAttempt(attempt, 'Sto disegnando il set…');

/** Un luogo ha il suo riferimento quando una delle immagini è stata scelta. */
export function hasReference(images: LocationImages | undefined): boolean {
  return images?.chosenAssetId !== undefined;
}

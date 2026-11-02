import {
  MAX_SHOT_REFERENCES,
  type ShotImage,
  type ShotImageChoice,
  type ShotSpec,
} from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

/**
 * Le immagini che l'utente imposta su un'inquadratura (T4.2, D20), fuori dai servizi così si provano
 * a parte. Per ora sono tutte generate per quell'inquadratura (`from: 'generate'`).
 */

/** L'immagine impostata per un ruolo, se c'è (il primo e l'ultimo fotogramma sono uno solo). */
export const imageAssetId = (spec: ShotSpec, use: ShotImage['use']): string | undefined =>
  spec.images.find((image) => image.use === use)?.assetId;

const generated = (choice: ShotImageChoice): ShotImage => ({
  use: choice.use,
  from: 'generate',
  assetId: choice.assetId,
});

/**
 * Le scelte dell'utente diventano le immagini della scheda, ma solo se hanno senso: un'immagine tra
 * quelle che l'inquadratura può usare, un solo primo e un solo ultimo fotogramma, poche immagini di
 * ispirazione, e la stessa immagine non due volte (farebbe un ruolo doppio). Il resto non si
 * aggiusta in silenzio: si dice che la richiesta non va.
 */
export function imagesFromChoices(
  choices: readonly ShotImageChoice[],
  candidates: ReadonlySet<string>,
): ShotImage[] {
  if (choices.some((choice) => !candidates.has(choice.assetId))) {
    throw domainError(409, 'invalid_request', { details: { field: 'assetId' } });
  }
  const count = (use: ShotImage['use']) => choices.filter((choice) => choice.use === use).length;
  const repeated = new Set(choices.map((choice) => choice.assetId)).size !== choices.length;
  if (
    repeated ||
    count('first_frame') > 1 ||
    count('last_frame') > 1 ||
    count('reference') > MAX_SHOT_REFERENCES
  ) {
    throw domainError(409, 'invalid_request', { details: { field: 'images' } });
  }
  return choices.map(generated);
}

/**
 * La scheda con un nuovo ultimo fotogramma al posto di quello di prima. L'immagine scelta perde gli
 * altri ruoli che aveva: la stessa immagine non sta in due ruoli (come per `imagesFromChoices`).
 */
export function withLastFrame(spec: ShotSpec, assetId: string): ShotSpec {
  return {
    ...spec,
    images: [
      ...spec.images.filter((image) => image.use !== 'last_frame' && image.assetId !== assetId),
      generated({ use: 'last_frame', assetId }),
    ],
  };
}

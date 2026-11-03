import {
  MAX_SHOT_REFERENCES,
  type ImageCandidate,
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

/**
 * L'immagine come sta nella scheda: nata da una generazione, caricata dall'utente (T4.8), o presa da
 * un take (con il take e il momento, T4.6). Da dove viene lo dice il candidato, mai l'utente.
 */
const fromCandidate = (choice: ShotImageChoice, candidate: ImageCandidate): ShotImage =>
  candidate.mode === 'take_frame'
    ? {
        use: choice.use,
        from: 'take_frame',
        assetId: choice.assetId,
        ...(candidate.takeId === undefined ? {} : { takeId: candidate.takeId }),
        ...(candidate.atS === undefined ? {} : { atS: candidate.atS }),
      }
    : {
        use: choice.use,
        from: candidate.mode === 'upload' ? 'upload' : 'generate',
        assetId: choice.assetId,
      };

/**
 * Le scelte dell'utente diventano le immagini della scheda, ma solo se hanno senso: un'immagine tra
 * quelle che l'inquadratura può usare, un solo primo e un solo ultimo fotogramma, poche immagini di
 * ispirazione, e la stessa immagine non due volte (farebbe un ruolo doppio). Il resto non si
 * aggiusta in silenzio: si dice che la richiesta non va.
 */
export function imagesFromChoices(
  choices: readonly ShotImageChoice[],
  candidates: ReadonlyMap<string, ImageCandidate>,
): ShotImage[] {
  const found = choices.map((choice) => candidates.get(choice.assetId));
  if (found.some((candidate) => candidate === undefined)) {
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
  return choices.flatMap((choice, index) => {
    const candidate = found[index];
    return candidate === undefined ? [] : [fromCandidate(choice, candidate)];
  });
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
      { use: 'last_frame', from: 'generate', assetId },
    ],
  };
}

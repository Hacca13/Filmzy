import {
  locationImagesSchema,
  locationSchema,
  locationsSchema,
  sheetOptionsSchema,
  type RetouchOperation,
  type StartSheetBody,
} from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** I luoghi del film (T3.7): le proposte della bozza, quelli aggiunti, le immagini del set e la scelta. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/locations`;
const one = (filmId: string, locationId: string) =>
  `${base(filmId)}/${encodeURIComponent(locationId)}`;

export function fetchLocations(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), locationsSchema, { signal });
}

export function addLocation(filmId: string, proposalId: string) {
  return sendJson('POST', base(filmId), locationSchema, { proposalId });
}

/** Toglie un luogo dal film: la risposta è vuota (204). */
export function removeLocation(filmId: string, locationId: string) {
  return sendJson('DELETE', one(filmId, locationId), z.undefined());
}

export function fetchLocationImages(filmId: string, locationId: string, signal?: AbortSignal) {
  return getJson(`${one(filmId, locationId)}/images`, locationImagesSchema, { signal });
}

export function fetchLocationOptions(filmId: string, locationId: string, signal?: AbortSignal) {
  return getJson(`${one(filmId, locationId)}/images/options`, sheetOptionsSchema, { signal });
}

export function startLocationImages(filmId: string, locationId: string, body: StartSheetBody) {
  return sendJson('POST', `${one(filmId, locationId)}/images`, locationImagesSchema, body);
}

/** I servizi e la stima di un ritocco (T4.9). */
export function fetchRetouchOptions(
  filmId: string,
  locationId: string,
  assetId: string,
  operation: RetouchOperation,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ assetId, operation });
  return getJson(
    `${one(filmId, locationId)}/retouch/options?${query.toString()}`,
    sheetOptionsSchema,
    {
      signal,
    },
  );
}

/** Cosa chiede un ritocco: l'immagine, l'operazione e, se serve, le parole dell'utente. */
export interface RetouchRequest {
  assetId: string;
  operation: RetouchOperation;
  instruction?: string;
}

/** «Ritocca» (T4.9): la maschera (PNG) è il corpo della richiesta, il resto sta nell'indirizzo. */
export function startRetouch(
  filmId: string,
  locationId: string,
  request: RetouchRequest,
  mask: Blob,
  body: StartSheetBody,
) {
  const query = new URLSearchParams({ assetId: request.assetId, operation: request.operation });
  if (request.instruction !== undefined) query.set('instruction', request.instruction);
  if (body.modelId !== undefined) query.set('modelId', body.modelId);
  if (body.spendConfirmed === true) query.set('spendConfirmed', 'true');
  return sendJson(
    'POST',
    `${one(filmId, locationId)}/retouch?${query.toString()}`,
    locationImagesSchema,
    mask,
  );
}

export function chooseLocationImage(filmId: string, locationId: string, assetId: string) {
  return sendJson('PUT', `${one(filmId, locationId)}/images/choice`, locationImagesSchema, {
    assetId,
  });
}

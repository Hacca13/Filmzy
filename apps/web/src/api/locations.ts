import {
  locationImagesSchema,
  locationSchema,
  locationsSchema,
  sheetOptionsSchema,
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

export function chooseLocationImage(filmId: string, locationId: string, assetId: string) {
  return sendJson('PUT', `${one(filmId, locationId)}/images/choice`, locationImagesSchema, {
    assetId,
  });
}

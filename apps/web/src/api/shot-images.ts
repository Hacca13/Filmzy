import { shotImagesSchema, type SetShotImagesBody } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le immagini di un'inquadratura (T4.2): quali sono impostate, quali si possono scegliere, i servizi video. */

const path = (filmId: string, shotId: string) =>
  `/projects/${encodeURIComponent(filmId)}/shots/${encodeURIComponent(shotId)}/images`;

export function fetchShotImages(filmId: string, shotId: string, signal?: AbortSignal) {
  return getJson(path(filmId, shotId), shotImagesSchema, { signal });
}

export function setShotImages(filmId: string, shotId: string, body: SetShotImagesBody) {
  return sendJson('PUT', path(filmId, shotId), shotImagesSchema, body);
}

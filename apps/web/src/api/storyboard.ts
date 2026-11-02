import { sheetOptionsSchema, shotStoryboardSchema, type StartSheetBody } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Lo storyboard di un'inquadratura (T4.1): le varianti, i servizi con la stima, la richiesta e la scelta. */

const base = (filmId: string, shotId: string) =>
  `/projects/${encodeURIComponent(filmId)}/shots/${encodeURIComponent(shotId)}/storyboard`;

export function fetchStoryboard(filmId: string, shotId: string, signal?: AbortSignal) {
  return getJson(base(filmId, shotId), shotStoryboardSchema, { signal });
}

export function fetchStoryboardOptions(filmId: string, shotId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId, shotId)}/options`, sheetOptionsSchema, { signal });
}

export function startStoryboard(filmId: string, shotId: string, body: StartSheetBody) {
  return sendJson('POST', base(filmId, shotId), shotStoryboardSchema, body);
}

export function chooseStoryboard(filmId: string, shotId: string, assetId: string) {
  return sendJson('PUT', `${base(filmId, shotId)}/choice`, shotStoryboardSchema, { assetId });
}

import { sheetOptionsSchema, shotTakesSchema, type StartSheetBody } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** I take video di un'inquadratura (T4.3): l'elenco, i servizi con la stima e «Genera». */

const base = (filmId: string, shotId: string) =>
  `/projects/${encodeURIComponent(filmId)}/shots/${encodeURIComponent(shotId)}/takes`;

export function fetchTakes(filmId: string, shotId: string, signal?: AbortSignal) {
  return getJson(base(filmId, shotId), shotTakesSchema, { signal });
}

export function fetchTakeOptions(filmId: string, shotId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId, shotId)}/options`, sheetOptionsSchema, { signal });
}

export function startTake(filmId: string, shotId: string, body: StartSheetBody) {
  return sendJson('POST', base(filmId, shotId), shotTakesSchema, body);
}

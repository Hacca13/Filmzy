import {
  sheetOptionsSchema,
  shotImagesSchema,
  shotTakesSchema,
  type StartSheetBody,
} from '@filmzy/contracts';

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

/** «Tieni questo take» (T4.6): è quello che la card fa vedere al posto del più recente. */
export function chooseTake(filmId: string, shotId: string, takeId: string) {
  return sendJson('PUT', `${base(filmId, shotId)}/choice`, shotTakesSchema, { takeId });
}

/** «Usa questo fotogramma come punto di partenza» (T4.6): diventa il primo fotogramma. */
export function useTakeFrame(filmId: string, shotId: string, takeId: string, atS: number) {
  return sendJson(
    'POST',
    `${base(filmId, shotId)}/${encodeURIComponent(takeId)}/frame`,
    shotImagesSchema,
    { atS },
  );
}

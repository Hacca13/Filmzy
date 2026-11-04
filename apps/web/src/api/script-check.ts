import {
  scriptCheckEstimateSchema,
  scriptCheckViewSchema,
  type RunScriptCheckBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Il controllo della storia (T5.2): l'ultimo controllo, la stima e «Controlla la storia». */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/script-check`;

export function fetchScriptCheck(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), scriptCheckViewSchema, { signal });
}

export function estimateScriptCheck(filmId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId)}/estimate`, scriptCheckEstimateSchema, { signal });
}

export function runScriptCheck(filmId: string, body: RunScriptCheckBody) {
  return sendJson('POST', base(filmId), scriptCheckViewSchema, body);
}

import { assemblyViewSchema } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Il montaggio del film (T5.7): a che punto è, e «Monta il film». Non costa niente. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/assembly`;

export function fetchAssembly(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), assemblyViewSchema, { signal });
}

export function startAssembly(filmId: string) {
  return sendJson('POST', base(filmId), assemblyViewSchema);
}

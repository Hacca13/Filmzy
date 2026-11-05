import { API_PREFIX, assemblyViewSchema, type SetAssemblySceneBody } from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** Il montaggio del film (T5.7): a che punto è, e «Monta il film». Non costa niente. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/assembly`;

export function fetchAssembly(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), assemblyViewSchema, { signal });
}

export function startAssembly(filmId: string) {
  return sendJson('POST', base(filmId), assemblyViewSchema);
}

/** La spunta di una scena (D85): togliere non cancella niente. */
export function setAssemblyScene(filmId: string, sceneNumber: number, body: SetAssemblySceneBody) {
  return sendJson(
    'PUT',
    `${base(filmId)}/scenes/${String(sceneNumber)}`,
    assemblyViewSchema,
    body,
  );
}

/** «Togli» su un film montato prima: lo cancella dal computer. */
export function removeEarlierFilm(filmId: string, assemblyId: string) {
  return sendJson('DELETE', `${base(filmId)}/${encodeURIComponent(assemblyId)}`, z.undefined());
}

/** Dove si scarica un film montato prima: il server lo manda come allegato, col suo nome. */
export function earlierFilmUrl(filmId: string, assemblyId: string): string {
  return `/${API_PREFIX}${base(filmId)}/${encodeURIComponent(assemblyId)}/file`;
}

import {
  moodboardViewSchema,
  sheetOptionsSchema,
  type GenerateMoodboardBody,
  type SaveMoodboardPartBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Il moodboard del film (T4.10, D37): si legge, si scrive a mano, si fa creare, si tolgono le immagini. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/moodboard`;

export function fetchMoodboard(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), moodboardViewSchema, { signal });
}

export function saveMoodboardPart(filmId: string, body: SaveMoodboardPartBody) {
  return sendJson('PUT', base(filmId), moodboardViewSchema, body);
}

/** I servizi per le immagini e la stima di tutto il lavoro, per il film o per una scena. */
export function fetchMoodboardOptions(
  filmId: string,
  sceneId: string | undefined,
  signal?: AbortSignal,
) {
  const query = sceneId === undefined ? '' : `?${new URLSearchParams({ sceneId }).toString()}`;
  return getJson(`${base(filmId)}/options${query}`, sheetOptionsSchema, { signal });
}

/** «Crea il moodboard»: colori e consigli nuovi subito, le immagini in coda. */
export function generateMoodboard(filmId: string, body: GenerateMoodboardBody) {
  return sendJson('POST', `${base(filmId)}/generate`, moodboardViewSchema, body);
}

export function removeMoodboardReference(filmId: string, referenceId: string) {
  return sendJson(
    'DELETE',
    `${base(filmId)}/references/${encodeURIComponent(referenceId)}`,
    moodboardViewSchema,
  );
}

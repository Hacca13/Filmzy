import { moodboardViewSchema, type SaveMoodboardPartBody } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Il moodboard del film (T4.10, D37): si legge, e palette e consigli si scrivono a mano. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/moodboard`;

export function fetchMoodboard(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), moodboardViewSchema, { signal });
}

export function saveMoodboardPart(filmId: string, body: SaveMoodboardPartBody) {
  return sendJson('PUT', base(filmId), moodboardViewSchema, body);
}

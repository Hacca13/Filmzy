import {
  draftReviewSchema,
  screenplayEstimateSchema,
  screenplayVersionSchema,
  screenplayVersionsSchema,
  type EditFinalBody,
  type WriteFinalBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Il riepilogo e la sceneggiatura finale (T3.8): le differenze, la stima, scriverla e correggerla. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}`;
const finalPath = (filmId: string) => `${base(filmId)}/screenplay/final`;

export function fetchReview(filmId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId)}/review`, draftReviewSchema, { signal });
}

export function estimateFinal(filmId: string, signal?: AbortSignal) {
  return sendJson(
    'POST',
    `${finalPath(filmId)}/estimate`,
    screenplayEstimateSchema,
    {},
    { signal },
  );
}

export function fetchFinalVersions(filmId: string, signal?: AbortSignal) {
  return getJson(`${finalPath(filmId)}/versions`, screenplayVersionsSchema, { signal });
}

export function fetchFinalVersion(filmId: string, versionId: string, signal?: AbortSignal) {
  return getJson(
    `${finalPath(filmId)}/versions/${encodeURIComponent(versionId)}`,
    screenplayVersionSchema,
    { signal },
  );
}

export function writeFinal(filmId: string, body: WriteFinalBody) {
  return sendJson('POST', finalPath(filmId), screenplayVersionSchema, body);
}

export function editFinal(filmId: string, body: EditFinalBody) {
  return sendJson('PUT', finalPath(filmId), screenplayVersionSchema, body);
}

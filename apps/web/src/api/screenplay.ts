import {
  screenplayEstimateSchema,
  screenplayVersionSchema,
  screenplayVersionsSchema,
  type ReviseBody,
  type ScreenplayEstimateBody,
  type WriteDraftBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** La bozza della sceneggiatura (T3.4): le versioni, la stima, scriverla e chiedere modifiche. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/screenplay`;

export function fetchScreenplayVersions(filmId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId)}/versions`, screenplayVersionsSchema, { signal });
}

export function fetchScreenplayVersion(filmId: string, versionId: string, signal?: AbortSignal) {
  return getJson(
    `${base(filmId)}/versions/${encodeURIComponent(versionId)}`,
    screenplayVersionSchema,
    { signal },
  );
}

export function estimateScreenplay(
  filmId: string,
  body: ScreenplayEstimateBody,
  signal?: AbortSignal,
) {
  return sendJson('POST', `${base(filmId)}/estimate`, screenplayEstimateSchema, body, { signal });
}

export function writeScreenplayDraft(filmId: string, body: WriteDraftBody) {
  return sendJson('POST', `${base(filmId)}/draft`, screenplayVersionSchema, body);
}

export function reviseScreenplay(filmId: string, body: ReviseBody) {
  return sendJson('POST', `${base(filmId)}/revise`, screenplayVersionSchema, body);
}

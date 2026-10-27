import { configDiffSchema, publishResponseSchema, releaseListSchema } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Differenze, storico e ripristino della configurazione (architettura §4.5 punti 3 e 4). */

/** Cosa cambia pubblicando la bozza. */
export function fetchDraftDiff(signal?: AbortSignal) {
  return getJson('/troupe/draft/diff', configDiffSchema, { signal });
}

/** Cosa tornerebbe com'era ripristinando quella versione. */
export function fetchReleaseDiff(releaseId: string, signal?: AbortSignal) {
  return getJson(`/troupe/releases/${encodeURIComponent(releaseId)}/diff`, configDiffSchema, {
    signal,
  });
}

export function fetchReleases(signal?: AbortSignal) {
  return getJson('/troupe/releases', releaseListSchema, { signal });
}

export function restoreRelease(releaseId: string, note: string) {
  return sendJson(
    'POST',
    `/troupe/releases/${encodeURIComponent(releaseId)}/restore`,
    publishResponseSchema,
    { note },
  );
}

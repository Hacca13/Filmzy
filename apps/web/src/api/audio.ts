import {
  audioClipSchema,
  audioOverviewSchema,
  audioTimelineSchema,
  sheetOptionsSchema,
  soundSuggestionsEstimateSchema,
  soundSuggestionsSchema,
  type AudioOverview,
  type AudioTimeline,
  type CreateAudioClipBody,
  type StartSheetBody,
  type UpdateAudioClipBody,
  type UpdateAudioTrackBody,
  type UploadAudioQuery,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le tracce audio del film (T5.5, T5.6): cosa c'è, dove cade nel tempo e cosa si può fare. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/audio`;

const clipUrl = (filmId: string, clipId: string) =>
  `${base(filmId)}/clips/${encodeURIComponent(clipId)}`;

/** Quello che l'editor delle tracce legge: i suoni e dove cadono nel tempo. */
export type SoundEditor = AudioOverview & { timeline: AudioTimeline };

export async function fetchSoundEditor(filmId: string, signal?: AbortSignal): Promise<SoundEditor> {
  const [overview, timeline] = await Promise.all([
    getJson(base(filmId), audioOverviewSchema, { signal }),
    getJson(`${base(filmId)}/timeline`, audioTimelineSchema, { signal }),
  ]);
  return { ...overview, timeline };
}

export function updateTrack(filmId: string, trackId: string, body: UpdateAudioTrackBody) {
  return sendJson(
    'PUT',
    `${base(filmId)}/tracks/${encodeURIComponent(trackId)}`,
    audioOverviewSchema,
    body,
  );
}

/** L'audio originale di un take: si accende e si spegne senza rigenerare niente (D43). */
export function setTakeNativeAudio(filmId: string, takeId: string, on: boolean) {
  return sendJson(
    'PUT',
    `${base(filmId)}/takes/${encodeURIComponent(takeId)}/native`,
    audioOverviewSchema,
    { on },
  );
}

export function createAudioClip(filmId: string, body: CreateAudioClipBody) {
  return sendJson('POST', `${base(filmId)}/clips`, audioClipSchema, body);
}

export function updateAudioClip(filmId: string, clipId: string, body: UpdateAudioClipBody) {
  return sendJson('PUT', clipUrl(filmId, clipId), audioClipSchema, body);
}

export function removeAudioClip(filmId: string, clipId: string) {
  return sendJson('DELETE', clipUrl(filmId, clipId), audioOverviewSchema);
}

export function fetchAudioOptions(filmId: string, clipId: string, signal?: AbortSignal) {
  return getJson(`${clipUrl(filmId, clipId)}/options`, sheetOptionsSchema, { signal });
}

export function startAudioVariant(filmId: string, clipId: string, body: StartSheetBody) {
  return sendJson('POST', `${clipUrl(filmId, clipId)}/variants`, audioClipSchema, body);
}

/** «Cambia»: la variante da usare. Il video non cambia. */
export function chooseAudioVariant(filmId: string, clipId: string, variantId: string) {
  return sendJson('PUT', `${clipUrl(filmId, clipId)}/variant`, audioClipSchema, { variantId });
}

/** Un file dell'utente, come nuova clip: il file è il corpo, e non va mai a un fornitore (D27). */
export function uploadAudioClip(filmId: string, query: UploadAudioQuery, file: Blob) {
  const params = new URLSearchParams({
    kind: query.kind,
    sceneId: query.sceneId,
    description: query.description,
  });
  if (query.shotId !== undefined) params.set('shotId', query.shotId);
  if (query.startS !== undefined) params.set('startS', String(query.startS));
  return sendJson('POST', `${base(filmId)}/uploads?${params.toString()}`, audioClipSchema, file);
}

/** «Carica un file» su un blocco che c'è già: diventa una variante, subito in uso (D27). */
export function uploadAudioVariant(filmId: string, clipId: string, file: Blob) {
  return sendJson('POST', `${clipUrl(filmId, clipId)}/uploads`, audioClipSchema, file);
}

export function estimateSoundSuggestions(filmId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId)}/suggestions/estimate`, soundSuggestionsEstimateSchema, {
    signal,
  });
}

/** «Suggerisci i suoni»: proposte da accettare o scartare, che non si salvano. */
export function suggestSounds(filmId: string, spendConfirmed: boolean) {
  return sendJson('POST', `${base(filmId)}/suggestions`, soundSuggestionsSchema, {
    spendConfirmed,
  });
}

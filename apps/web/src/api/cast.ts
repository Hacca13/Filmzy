import {
  castEstimateSchema,
  castSchema,
  castSuggestionsSchema,
  characterSchema,
  type CastingSuggestion,
  type SuggestCastBody,
  type UpdateCharacterBody,
} from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** Il cast del film (T3.5): le proposte del casting, i personaggi scelti e le loro modifiche. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/cast`;

export function fetchCast(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), castSchema, { signal });
}

export function estimateCast(filmId: string, count: number, signal?: AbortSignal) {
  return sendJson('POST', `${base(filmId)}/estimate`, castEstimateSchema, { count }, { signal });
}

export function suggestCast(filmId: string, body: SuggestCastBody) {
  return sendJson('POST', `${base(filmId)}/suggestions`, castSuggestionsSchema, body);
}

export function addCharacter(filmId: string, suggestion: CastingSuggestion) {
  return sendJson('POST', `${base(filmId)}/characters`, characterSchema, { suggestion });
}

export function updateCharacter(filmId: string, characterId: string, body: UpdateCharacterBody) {
  return sendJson(
    'PATCH',
    `${base(filmId)}/characters/${encodeURIComponent(characterId)}`,
    characterSchema,
    body,
  );
}

/** Toglie un personaggio dal cast: la risposta è vuota (204). */
export function removeCharacter(filmId: string, characterId: string) {
  return sendJson(
    'DELETE',
    `${base(filmId)}/characters/${encodeURIComponent(characterId)}`,
    z.undefined(),
  );
}

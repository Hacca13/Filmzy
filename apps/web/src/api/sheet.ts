import {
  API_PREFIX,
  characterSheetSchema,
  sheetOptionsSchema,
  type StartSheetBody,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** La scheda di un personaggio (T3.6): le tre immagini, i servizi tra cui scegliere e il volto bloccato. */

const base = (filmId: string, characterId: string) =>
  `/projects/${encodeURIComponent(filmId)}/cast/characters/${encodeURIComponent(characterId)}/sheet`;

export function fetchSheet(filmId: string, characterId: string, signal?: AbortSignal) {
  return getJson(base(filmId, characterId), characterSheetSchema, { signal });
}

export function fetchSheetOptions(filmId: string, characterId: string, signal?: AbortSignal) {
  return getJson(`${base(filmId, characterId)}/options`, sheetOptionsSchema, { signal });
}

export function startSheet(filmId: string, characterId: string, body: StartSheetBody) {
  return sendJson('POST', base(filmId, characterId), characterSheetSchema, body);
}

export function lockSheet(filmId: string, characterId: string, attempt: number) {
  return sendJson('PUT', `${base(filmId, characterId)}/lock`, characterSheetSchema, { attempt });
}

export function unlockSheet(filmId: string, characterId: string) {
  return sendJson('DELETE', `${base(filmId, characterId)}/lock`, characterSheetSchema);
}

/** Dove si apre un'immagine: il server la serve dalla cartella del film. */
export function assetUrl(assetId: string): string {
  return `/${API_PREFIX}/assets/${encodeURIComponent(assetId)}`;
}

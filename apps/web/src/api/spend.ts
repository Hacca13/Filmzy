import { connectionsOverviewSchema, filmSpendSchema, spendOverviewSchema } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** La spesa e i limiti (T3.1, D30): si legge dagli scontrini, i limiti li sceglie l'utente. */

export function fetchSpend(signal?: AbortSignal) {
  return getJson('/spend', spendOverviewSchema, { signal });
}

/** Quanto è costato un film, per ruolo e per servizio (T4.7). */
export function fetchFilmSpend(projectId: string, signal?: AbortSignal) {
  return getJson(`/spend/films/${encodeURIComponent(projectId)}`, filmSpendSchema, { signal });
}

/** «Chiedi conferma sopra questa cifra»; `null` lo toglie. */
export function setConfirmAbove(usd: number | null) {
  return sendJson('PUT', '/limits/confirm-above', connectionsOverviewSchema, { usd });
}

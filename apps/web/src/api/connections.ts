import {
  connectionsOverviewSchema,
  connectionTestResultSchema,
  type ModelGroup,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/**
 * Fornitori, servizi e limiti (T2.7). Ogni modifica risponde con il quadro aggiornato, così la
 * pagina non deve rileggerlo.
 */

const connection = (id: string) => `/connections/${encodeURIComponent(id)}`;

export function fetchConnections(signal?: AbortSignal) {
  return getJson('/connections', connectionsOverviewSchema, { signal });
}

export function setServices(connectionId: string, modelIds: readonly string[]) {
  return sendJson('PUT', `${connection(connectionId)}/services`, connectionsOverviewSchema, {
    modelIds,
  });
}

export function setProviderDefault(connectionId: string, modelId: string) {
  return sendJson('PUT', `${connection(connectionId)}/default-service`, connectionsOverviewSchema, {
    modelId,
  });
}

export function setGroupDefault(group: ModelGroup, connectionId: string) {
  return sendJson('PUT', `/groups/${group}/default`, connectionsOverviewSchema, { connectionId });
}

/** `null` toglie il limite. */
export function setMonthlyCap(connectionId: string, usd: number | null) {
  return sendJson('PUT', `${connection(connectionId)}/monthly-cap`, connectionsOverviewSchema, {
    usd,
  });
}

/** La prova che non costa: una lettura al fornitore. */
export function testConnection(connectionId: string) {
  return sendJson('POST', `${connection(connectionId)}/test`, connectionTestResultSchema);
}

/** Il limite di spesa per film; `null` lo toglie. Per ora si scrive e basta (T3.1). */
export function setFilmBudget(usd: number | null) {
  return sendJson('PUT', '/limits/film-budget', connectionsOverviewSchema, { usd });
}

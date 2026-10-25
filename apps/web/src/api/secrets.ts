import { secretsViewSchema } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le chiavi: si vede solo se ci sono. Il valore si scrive e non si rilegge mai (D25). */

export function fetchSecrets(signal?: AbortSignal) {
  return getJson('/secrets', secretsViewSchema, { signal });
}

export function saveSecret(name: string, value: string) {
  return sendJson('PUT', `/secrets/${encodeURIComponent(name)}`, secretsViewSchema, { value });
}

export function removeSecret(name: string) {
  return sendJson('DELETE', `/secrets/${encodeURIComponent(name)}`, secretsViewSchema);
}

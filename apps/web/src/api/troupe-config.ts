import {
  draftViewSchema,
  publishResponseSchema,
  secretsViewSchema,
  type TroupeConfigData,
} from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** La bozza della configurazione e la sua pubblicazione (architettura §4.5). */

export function fetchDraft(signal?: AbortSignal) {
  return getJson('/troupe/draft', draftViewSchema, { signal });
}

export function saveDraft(config: TroupeConfigData) {
  return sendJson('PUT', '/troupe/draft', draftViewSchema, { config });
}

export function discardDraft() {
  return sendJson('DELETE', '/troupe/draft', draftViewSchema);
}

export function resetDraftToProgramValues() {
  return sendJson('POST', '/troupe/draft/reset', draftViewSchema);
}

export function publishDraft(note: string) {
  return sendJson('POST', '/troupe/publish', publishResponseSchema, { note });
}

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

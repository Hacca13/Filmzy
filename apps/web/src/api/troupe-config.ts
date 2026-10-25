import { draftViewSchema, publishResponseSchema, type TroupeConfigData } from '@filmzy/contracts';

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

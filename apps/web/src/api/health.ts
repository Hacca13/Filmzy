import { healthResponseSchema } from '@filmzy/contracts';

import { getJson } from './client';

/** Chiede al server locale se è in piedi. Rifiuta con un `ApiError` se non lo è. */
export function fetchHealth(signal?: AbortSignal) {
  return getJson('/health', healthResponseSchema, { signal });
}

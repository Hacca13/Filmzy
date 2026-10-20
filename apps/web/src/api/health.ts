import { healthResponseSchema } from '@filmzy/contracts';

import { delay } from '../lib/delay';
import { getJson } from './client';
import type { GetJsonOptions } from './client';

/** Chiede al server locale se è in piedi. Rifiuta con un `ApiError` se non lo è. */
export function fetchHealth(options: GetJsonOptions = {}) {
  return getJson('/health', healthResponseSchema, options);
}

interface WaitOptions extends GetJsonOptions {
  /** Quanti tentativi fare prima di arrendersi. */
  attempts?: number;
  /** Pausa tra un tentativo e l'altro. */
  delayMs?: number;
}

/**
 * Aspetta che il server locale sia pronto, riprovando per un po'. All'avvio l'interfaccia può
 * aprirsi qualche secondo prima del server: un solo tentativo mostrerebbe un errore che basterebbe
 * aspettare per vedere sparire. Se la chiamata viene annullata, si ferma subito.
 */
export async function waitUntilServerIsReady({
  attempts = 30,
  delayMs = 1000,
  ...requestOptions
}: WaitOptions = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fetchHealth(requestOptions);
    } catch (error) {
      const isLastAttempt = attempt >= attempts;
      if (isLastAttempt || requestOptions.signal?.aborted) {
        throw error;
      }
      await delay(delayMs, requestOptions.signal);
    }
  }
}

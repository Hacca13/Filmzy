import { ApiError, createFalClient } from '@fal-ai/client';

import { readSecret } from '../config/secrets.js';
import { ProviderError } from '../provider-error.js';
import { keyFor, probe } from './probe.js';
import type {
  AdapterFactory,
  AdapterOptions,
  ConnectionTestOptions,
  MediaAdapter,
  MediaFile,
  MediaRequest,
  MediaStatus,
} from './types.js';

/**
 * L'adapter di fal (architettura §4.7): si manda il lavoro in coda e si chiede com'è andata con il
 * **polling**, perché in locale fal non può consegnare webhook a un indirizzo privato (D29).
 *
 * I file che fal restituisce sono URL che scadono: qui si scaricano subito in byte, così chi
 * chiama può copiarli nella cartella del progetto (regola d'oro 11).
 */

/** Il poco che serve della coda di fal: così i test non toccano la rete. */
export interface FalQueue {
  submit(endpointId: string, input: Record<string, unknown>): Promise<{ requestId: string }>;
  status(
    endpointId: string,
    requestId: string,
  ): Promise<{ state: 'queued' | 'running' | 'completed' }>;
  result(endpointId: string, requestId: string): Promise<{ data: unknown }>;
  cancel(endpointId: string, requestId: string): Promise<void>;
}

export type FalFetch = (url: string) => Promise<MediaFile>;

export function falQueueFromClient(options: AdapterOptions): FalQueue {
  const client = createFalClient({
    credentials: readSecret(options.connection.api_key, options.secrets),
    ...(options.connection.base_url === undefined ? {} : { proxyUrl: options.connection.base_url }),
    ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
  });

  return {
    async submit(endpointId, input) {
      const queued = await client.queue.submit(endpointId, { input });
      return { requestId: queued.request_id };
    },
    async status(endpointId, requestId) {
      const status = await client.queue.status(endpointId, { requestId });
      if (status.status === 'IN_QUEUE') return { state: 'queued' };
      if (status.status === 'IN_PROGRESS') return { state: 'running' };
      return { state: 'completed' };
    },
    async result(endpointId, requestId) {
      const result = await client.queue.result(endpointId, { requestId });
      return { data: result.data };
    },
    async cancel(endpointId, requestId) {
      await client.queue.cancel(endpointId, { requestId });
    },
  };
}

/** Scarica un file del fornitore: è l'unico momento in cui le sue URL servono. */
export function fetchFalFile(options: AdapterOptions): FalFetch {
  const doFetch = options.fetch ?? globalThis.fetch;

  return async (url: string): Promise<MediaFile> => {
    const response = await doFetch(url);
    if (!response.ok) {
      throw new ProviderError(
        'provider_unavailable',
        true,
        `Il file del servizio non si è scaricato (errore ${String(response.status)}).`,
        { connectionId: options.connectionId },
      );
    }

    return {
      fileName: fileNameFrom(url),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      bytes: new Uint8Array(await response.arrayBuffer()),
    };
  };
}

export function falMediaAdapter(
  options: AdapterOptions,
  queue: FalQueue,
  fetchFile: FalFetch,
): MediaAdapter {
  /** Il lavoro mandato in coda: serve a sapere a quale punto d'accesso chiedere lo stato. */
  const endpoints = new Map<string, string>();

  return {
    async submit(req: MediaRequest) {
      const input = req.providerInput;
      if (input === undefined) {
        throw new ProviderError(
          'invalid_request',
          false,
          `La richiesta per "${req.modelId}" non ha un corpo: lo costruisce il traduttore della famiglia.`,
          { role: req.role, modelId: req.modelId },
        );
      }

      try {
        const { requestId } = await queue.submit(req.providerModel, input);
        endpoints.set(requestId, req.providerModel);
        return { providerRequestId: requestId };
      } catch (error) {
        throw toProviderError(error, req.role, req.modelId, options);
      }
    },

    async poll(providerRequestId: string): Promise<MediaStatus> {
      const endpoint = endpoints.get(providerRequestId);
      if (endpoint === undefined) {
        throw new ProviderError(
          'not_found',
          false,
          `Non so a quale servizio chiedere del lavoro "${providerRequestId}".`,
          { connectionId: options.connectionId },
        );
      }

      let data: unknown;
      try {
        const status = await queue.status(endpoint, providerRequestId);
        if (status.state !== 'completed') return { state: status.state };
        data = (await queue.result(endpoint, providerRequestId)).data;
      } catch (error) {
        const asProviderError = toProviderError(error, undefined, undefined, options);
        // Un lavoro andato male è uno stato, non un'eccezione: la chiamata è riuscita (§4.7).
        return {
          state: 'failed',
          code: asProviderError.code,
          retryable: asProviderError.retryable,
          message: asProviderError.message,
        };
      }

      const urls = fileUrls(data);
      if (urls.length === 0) {
        return {
          state: 'failed',
          code: 'invalid_output',
          retryable: false,
          message: 'Il servizio ha finito il lavoro ma non ha restituito nessun file.',
        };
      }

      const files = await Promise.all(urls.map(fetchFile));
      return { state: 'succeeded', files, usage: { images: files.length } };
    },

    async cancel(providerRequestId: string) {
      const endpoint = endpoints.get(providerRequestId);
      if (endpoint === undefined) return;
      await queue.cancel(endpoint, providerRequestId);
    },
  };
}

/**
 * I file nella risposta di fal: ogni famiglia li mette dove vuole (`images`, `video`, `audio`),
 * ma sono sempre oggetti con una `url`. Si cercano così invece di indovinare la forma di ognuna.
 */
export function fileUrls(data: unknown): string[] {
  const urls: string[] = [];

  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value !== 'object' || value === null) return;

    const record = value as Record<string, unknown>;
    if (typeof record.url === 'string') {
      urls.push(record.url);
      return;
    }
    for (const item of Object.values(record)) walk(item);
  };

  walk(data);
  return urls;
}

function fileNameFrom(url: string): string {
  const last = url.split('?')[0]?.split('/').at(-1);
  return last === undefined || last === '' ? 'file' : last;
}

/** Gli errori di fal diventano codici di §4.10, come per gli adapter di testo. */
function toProviderError(
  error: unknown,
  role: string | undefined,
  modelId: string | undefined,
  options: AdapterOptions,
): ProviderError {
  if (error instanceof ProviderError) return error;

  const details = { role, modelId, connectionId: options.connectionId };

  if (error instanceof ApiError) {
    const status = error.status;
    if (status === 401 || status === 403) {
      return new ProviderError(
        'provider_auth_failed',
        false,
        'La chiave del servizio non è valida.',
        details,
      );
    }
    if (status === 402) {
      return new ProviderError(
        'provider_quota_exhausted',
        false,
        'Il credito presso il servizio è finito.',
        details,
      );
    }
    if (status === 429) {
      return new ProviderError('rate_limited', true, 'Troppe richieste al servizio.', details);
    }
    if (status >= 500) {
      return new ProviderError(
        'provider_unavailable',
        true,
        `Il servizio non risponde (errore ${String(status)}).`,
        details,
      );
    }
    return new ProviderError(
      'invalid_request',
      false,
      `Il servizio ha rifiutato la richiesta (errore ${String(status)}).`,
      details,
    );
  }

  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return new ProviderError('timeout', true, 'Il servizio non ha risposto in tempo.', details);
  }

  return new ProviderError(
    'provider_unavailable',
    true,
    error instanceof Error ? error.message : String(error),
    details,
  );
}

/**
 * Il prezzo di un servizio: una lettura gratuita che vuole una chiave valida (401 se non lo è).
 * Verificato sulla pagina «Model Pricing» di fal, 27/10/2026: `GET /v1/models/pricing?endpoint_id=`
 * con `Authorization: Key …`. L'elenco dei servizi di fal non serve: lì la chiave è facoltativa,
 * quindi non proverebbe niente.
 */
async function testFalConnection(options: ConnectionTestOptions): Promise<void> {
  const key = keyFor(options);
  if (options.sampleProviderModel === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `La connessione "${options.connectionId}" non ha nessun servizio con cui provarla.`,
      { connectionId: options.connectionId },
    );
  }

  await probe(options, {
    url: `https://api.fal.ai/v1/models/pricing?endpoint_id=${encodeURIComponent(options.sampleProviderModel)}`,
    headers: { Authorization: `Key ${key ?? ''}` },
  });
}

export const falAdapterFactory: AdapterFactory = {
  name: 'fal',
  media: (options) => falMediaAdapter(options, falQueueFromClient(options), fetchFalFile(options)),
  testConnection: testFalConnection,
};

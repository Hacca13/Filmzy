import { parseSecretRef, readSecret } from '../config/secrets.js';
import { ProviderError } from '../provider-error.js';
import type { AdapterOptions } from './types.js';

/**
 * La prova di connessione che non costa (architettura §4.7, T2.7): una richiesta in sola lettura al
 * fornitore, che dice se risponde e se la chiave è buona. Mai una generazione.
 *
 * Gli errori portano il codice del dominio e **mai la chiave**: non entra nei messaggi (D25).
 */

/** Un fornitore che non risponde non deve far aspettare chi preme «Prova la connessione». */
const PROBE_TIMEOUT_MS = 15_000;

/** La chiave da usare, o `undefined` se la connessione non ne ha bisogno (`none`, o `env:NOME?` assente). */
export function keyFor(options: AdapterOptions): string | undefined {
  const parsed = parseSecretRef(options.connection.api_key);
  if (parsed === undefined || parsed.kind === 'none') return undefined;

  const key = readSecret(options.connection.api_key, options.secrets);
  if (key !== undefined && key.trim() !== '') return key;
  if (parsed.optional) return undefined;

  throw new ProviderError(
    'secret_missing',
    false,
    `Manca la chiave della connessione "${options.connectionId}".`,
    { connectionId: options.connectionId },
  );
}

export interface ProbeRequest {
  url: string;
  headers?: Record<string, string>;
}

export async function probe(options: AdapterOptions, request: ProbeRequest): Promise<void> {
  const doFetch = options.fetch ?? globalThis.fetch;
  const details = { connectionId: options.connectionId };

  let response: Response;
  try {
    response = await doFetch(request.url, {
      method: 'GET',
      ...(request.headers === undefined ? {} : { headers: request.headers }),
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new ProviderError('timeout', true, 'Il servizio non ha risposto in tempo.', details);
    }
    throw new ProviderError(
      'provider_unavailable',
      true,
      'Non riesco a raggiungere il servizio.',
      details,
    );
  }

  if (response.ok) return;
  throw statusError(response.status, details);
}

function statusError(status: number, details: { connectionId: string }): ProviderError {
  if (status === 401 || status === 403) {
    return new ProviderError(
      'provider_auth_failed',
      false,
      'Il servizio non ha accettato la chiave.',
      details,
    );
  }
  if (status === 429) {
    return new ProviderError('rate_limited', true, 'Troppe richieste al servizio.', details);
  }
  if (status === 404) {
    return new ProviderError(
      'config_invalid',
      false,
      "L'indirizzo del servizio non risponde come previsto.",
      { ...details, field: 'base_url' },
    );
  }
  return new ProviderError(
    'provider_unavailable',
    status >= 500,
    `Il servizio ha risposto con un errore (${String(status)}).`,
    details,
  );
}

/** Toglie la barra finale: `https://x/v1/` e `https://x/v1` sono lo stesso indirizzo. */
export function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

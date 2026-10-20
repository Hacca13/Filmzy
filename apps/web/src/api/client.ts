/** Qualunque oggetto che sa controllare un dato sconosciuto (gli schemi Zod di `@filmzy/contracts`). */
export interface Parser<T> {
  parse(input: unknown): T;
}

/** Cosa è andato storto in una chiamata al server locale, in una forma che l'interfaccia sa gestire. */
export type ApiErrorCode = 'network_error' | 'http_error' | 'invalid_response';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiError';
  }
}

/** Tutte le rotte del server stanno sotto questo prefisso (in sviluppo le inoltra il proxy di Vite). */
const API_PREFIX = '/api';

interface GetJsonOptions {
  /** Per annullare la chiamata, per esempio quando il componente sparisce dallo schermo. */
  signal?: AbortSignal;
  /** Solo per i test: permette di sostituire `fetch`. */
  fetchImpl?: typeof fetch;
}

/**
 * Chiama il server locale e restituisce la risposta già controllata dallo schema.
 * Ogni chiamata dell'interfaccia passa da qui, così i tre modi di fallire (rete, errore HTTP,
 * risposta fuori schema) sono gestiti e nominati allo stesso modo ovunque.
 */
export async function getJson<T>(
  path: string,
  parser: Parser<T>,
  { signal, fetchImpl = fetch }: GetJsonOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(`${API_PREFIX}${path}`, { signal });
  } catch (cause) {
    throw new ApiError('network_error', 'Il server locale non risponde.', { cause });
  }

  if (!response.ok) {
    throw new ApiError(
      'http_error',
      `Il server locale ha risposto con l'errore ${String(response.status)}.`,
    );
  }

  try {
    return parser.parse(await response.json());
  } catch (cause) {
    throw new ApiError(
      'invalid_response',
      'La risposta del server locale non è nel formato atteso.',
      {
        cause,
      },
    );
  }
}

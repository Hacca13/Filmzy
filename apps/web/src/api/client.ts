import { API_PREFIX, apiErrorSchema, domainErrorSchema } from '@filmzy/contracts';
import type { DomainErrorBody } from '@filmzy/contracts';

/** Qualunque oggetto che sa controllare un dato sconosciuto (gli schemi Zod di `@filmzy/contracts`). */
export interface Parser<T> {
  parse(input: unknown): T;
}

/** Cosa è andato storto in una chiamata al server locale, in una forma che l'interfaccia sa gestire. */
export type ApiErrorCode = 'network_error' | 'http_error' | 'invalid_response';

/** Messaggi per gli sviluppatori (i testi per l'utente stanno nei componenti). */
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  network_error: 'Il server locale non risponde.',
  http_error: 'Il server locale ha risposto con un errore.',
  invalid_response: 'La risposta del server locale non è nel formato atteso.',
};

interface ApiErrorDetails extends ErrorOptions {
  /** Stato HTTP, per `http_error`. */
  status?: number;
  /** Codice del dominio scritto dal server (per esempio `forbidden_host`), se la risposta lo contiene. */
  serverCode?: string;
  /** Ruolo, servizio, campo… che il server nomina nel suo errore (architettura §4.10). */
  details?: DomainErrorBody['details'];
}

export class ApiError extends Error {
  readonly status: number | undefined;
  readonly serverCode: string | undefined;
  readonly details: DomainErrorBody['details'];

  constructor(
    readonly code: ApiErrorCode,
    { status, serverCode, details, ...errorOptions }: ApiErrorDetails = {},
  ) {
    super(ERROR_MESSAGES[code], errorOptions);
    this.name = 'ApiError';
    this.status = status;
    this.serverCode = serverCode;
    this.details = details;
  }
}

/** Tutte le rotte del server stanno sotto questo prefisso (in sviluppo le inoltra il proxy di Vite). */
const API_BASE_PATH = `/${API_PREFIX}`;

export interface GetJsonOptions {
  /** Per annullare la chiamata, per esempio quando il componente sparisce dallo schermo. */
  signal?: AbortSignal;
  /** Solo per i test: permette di sostituire `fetch`. */
  fetchImpl?: typeof fetch;
}

export type SendMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Costruisce l'errore per una risposta non riuscita, leggendo codice e dettagli se ci sono. */
async function toHttpError(response: Response): Promise<ApiError> {
  let serverCode: string | undefined;
  let details: DomainErrorBody['details'];
  try {
    const payload: unknown = await response.json();
    serverCode = apiErrorSchema.parse(payload).code;
    details = domainErrorSchema.safeParse(payload).data?.details;
  } catch {
    // Il corpo non è nel nostro formato (per esempio l'errore di un proxy): resta solo lo stato.
  }
  return new ApiError('http_error', { status: response.status, serverCode, details });
}

/**
 * Chiama il server locale e restituisce la risposta già controllata dallo schema.
 * Ogni chiamata dell'interfaccia passa da qui, così i tre modi di fallire (rete, errore HTTP,
 * risposta fuori schema) sono gestiti e nominati allo stesso modo ovunque.
 */
export function getJson<T>(
  path: string,
  parser: Parser<T>,
  options: GetJsonOptions = {},
): Promise<T> {
  return requestJson(path, parser, 'GET', undefined, options);
}

/**
 * Come `getJson`, per le chiamate che cambiano qualcosa (salvare, pubblicare, cancellare). Il
 * corpo, se c'è, parte come JSON; la risposta è controllata dallo schema allo stesso modo.
 */
export function sendJson<T>(
  method: SendMethod,
  path: string,
  parser: Parser<T>,
  body?: unknown,
  options: GetJsonOptions = {},
): Promise<T> {
  return requestJson(path, parser, method, body, options);
}

async function requestJson<T>(
  path: string,
  parser: Parser<T>,
  method: 'GET' | SendMethod,
  body: unknown,
  { signal, fetchImpl = fetch }: GetJsonOptions,
): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(`${API_BASE_PATH}${path}`, {
      method,
      signal,
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch (cause) {
    throw new ApiError('network_error', { cause });
  }

  if (!response.ok) {
    throw await toHttpError(response);
  }

  // «204 Nessun contenuto» (per esempio dopo aver tolto qualcosa): non c'è un corpo da leggere.
  if (response.status === 204) return parseOrFail(parser, undefined);

  // La lettura del corpo può fallire per la rete (connessione chiusa a metà) o perché il testo non
  // è JSON: sono due problemi diversi e qui si tengono distinti.
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new ApiError(cause instanceof SyntaxError ? 'invalid_response' : 'network_error', {
      cause,
    });
  }

  return parseOrFail(parser, payload);
}

function parseOrFail<T>(parser: Parser<T>, payload: unknown): T {
  try {
    return parser.parse(payload);
  } catch (cause) {
    throw new ApiError('invalid_response', { cause });
  }
}

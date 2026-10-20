import { API_PREFIX, apiErrorSchema } from '@filmzy/contracts';

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
}

export class ApiError extends Error {
  readonly status: number | undefined;
  readonly serverCode: string | undefined;

  constructor(
    readonly code: ApiErrorCode,
    { status, serverCode, ...errorOptions }: ApiErrorDetails = {},
  ) {
    super(ERROR_MESSAGES[code], errorOptions);
    this.name = 'ApiError';
    this.status = status;
    this.serverCode = serverCode;
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

/** Costruisce l'errore per una risposta non riuscita, leggendo il codice del server se c'è. */
async function toHttpError(response: Response): Promise<ApiError> {
  let serverCode: string | undefined;
  try {
    serverCode = apiErrorSchema.parse(await response.json()).code;
  } catch {
    // Il corpo non è nel nostro formato (per esempio l'errore di un proxy): resta solo lo stato.
  }
  return new ApiError('http_error', { status: response.status, serverCode });
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
    response = await fetchImpl(`${API_BASE_PATH}${path}`, { signal });
  } catch (cause) {
    throw new ApiError('network_error', { cause });
  }

  if (!response.ok) {
    throw await toHttpError(response);
  }

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

  try {
    return parser.parse(payload);
  } catch (cause) {
    throw new ApiError('invalid_response', { cause });
  }
}

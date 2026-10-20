import { LOCAL_API_HOST } from '@filmzy/contracts';
import type { ApiErrorBody } from '@filmzy/contracts';
import type { NextFunction, Request, Response } from 'express';

/** Nomi con cui questo computer si chiama da solo (IPv6 tra parentesi quadre, come in un URL). */
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set([LOCAL_API_HOST, 'localhost', '[::1]']);

/** Forma ammessa dell'header Host: un nome o un IPv6 tra parentesi, con porta facoltativa. */
const HOST_HEADER_PATTERN = /^(?<hostname>\[[0-9a-f:]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i;

/** Metodi che non modificano dati: un altro sito può farli partire, ma non ne legge la risposta. */
const READ_ONLY_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);

function isLocalHostname(hostname: string | undefined): boolean {
  return hostname !== undefined && LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}

/**
 * Vero se l'header Host indica questo computer.
 *
 * Perché serve: una pagina web malevola può far puntare il proprio dominio a 127.0.0.1 (attacco
 * "DNS rebinding") e così parlare con il server locale dal browser dell'utente. In quel caso il
 * browser manda comunque il dominio dell'attaccante nell'header Host, quindi basta rifiutarlo.
 */
export function isLocalHostHeader(hostHeader: string | undefined): boolean {
  const hostname = hostHeader ? HOST_HEADER_PATTERN.exec(hostHeader)?.groups?.hostname : undefined;
  return isLocalHostname(hostname);
}

/**
 * Vero se l'header Origin indica una pagina di questo computer.
 * Un browser lo manda sempre quando un sito chiama un altro sito con una richiesta che modifica
 * dati; il valore "null" (pagine isolate, file locali) non è un'origine locale riconoscibile.
 */
export function isLocalOrigin(originHeader: string): boolean {
  try {
    const origin = new URL(originHeader);
    // Un'origine vera non ha credenziali: "http://evil.example@localhost" non è localhost.
    return origin.username === '' && origin.password === '' && isLocalHostname(origin.hostname);
  } catch {
    return false; // non è un URL: non fidarsi
  }
}

function reject(response: Response, code: ApiErrorBody['code']): void {
  const body: ApiErrorBody = { code };
  response.status(403).json(body);
}

/**
 * Middleware Express: lascia passare solo le richieste che arrivano da questo computer.
 *  - L'header Host deve essere locale (difesa dal DNS rebinding).
 *  - Se una richiesta che modifica dati dichiara un'Origin, deve essere locale (difesa dalle
 *    richieste "cross-site": un altro sito non può far salvare o cancellare nulla). Un client
 *    senza Origin, come curl o il programma stesso, non è un browser e passa.
 */
export function rejectNonLocalAccess(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!isLocalHostHeader(request.headers.host)) {
    reject(response, 'forbidden_host');
    return;
  }

  const origin = request.headers.origin;
  if (origin !== undefined && !READ_ONLY_METHODS.has(request.method) && !isLocalOrigin(origin)) {
    reject(response, 'forbidden_origin');
    return;
  }

  next();
}

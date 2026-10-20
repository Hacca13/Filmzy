import type { NextFunction, Request, Response } from 'express';

/** Nomi con cui questo computer si chiama da solo (IPv6 tra parentesi quadre, come nell'header). */
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Forma ammessa dell'header Host: un nome o un IPv6 tra parentesi, con porta facoltativa. */
const HOST_HEADER_PATTERN = /^(?<hostname>\[[0-9a-f:]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i;

/**
 * Vero se l'header Host indica questo computer.
 *
 * Perché serve: una pagina web malevola può far puntare il proprio dominio a 127.0.0.1 (attacco
 * "DNS rebinding") e così parlare con il server locale dal browser dell'utente. In quel caso il
 * browser manda comunque il dominio dell'attaccante nell'header Host, quindi basta rifiutarlo.
 */
export function isLocalHostHeader(hostHeader: string | undefined): boolean {
  const hostname = hostHeader ? HOST_HEADER_PATTERN.exec(hostHeader)?.groups?.hostname : undefined;
  return hostname !== undefined && LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}

/** Middleware Express: lascia passare solo le richieste dirette a questo computer. */
export function rejectNonLocalHost(request: Request, response: Response, next: NextFunction): void {
  if (isLocalHostHeader(request.headers.host)) {
    next();
    return;
  }
  response.status(403).json({ code: 'forbidden_host' });
}

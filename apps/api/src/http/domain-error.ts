import type { DomainErrorBody, DomainErrorCode } from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';

/**
 * Un errore del dominio come risposta HTTP (architettura §4.10): il corpo ha `code`, `retryable` e
 * i dettagli utili all'interfaccia. I messaggi per l'utente stanno nell'interfaccia, non qui.
 */
export function domainError(
  status: number,
  code: DomainErrorCode,
  options: { details?: DomainErrorBody['details']; retryable?: boolean } = {},
): HttpException {
  const body: DomainErrorBody = {
    code,
    retryable: options.retryable ?? false,
    ...(options.details === undefined ? {} : { details: options.details }),
  };
  return new HttpException(body, status);
}

import type { DomainErrorCode } from '@filmzy/contracts';
import { ProviderError } from '@filmzy/troupe';
import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Lo stato HTTP di ogni errore del dominio (architettura §4.10). Non c'è un 401: i browser lo
 * trattano come una richiesta di password, e qui nessuno deve digitarne una; una chiave sbagliata
 * del fornitore è un guaio fra il server e il fornitore (502), non fra l'utente e il server.
 */
const STATUS: Partial<Record<DomainErrorCode, number>> = {
  invalid_request: 400,
  not_found: 404,
  secret_missing: 409,
  no_eligible_model: 409,
  role_disabled: 409,
  spend_cap_reached: 409,
  content_rejected: 422,
  image_rejected: 422,
  config_invalid: 422,
  invalid_output: 502,
  provider_unavailable: 502,
  provider_auth_failed: 502,
  provider_quota_exhausted: 502,
  rate_limited: 429,
  timeout: 504,
};

/** Un errore della troupe diventa un errore del dominio con codice, `retryable` e dettagli. */
@Catch(ProviderError)
export class ProviderErrorFilter implements ExceptionFilter<ProviderError> {
  catch(error: ProviderError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { role, modelId, connectionId, field, retryAfterS, spend } = error.details;
    const details = {
      ...(role === undefined ? {} : { role }),
      ...(modelId === undefined ? {} : { modelId }),
      ...(connectionId === undefined ? {} : { connectionId }),
      ...(field === undefined ? {} : { field }),
      ...(retryAfterS === undefined ? {} : { retryAfterS }),
      ...(spend === undefined ? {} : { spend }),
    };

    // Il messaggio di un ProviderError non entra nella risposta: i testi per l'utente stanno
    // nell'interfaccia, e un messaggio tecnico potrebbe nominare cose che non servono (D25).
    response.status(STATUS[error.code] ?? 500).json({
      code: error.code,
      retryable: error.retryable,
      ...(Object.keys(details).length === 0 ? {} : { details }),
    });
  }
}

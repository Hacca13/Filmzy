import { z } from 'zod';

/**
 * Codici di errore del dominio (architettura §4.10). Niente riserve automatiche: ogni errore dice
 * perché la chiamata è fallita e se ha senso riprovare; i messaggi per l'utente stanno
 * nell'interfaccia, non qui.
 */
export const DOMAIN_ERROR_CODES = [
  'provider_unavailable',
  'timeout',
  'rate_limited',
  'provider_auth_failed',
  'provider_quota_exhausted',
  'secret_missing',
  'invalid_output',
  'content_rejected',
  'image_rejected',
  'spend_cap_reached',
  'no_eligible_model',
  'config_invalid',
  'role_disabled',
  'invalid_request',
  'not_found',
] as const;

export const domainErrorCodeSchema = z.enum(DOMAIN_ERROR_CODES);

export type DomainErrorCode = z.infer<typeof domainErrorCodeSchema>;

/**
 * Dettagli dell'errore che aiutano l'interfaccia a dire cosa è successo e cosa si può fare
 * (ruolo, servizio, connessione, campo, attesa consigliata): architettura §4.10.
 */
export const domainErrorDetailsSchema = z.object({
  role: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
  connectionId: z.string().min(1).optional(),
  field: z.string().min(1).optional(),
  retryAfterS: z.number().positive().optional(),
});

/**
 * Corpo di un errore del dominio: `code`, se ha senso riprovare da soli (`retryable`) e i
 * dettagli utili. Estende `ApiErrorBody` (architettura §4.10, §10): un client che si aspetta solo
 * `{ code }` (per esempio il controllo degli header locali) continua a funzionare, perché Zod
 * scarta i campi che non conosce.
 */
export const domainErrorSchema = z.object({
  code: domainErrorCodeSchema,
  retryable: z.boolean(),
  details: domainErrorDetailsSchema.optional(),
});

export type DomainErrorBody = z.infer<typeof domainErrorSchema>;

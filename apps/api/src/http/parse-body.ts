import { domainError } from './domain-error.js';

/** Quello che serve di uno schema Zod, senza dipendere da Zod: l'app lo riceve dai contratti. */
export interface BodySchema<T> {
  safeParse: (
    input: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false; error: { issues: readonly { path: readonly PropertyKey[] }[] } };
}

/**
 * Controlla il corpo di una richiesta con lo schema dei contratti (regola d'oro 3). Se non va bene
 * risponde `invalid_request` col campo sbagliato e **niente altro**: il valore ricevuto non si
 * rimanda indietro, perché potrebbe essere una chiave (D25).
 */
export function parseBody<T>(schema: BodySchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const field = result.error.issues[0]?.path.map(String).join('.');
  throw domainError(400, 'invalid_request', {
    ...(field === undefined || field === '' ? {} : { details: { field } }),
  });
}

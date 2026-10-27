import { describe, expect, it } from 'vitest';

import { ApiError } from '../api/client';
import { describeError } from './messages';

function httpError(serverCode: string): ApiError {
  return new ApiError('http_error', { status: 422, serverCode });
}

describe('describeError', () => {
  it('ogni codice che la prova può dare ha una frase semplice, senza il codice', () => {
    for (const code of [
      'config_invalid',
      'secret_missing',
      'provider_auth_failed',
      'provider_quota_exhausted',
      'provider_unavailable',
      'timeout',
      'rate_limited',
      'content_rejected',
      'invalid_output',
      'no_eligible_model',
    ]) {
      const message = describeError(httpError(code));

      expect(message, code).not.toContain(code);
      expect(message, code).not.toMatch(/prompt|modello|token|temperatura/i);
      expect(message, code).not.toBe(describeError(httpError('codice_inventato')));
    }
  });

  it('un rifiuto del contenuto non invita ad aggirarlo con un altro servizio (D36)', () => {
    expect(describeError(httpError('content_rejected'))).toContain('non si prova con un altro');
  });

  it('un server che non risponde dice di riaprire il programma', () => {
    expect(describeError(new ApiError('network_error'))).toContain('Chiudi il programma');
  });

  it("un errore che non conosce non mostra mai l'eccezione grezza", () => {
    expect(describeError(new Error('ECONNRESET sk-segreto'))).toBe(
      'Qualcosa è andato storto. Riprova tra un attimo.',
    );
    expect(describeError(httpError('codice_inventato'))).toBe(
      'Qualcosa è andato storto. Riprova tra un attimo.',
    );
  });
});

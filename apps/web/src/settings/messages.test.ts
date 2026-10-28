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
      'spend_cap_reached',
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

  describe('il «no» del moderatore (T3.3)', () => {
    const rejected = (moderation: { reason: string; suggestion?: string }) =>
      new ApiError('http_error', {
        status: 422,
        serverCode: 'content_rejected',
        details: { moderation },
      });

    it('dice il motivo e il suggerimento così come li ha scritti il moderatore', () => {
      const message = describeError(
        rejected({
          reason: 'Il testo nomina una persona famosa.',
          suggestion: 'Inventa un personaggio che le somigli.',
        }),
      );

      expect(message).toBe(
        'Questo testo non si può usare. Il testo nomina una persona famosa. Suggerimento: Inventa un personaggio che le somigli.',
      );
    });

    it('senza suggerimento dice solo il motivo, senza un «Suggerimento:» vuoto', () => {
      const message = describeError(rejected({ reason: 'Contenuto non ammesso.' }));

      expect(message).toBe('Questo testo non si può usare. Contenuto non ammesso.');
    });

    it('un rifiuto senza motivo del moderatore (quello di un servizio) resta la frase di prima', () => {
      expect(describeError(httpError('content_rejected'))).toContain('non si prova con un altro');
    });
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

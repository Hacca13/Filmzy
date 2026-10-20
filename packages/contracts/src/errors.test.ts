import { describe, expect, it } from 'vitest';

import { DOMAIN_ERROR_CODES, domainErrorSchema } from './errors.js';

describe('domainErrorSchema', () => {
  it('accetta un errore tecnico riprovabile con i dettagli', () => {
    const body = {
      code: 'provider_unavailable',
      retryable: true,
      details: { role: 'camera_operator', modelId: 'kling-o3-standard', retryAfterS: 5 },
    };
    expect(domainErrorSchema.parse(body)).toEqual(body);
  });

  it('accetta un errore senza dettagli', () => {
    expect(domainErrorSchema.parse({ code: 'not_found', retryable: false })).toEqual({
      code: 'not_found',
      retryable: false,
    });
  });

  it('accetta tutti i codici della tabella architettura §4.10', () => {
    for (const code of DOMAIN_ERROR_CODES) {
      expect(domainErrorSchema.safeParse({ code, retryable: false }).success).toBe(true);
    }
  });

  it.each([
    { retryable: true },
    { code: 'content_rejected' },
    { code: 'modello_inventato', retryable: false },
    { code: 'content_rejected', retryable: 'no' },
  ])('rifiuta %j', (invalidBody) => {
    expect(domainErrorSchema.safeParse(invalidBody).success).toBe(false);
  });
});

import { ProviderError } from '@filmzy/troupe';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ProviderErrorFilter } from './provider-error.filter.js';

/** Una risposta finta che ricorda stato e corpo: basta a vedere cosa il filtro risponderebbe. */
function respond(error: ProviderError): { status: number; body: unknown } {
  const reply = { status: 0, body: undefined as unknown };
  const response = {
    status: vi.fn((code: number) => {
      reply.status = code;
      return response;
    }),
    json: vi.fn((body: unknown) => {
      reply.body = body;
    }),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  new ProviderErrorFilter().catch(error, host);
  return reply;
}

describe('ProviderErrorFilter', () => {
  it('un rifiuto del contenuto è 422 e non si riprova', () => {
    const reply = respond(
      new ProviderError('content_rejected', false, 'rifiutato', { role: 'screenwriter' }),
    );

    expect(reply).toEqual({
      status: 422,
      body: { code: 'content_rejected', retryable: false, details: { role: 'screenwriter' } },
    });
  });

  it("i guai del fornitore sono 502, e troppe richieste 429 con l'attesa consigliata", () => {
    expect(respond(new ProviderError('provider_unavailable', true, 'giù')).status).toBe(502);
    expect(respond(new ProviderError('provider_auth_failed', false, 'chiave')).status).toBe(502);
    expect(respond(new ProviderError('rate_limited', true, 'troppe', { retryAfterS: 30 }))).toEqual(
      {
        status: 429,
        body: { code: 'rate_limited', retryable: true, details: { retryAfterS: 30 } },
      },
    );
  });

  it("non c'è mai un 401: un browser lo prenderebbe per una richiesta di password", () => {
    for (const code of ['provider_auth_failed', 'secret_missing'] as const) {
      expect(respond(new ProviderError(code, false, 'x')).status).not.toBe(401);
    }
  });

  it("il messaggio tecnico non esce, e senza dettagli non c'è il campo", () => {
    const reply = respond(
      new ProviderError('invalid_output', false, 'la risposta conteneva sk-segreto-123'),
    );

    expect(JSON.stringify(reply.body)).not.toContain('sk-segreto');
    expect(reply.body).toEqual({ code: 'invalid_output', retryable: false });
  });

  it('un codice che non conosce è un 500, non un silenzio', () => {
    expect(respond(new ProviderError('database_too_new', false, 'x')).status).toBe(500);
  });
});

describe('ProviderErrorFilter: limiti di spesa', () => {
  it('un limite superato è 409 e porta quale, di quanto e quanto costerebbe', () => {
    const spend = {
      limit: 'monthly_cap',
      limitUsd: 20,
      spentUsd: 19.5,
      estimatedUsd: 1.2,
    } as const;

    const reply = respond(
      new ProviderError('spend_cap_reached', false, 'tetto', { connectionId: 'fal', spend }),
    );

    expect(reply).toEqual({
      status: 409,
      body: {
        code: 'spend_cap_reached',
        retryable: false,
        details: { connectionId: 'fal', spend },
      },
    });
  });
});

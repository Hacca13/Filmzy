import { publishBodySchema } from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { parseBody } from './parse-body.js';

function caught(action: () => unknown): HttpException {
  try {
    action();
  } catch (error) {
    if (error instanceof HttpException) return error;
  }
  throw new Error("Non ha lanciato l'errore atteso.");
}

describe('parseBody', () => {
  it('restituisce il corpo già pulito dallo schema', () => {
    expect(parseBody(publishBodySchema, { note: ' ok ' })).toEqual({ note: 'ok' });
  });

  it('risponde invalid_request col campo sbagliato', () => {
    const error = caught(() => parseBody(publishBodySchema, { note: '' }));

    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toEqual({
      code: 'invalid_request',
      retryable: false,
      details: { field: 'note' },
    });
  });

  it('non rimanda indietro il valore ricevuto', () => {
    const error = caught(() => parseBody(publishBodySchema, { note: 12345, extra: 'segreto-xyz' }));

    expect(JSON.stringify(error.getResponse())).not.toMatch(/12345|segreto-xyz/);
  });

  it('un corpo che non è un oggetto non ha un campo da nominare', () => {
    const error = caught(() => parseBody(publishBodySchema, 'testo'));

    expect(error.getResponse()).toEqual({ code: 'invalid_request', retryable: false });
  });
});

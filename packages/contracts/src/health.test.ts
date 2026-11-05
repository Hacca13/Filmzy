import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('accetta la risposta di un server in piedi', () => {
    expect(healthResponseSchema.parse({ status: 'ok' })).toEqual({ status: 'ok' });
  });

  it('accetta un server che resta acceso solo per dire perché i dati non si aprono', () => {
    const blocked = {
      status: 'blocked',
      block: { reason: 'migration_failed', backupFile: 'C:\\dati\\copia' },
    };

    expect(healthResponseSchema.parse(blocked)).toEqual(blocked);
    expect(healthResponseSchema.safeParse({ status: 'blocked' }).success).toBe(false);
    expect(
      healthResponseSchema.safeParse({ status: 'blocked', block: { reason: 'boh' } }).success,
    ).toBe(false);
  });

  it.each([{}, { status: 'down' }, { status: 200 }, null])('rifiuta %j', (invalidBody) => {
    expect(healthResponseSchema.safeParse(invalidBody).success).toBe(false);
  });
});

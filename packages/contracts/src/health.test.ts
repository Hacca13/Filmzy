import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('accetta la risposta di un server in piedi', () => {
    expect(healthResponseSchema.parse({ status: 'ok' })).toEqual({ status: 'ok' });
  });

  it.each([{}, { status: 'down' }, { status: 200 }, null])('rifiuta %j', (invalidBody) => {
    expect(healthResponseSchema.safeParse(invalidBody).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { apiErrorSchema } from './api-error.js';

describe('apiErrorSchema', () => {
  it('accetta un corpo con un codice', () => {
    expect(apiErrorSchema.parse({ code: 'forbidden_host' })).toEqual({ code: 'forbidden_host' });
  });

  it.each([{}, { code: '' }, { code: 403 }, { message: 'errore' }, 'forbidden_host'])(
    'rifiuta %j',
    (invalidBody) => {
      expect(apiErrorSchema.safeParse(invalidBody).success).toBe(false);
    },
  );
});

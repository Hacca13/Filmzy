import { describe, expect, it } from 'vitest';

import { SHOT_SPEC_SCHEMA_VERSION } from './index.js';

describe('versioni degli schemi', () => {
  it('la scheda inquadratura è alla versione 0.2', () => {
    expect(SHOT_SPEC_SCHEMA_VERSION).toBe('shot-spec/0.2');
  });
});

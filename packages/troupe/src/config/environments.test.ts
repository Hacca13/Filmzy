import { describe, expect, it } from 'vitest';

import { configEnvironmentFromEnv } from './environments.js';

describe('configEnvironmentFromEnv', () => {
  it('senza TROUPE_ENV non applica nessun adattamento', () => {
    expect(configEnvironmentFromEnv({})).toBeUndefined();
    expect(configEnvironmentFromEnv({ TROUPE_ENV: '' })).toBeUndefined();
  });

  it.each(['development', 'offline', 'test'])('accetta %j', (value) => {
    expect(configEnvironmentFromEnv({ TROUPE_ENV: value })).toBe(value);
  });

  it('dà un errore leggibile su un ambiente che non esiste', () => {
    expect(() => configEnvironmentFromEnv({ TROUPE_ENV: 'produzione' })).toThrow(
      /TROUPE_ENV non valido: "produzione".*development, offline, test/s,
    );
  });
});

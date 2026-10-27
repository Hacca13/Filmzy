import { describe, expect, it } from 'vitest';

import { parseSecretRef, readSecret, secretPresence } from './secrets.js';

const keychain = {
  has: (name: string) => name === 'FAL_KEY',
  get: (name: string) => (name === 'FAL_KEY' ? 'chiave-dal-portachiavi' : undefined),
};

describe('parseSecretRef', () => {
  it('legge le tre forme ammesse', () => {
    expect(parseSecretRef('env:ANTHROPIC_API_KEY')).toEqual({
      kind: 'env',
      name: 'ANTHROPIC_API_KEY',
      optional: false,
    });
    expect(parseSecretRef('env:HTTPS_PROXY?')).toEqual({
      kind: 'env',
      name: 'HTTPS_PROXY',
      optional: true,
    });
    expect(parseSecretRef('secret:FAL_KEY')).toEqual({
      kind: 'secret',
      name: 'FAL_KEY',
      optional: false,
    });
    expect(parseSecretRef('none')).toEqual({ kind: 'none' });
  });

  it.each(['sk-una-chiave-in-chiaro', 'ANTHROPIC_API_KEY', 'env:', 'secret:fal_key'])(
    'non riconosce %j',
    (ref) => {
      expect(parseSecretRef(ref)).toBeUndefined();
    },
  );
});

describe('secretPresence', () => {
  it('una variabile d\'ambiente presente soddisfa il riferimento', () => {
    expect(
      secretPresence('env:ANTHROPIC_API_KEY', { env: { ANTHROPIC_API_KEY: 'sk-123' } })?.satisfied,
    ).toBe(true);
  });

  it('una variabile vuota conta come mancante', () => {
    expect(secretPresence('env:ANTHROPIC_API_KEY', { env: { ANTHROPIC_API_KEY: '  ' } })?.satisfied).toBe(
      false,
    );
  });

  it('una variabile facoltativa è soddisfatta anche se manca', () => {
    expect(secretPresence('env:HTTPS_PROXY?', { env: {} })?.satisfied).toBe(true);
  });

  it('`none` è sempre soddisfatto: è il modello locale senza chiave', () => {
    expect(secretPresence('none')?.satisfied).toBe(true);
  });

  it('una variabile mancante ripiega sulla chiave salvata con lo stesso nome (D50)', () => {
    expect(secretPresence('env:FAL_KEY', { env: {} })?.satisfied).toBe(false);
    expect(secretPresence('env:FAL_KEY', { env: {}, keychain })?.satisfied).toBe(true);
    expect(secretPresence('env:FAL_KEY', { env: { FAL_KEY: '  ' }, keychain })?.satisfied).toBe(
      true,
    );
  });

  it('senza portachiavi un secret: non è soddisfatto', () => {
    expect(secretPresence('secret:FAL_KEY')?.satisfied).toBe(false);
    expect(secretPresence('secret:FAL_KEY', { keychain })?.satisfied).toBe(true);
  });

  it('non riconosce una forma non ammessa', () => {
    expect(secretPresence('sk-una-chiave-in-chiaro')).toBeUndefined();
  });
});

describe('readSecret', () => {
  it('legge il valore solo quando serve davvero a chiamare un fornitore', () => {
    expect(readSecret('env:FAL_KEY', { env: { FAL_KEY: 'chiave' } })).toBe('chiave');
    expect(readSecret('secret:FAL_KEY', { keychain })).toBe('chiave-dal-portachiavi');
    expect(readSecret('none')).toBeUndefined();
  });

  it("la variabile d'ambiente vince sulla chiave salvata, ma una vuota non la nasconde", () => {
    expect(readSecret('env:FAL_KEY', { env: { FAL_KEY: 'da-env' }, keychain })).toBe('da-env');
    expect(readSecret('env:FAL_KEY', { env: { FAL_KEY: '' }, keychain })).toBe(
      'chiave-dal-portachiavi',
    );
    expect(readSecret('env:FAL_KEY', { env: {}, keychain })).toBe('chiave-dal-portachiavi');
  });

  it("un secret: non guarda mai le variabili d'ambiente", () => {
    expect(readSecret('secret:FAL_KEY', { env: { FAL_KEY: 'da-env' } })).toBeUndefined();
  });
});

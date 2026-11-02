import { describe, expect, it } from 'vitest';

import { isWelcomeSkipped, skipWelcome } from './welcome';

describe('salto della procedura di benvenuto', () => {
  it('senza archivio nel browser non si rompe niente: la procedura si ripropone', () => {
    // Qui non c'è `window`: è come un browser che rifiuta l'archivio.
    expect(isWelcomeSkipped()).toBe(false);
    expect(() => {
      skipWelcome();
    }).not.toThrow();
  });
});

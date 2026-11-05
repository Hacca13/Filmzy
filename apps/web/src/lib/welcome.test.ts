import { describe, expect, it } from 'vitest';

import { isWelcomeSkipped, skipWelcome } from './welcome';

describe('salto della procedura di benvenuto', () => {
  it('senza archivio nel browser «Salta» vale lo stesso, finché il programma resta aperto', () => {
    // Qui non c'è `window`: è come un browser che rifiuta l'archivio.
    expect(isWelcomeSkipped()).toBe(false);
    expect(() => {
      skipWelcome();
    }).not.toThrow();
    expect(isWelcomeSkipped()).toBe(true);
  });
});

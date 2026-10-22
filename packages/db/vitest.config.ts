import { defineConfig } from 'vitest/config';

/**
 * Questi test aprono database veri e applicano le migrazioni, dentro `beforeEach`: su Windows in
 * CI i dieci secondi di default per un hook non bastano sempre. Il tempo concesso è esplicito,
 * così un rallentamento della CI non diventa un rosso che non c'entra niente.
 */
export default defineConfig({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});

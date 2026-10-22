import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { defineConfig } from 'vitest/config';

/**
 * I test del server aprono il database vero (è quello che devono provare), quindi la cartella dei
 * dati è una temporanea: nessun test può toccare i film di chi sta sviluppando.
 */
export default defineConfig({
  test: {
    env: {
      FILMZY_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'filmzy-test-')),
    },
    // Questi test aprono database veri e validano tutto il seme, istruzioni comprese: sono lenti
    // per natura. Il tempo concesso è esplicito, così un rallentamento della CI non diventa un
    // rosso che non c'entra niente. Serve anche su `beforeEach`, che apre il database e applica le
    // migrazioni: il suo limite di default è 10 secondi, e su Windows in CI non bastano sempre.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});

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
  },
});

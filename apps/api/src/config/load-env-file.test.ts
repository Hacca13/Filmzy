import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadEnvFileIfPresent } from './load-env-file.js';

const TEST_VARIABLE = 'FILMZY_TEST_ENV_VALUE';

describe('loadEnvFileIfPresent', () => {
  let folder: string;
  let envFileUrl: URL;

  beforeEach(async () => {
    folder = await mkdtemp(join(tmpdir(), 'filmzy-env-'));
    envFileUrl = pathToFileURL(join(folder, '.env'));
  });

  afterEach(async () => {
    // loadEnvFile scrive direttamente in process.env: va ripulito a mano.
    Reflect.deleteProperty(process.env, TEST_VARIABLE);
    await rm(folder, { recursive: true, force: true });
  });

  it('non fa nulla se il file non esiste', () => {
    expect(() => {
      loadEnvFileIfPresent(envFileUrl);
    }).not.toThrow();
  });

  it('carica le variabili del file', async () => {
    await writeFile(envFileUrl, `${TEST_VARIABLE}=dal-file\n`);

    loadEnvFileIfPresent(envFileUrl);

    expect(process.env[TEST_VARIABLE]).toBe('dal-file');
  });

  it("non sovrascrive le variabili già presenti nell'ambiente", async () => {
    process.env[TEST_VARIABLE] = 'dall-ambiente';
    await writeFile(envFileUrl, `${TEST_VARIABLE}=dal-file\n`);

    loadEnvFileIfPresent(envFileUrl);

    expect(process.env[TEST_VARIABLE]).toBe('dall-ambiente');
  });

  it('segnala gli errori che non sono "file assente"', async () => {
    await mkdir(envFileUrl); // una cartella al posto del file: non si può leggere come testo

    expect(() => {
      loadEnvFileIfPresent(envFileUrl);
    }).toThrow();
  });
});

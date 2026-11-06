import { aboutSchema, domainErrorSchema } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { DataFolderOpener } from './about.module.js';

/** «Informazioni» e «I tuoi dati» col server vero. Nessun fornitore, e nessuna finestra aperta davvero. */
let app: NestExpressApplication;
let client: Client;
let dataDir: string;

beforeAll(async () => {
  ({ app, client, dataDir } = await startApp());
}, 60_000);

afterAll(async () => {
  await app.close();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const opener = () => app.get(DataFolderOpener, { strict: false });

describe('le informazioni', () => {
  it('dicono la versione e la cartella dei dati', async () => {
    const reply = await client.call('GET', '/about');

    expect(reply.status).toBe(200);
    expect(aboutSchema.parse(reply.body)).toMatchObject({ dataDir });
  });

  it('la versione è quella del programma installato, se la dice', async () => {
    vi.stubEnv('FILMZY_APP_VERSION', '1.2.3');

    expect(aboutSchema.parse((await client.call('GET', '/about')).body).version).toBe('1.2.3');
  });
});

describe('aprire la cartella dei dati', () => {
  it('apre proprio quella dei dati', async () => {
    const open = vi.spyOn(opener(), 'open').mockResolvedValue(undefined);

    const reply = await client.call('POST', '/about/data-folder');

    expect(reply.status).toBe(204);
    expect(open).toHaveBeenCalledWith(dataDir);
  });

  it('se il sistema non la apre lo dice col suo codice', async () => {
    vi.spyOn(opener(), 'open').mockRejectedValue(new Error('niente'));

    const reply = await client.call('POST', '/about/data-folder');

    expect(reply.status).toBe(500);
    expect(domainErrorSchema.parse(reply.body)).toMatchObject({
      code: 'media_failed',
      details: { field: 'folder' },
    });
  });
});

import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  domainErrorSchema,
  exportViewSchema,
  projectOptionsSchema,
  projectSchema,
  type ExportView,
} from '@filmzy/contracts';
import {
  createAssemblyStore,
  createExportStore,
  type AssemblyStore,
  type ExportStore,
  type OpenedDatabase,
  type ReceiptStore,
} from '@filmzy/db';
import { videoSize } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { CONFIG_DIR, startApp, type Client } from '../../test-support/app-client.js';
import { filmAlreadyMounted } from '../../test-support/real-clip.js';
import { OPENED_DATABASE } from '../database/database.module.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { STALE_WORK_MS } from '../shots/work.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';
import { EXPORT_JOB_KIND, FolderOpener } from './export.service.js';
import { ASSEMBLY_STORE, EXPORT_STORE } from './tokens.js';

/** L'esportazione col server vero, la coda e ffmpeg vero, su video veri fatti da ffmpeg. Nessuna spesa. */
let app: NestExpressApplication;
let client: Client;
let base: string;
let dataDir: string;

beforeAll(async () => {
  ({ app, client, dataDir } = await startApp());
  base = await app.getUrl();
}, 60_000);

afterAll(async () => {
  await app.close();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const exportsOf = (filmId: string) => `/projects/${filmId}/exports`;

const viewOf = async (filmId: string): Promise<ExportView> =>
  exportViewSchema.parse((await client.call('GET', exportsOf(filmId))).body);

const folderOf = (filmId: string) => path.join(dataDir, 'progetti', filmId, 'esportazioni');
const workDirOf = (filmId: string) =>
  path.join(dataDir, 'progetti', filmId, 'esportazioni-in-corso');

/** Aspetta che l'ultima esportazione sia chiusa. */
async function settled(filmId: string): Promise<ExportView> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    const view = await viewOf(filmId);
    const status = view.latest?.status;
    if (status === 'succeeded' || status === 'failed') return view;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('l’esportazione non è finita in tempo');
}

/** Un film appena creato, senza niente di montato. */
async function newFilm(title = 'L’ultima corsa') {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  return projectSchema.parse(
    (
      await client.call('POST', '/projects', {
        idea: 'Una bobina dimenticata sull’ultimo treno.',
        title,
        genre: options.defaults.genre,
        tone: options.defaults.tone,
        style: options.defaults.style,
        cinematography: options.defaults.cinematography,
        durationS: 60,
      })
    ).body,
  );
}

async function mountedFilm(size = '320x180', title?: string) {
  const film = await newFilm(title);
  const mounted = await filmAlreadyMounted(app, dataDir, { filmId: film.id, size });
  return { film, ...mounted };
}

const checksum = async (file: string): Promise<string> =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex');

/** Esporta e aspetta, controllando che sia riuscita. Dà il file. */
async function exported(filmId: string, shortSide: number) {
  const started = await client.call('POST', exportsOf(filmId), { shortSide });
  expect(started.status).toBe(201);
  const view = await settled(filmId);
  expect(view.latest).toMatchObject({ status: 'succeeded', shortSide });
  if (view.file === undefined) throw new Error('doveva esserci il file');
  return view.file;
}

describe('prima di esportare', () => {
  it('senza un film montato non c’è niente da esportare, e lo dice', async () => {
    const film = await newFilm();

    expect((await viewOf(film.id)).source).toBeUndefined();

    const reply = await client.call('POST', exportsOf(film.id), { shortSide: 720 });
    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('exportSource');
  });

  it('un film che non esiste è «non trovato»', async () => {
    expect((await client.call('GET', exportsOf('nessuno'))).status).toBe(404);
    expect((await client.call('POST', exportsOf('nessuno'), { shortSide: 720 })).status).toBe(404);
  });

  it('le qualità sono quella del film e le più basse, con le sue misure', async () => {
    const { film } = await mountedFilm('1280x720');

    expect((await viewOf(film.id)).source).toEqual({
      width: 1280,
      height: 720,
      qualities: [720, 480],
    });
  });

  it('una qualità che non c’è, o una richiesta sbagliata, si rifiutano senza aprire niente', async () => {
    const { film } = await mountedFilm('1280x720');

    for (const body of [{ shortSide: 1080 }, { shortSide: 'alta' }, {}]) {
      const reply = await client.call('POST', exportsOf(film.id), body);
      expect(reply.status).toBe(400);
      expect(domainErrorSchema.parse(reply.body).details?.field).toBe('shortSide');
    }
    const extra = await client.call('POST', exportsOf(film.id), { shortSide: 720, x: 1 });
    expect(extra.status).toBe(400);
    expect((await viewOf(film.id)).latest).toBeUndefined();
  });

  it('se il film montato non c’è più sul disco non si offre', async () => {
    const { film, file } = await mountedFilm();
    expect((await viewOf(film.id)).source).toBeDefined();
    await rm(file);

    expect((await viewOf(film.id)).source).toBeUndefined();
    expect((await client.call('POST', exportsOf(film.id), { shortSide: 180 })).status).toBe(409);
  });
});

describe('esportare', () => {
  it('alla qualità del film copia il file così com’è, e non spende niente', async () => {
    const { film, file } = await mountedFilm('320x180');
    const receipts = app.get<ReceiptStore>(RECEIPT_STORE, { strict: false });
    const spent = () => receipts.list().filter((r) => r.projectId === film.id).length;
    const before = spent();

    const done = await exported(film.id, 180);

    expect(path.basename(done.path)).toBe('L’ultima corsa - 180p.mp4');
    expect(done.current).toBe(true);
    expect(await checksum(done.path)).toBe(await checksum(file));
    expect(spent()).toBe(before);
    // Nella cartella c'è solo il film, e a lavoro finito non resta niente a metà.
    expect(await readdir(folderOf(film.id))).toEqual(['L’ultima corsa - 180p.mp4']);
    await app.get(JobRunner, { strict: false }).drain();
    expect(await readdir(workDirOf(film.id))).toEqual([]);
  }, 60_000);

  it('a una qualità più bassa rifà il film alle misure giuste', async () => {
    const { film } = await mountedFilm('1280x720');

    const done = await exported(film.id, 480);

    expect(path.basename(done.path)).toBe('L’ultima corsa - 480p.mp4');
    expect(await videoSize(done.path)).toEqual({ width: 852, height: 480 });
  }, 60_000);

  it('un titolo scomodo non esce dalla cartella', async () => {
    const { film } = await mountedFilm('320x180', '../fuori');

    const done = await exported(film.id, 180);

    expect(path.dirname(done.path)).toBe(path.resolve(folderOf(film.id)));
    expect(path.basename(done.path)).toBe('fuori - 180p.mp4');
  }, 60_000);

  it('un film che si chiama come un file a metà non viene scambiato per uno di loro', async () => {
    const { film } = await mountedFilm('1280x720', 'lavoro-di-squadra');

    await exported(film.id, 720);
    await exported(film.id, 480);
    await app.get(JobRunner, { strict: false }).drain();

    expect((await readdir(folderOf(film.id))).sort()).toEqual([
      'lavoro-di-squadra - 480p.mp4',
      'lavoro-di-squadra - 720p.mp4',
    ]);
    expect(await readdir(workDirOf(film.id))).toEqual([]);
  }, 60_000);

  it('rifarla alla stessa qualità sostituisce il file; a un’altra ne fa un secondo', async () => {
    const { film } = await mountedFilm('1280x720');

    await exported(film.id, 720);
    await exported(film.id, 720);
    await exported(film.id, 480);

    expect((await readdir(folderOf(film.id))).sort()).toEqual([
      'L’ultima corsa - 480p.mp4',
      'L’ultima corsa - 720p.mp4',
    ]);
    expect((await viewOf(film.id)).file?.shortSide).toBe(480);
  }, 60_000);

  it('dopo un nuovo montaggio il file di prima resta, e dice che è indietro', async () => {
    const { film } = await mountedFilm();
    await exported(film.id, 180);

    await filmAlreadyMounted(app, dataDir, { filmId: film.id, size: '320x180' });

    const view = await viewOf(film.id);
    expect(view.file?.current).toBe(false);
    expect(view.latest?.status).toBe('succeeded');
  }, 60_000);
});

describe('quando qualcosa va storto', () => {
  it('se mentre aspettava il film è sparito, si ferma col motivo e non lascia file', async () => {
    const { film, assetId, file } = await mountedFilm();
    await rm(file);
    const stored = app.get<ExportStore>(EXPORT_STORE, { strict: false });
    const started = stored.start(film.id, { sourceAssetId: assetId, shortSide: 180 });

    app.get(JobRunner, { strict: false }).enqueue({
      kind: EXPORT_JOB_KIND,
      payload: { projectId: film.id, exportId: started.id },
      projectId: film.id,
      idempotencyKey: `prova:${started.id}`,
    });

    expect((await settled(film.id)).latest).toMatchObject({
      status: 'failed',
      errorCode: 'not_found',
    });
    expect(await readdir(folderOf(film.id))).toEqual([]);
  }, 60_000);

  it('se la coda non accetta il lavoro il tentativo non resta aperto', async () => {
    const { film } = await mountedFilm();
    vi.spyOn(app.get(JobRunner, { strict: false }), 'enqueue').mockImplementationOnce(() => {
      throw new Error('coda rotta');
    });

    const reply = await client.call('POST', exportsOf(film.id), { shortSide: 180 });

    expect(reply.status).toBeGreaterThanOrEqual(500);
    expect((await viewOf(film.id)).latest).toMatchObject({
      status: 'failed',
      errorCode: 'unknown',
    });
    await exported(film.id, 180);
  }, 60_000);

  it('un montaggio perso non blocca l’esportazione', async () => {
    const { film } = await mountedFilm();
    const opened = app.get<OpenedDatabase>(OPENED_DATABASE, { strict: false });
    createAssemblyStore(opened.db, {
      now: () => new Date(Date.now() - STALE_WORK_MS - 60_000),
    }).start(film.id, 'perso');

    const done = await exported(film.id, 180);

    expect(path.basename(done.path)).toContain('180p');
  }, 60_000);

  it('un’esportazione alla volta, e non mentre si monta', async () => {
    const { film, assetId } = await mountedFilm();
    const stored = app.get<ExportStore>(EXPORT_STORE, { strict: false });
    const open = stored.start(film.id, { sourceAssetId: assetId, shortSide: 180 });

    const again = await client.call('POST', exportsOf(film.id), { shortSide: 180 });
    expect(again.status).toBe(409);
    expect(domainErrorSchema.parse(again.body).details?.field).toBe('exportWorking');
    stored.finish(open.id, { status: 'failed', errorCode: 'unknown' });

    const assemblies = app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false });
    const mounting = assemblies.start(film.id, 'x');
    const whileMounting = await client.call('POST', exportsOf(film.id), { shortSide: 180 });
    expect(whileMounting.status).toBe(409);
    expect(domainErrorSchema.parse(whileMounting.body).details?.field).toBe('assemblyWorking');
    assemblies.finish(mounting.id, { status: 'failed', errorCode: 'unknown' });
  }, 60_000);

  it('un tentativo fermo da troppo tempo si chiude e non blocca il pulsante', async () => {
    const { film, assetId } = await mountedFilm();
    const opened = app.get<OpenedDatabase>(OPENED_DATABASE, { strict: false });
    const old = createExportStore(opened.db, {
      now: () => new Date(Date.now() - STALE_WORK_MS - 60_000),
    });
    const stuck = old.start(film.id, { sourceAssetId: assetId, shortSide: 180 });

    expect((await viewOf(film.id)).latest).toMatchObject({
      id: stuck.id,
      status: 'failed',
      errorCode: 'timeout',
    });
    await exported(film.id, 180);
  }, 60_000);
});

describe('salvare una copia', () => {
  it('scarica il file col suo nome', async () => {
    const { film } = await mountedFilm();
    const done = await exported(film.id, 180);

    const reply = await fetch(`${base}/api${exportsOf(film.id)}/${done.id}/file`);

    expect(reply.status).toBe(200);
    expect(reply.headers.get('content-disposition')).toContain('attachment');
    expect(reply.headers.get('content-disposition')).toContain('180p.mp4');
    expect(Buffer.from(await reply.arrayBuffer()).equals(await readFile(done.path))).toBe(true);
  }, 60_000);

  it('il file di un altro film, o uno che non c’è, è «non trovato»', async () => {
    const { film } = await mountedFilm();
    const other = await newFilm();
    const done = await exported(film.id, 180);

    expect((await client.call('GET', `${exportsOf(other.id)}/${done.id}/file`)).status).toBe(404);
    expect((await client.call('GET', `${exportsOf(film.id)}/nessuno/file`)).status).toBe(404);
  }, 60_000);

  it('se l’ultimo file è stato tolto si offre quello prima', async () => {
    const { film } = await mountedFilm('1280x720');
    await exported(film.id, 720);
    const last = await exported(film.id, 480);
    await rm(last.path);

    expect((await viewOf(film.id)).file?.shortSide).toBe(720);
  }, 60_000);

  it('un file tolto dalla cartella non si offre più', async () => {
    const { film } = await mountedFilm();
    const done = await exported(film.id, 180);
    await rm(done.path);

    expect((await viewOf(film.id)).file).toBeUndefined();
    expect((await client.call('GET', `${exportsOf(film.id)}/${done.id}/file`)).status).toBe(404);
  }, 60_000);

  it('funziona anche se la cartella dei dati ha un punto nel nome, come su Linux', async () => {
    const dotted = await mkdtemp(path.join(tmpdir(), '.filmzy-dati-'));
    const running = await startApp(undefined, 'offline', CONFIG_DIR, dotted);
    try {
      const options = projectOptionsSchema.parse(
        (await running.client.call('GET', '/projects/options')).body,
      );
      const film = projectSchema.parse(
        (
          await running.client.call('POST', '/projects', {
            idea: 'Una storia.',
            genre: options.defaults.genre,
            tone: options.defaults.tone,
            style: options.defaults.style,
            cinematography: options.defaults.cinematography,
            durationS: 60,
          })
        ).body,
      );
      const { assetId } = await filmAlreadyMounted(running.app, dotted, {
        filmId: film.id,
        size: '320x180',
      });
      const url = await running.app.getUrl();

      expect((await fetch(`${url}/api/assets/${assetId}`)).status).toBe(200);

      await running.client.call('POST', exportsOf(film.id), { shortSide: 180 });
      for (let attempt = 0; attempt < 300; attempt += 1) {
        const view = exportViewSchema.parse(
          (await running.client.call('GET', exportsOf(film.id))).body,
        );
        if (view.file !== undefined) {
          const reply = await fetch(`${url}/api${exportsOf(film.id)}/${view.file.id}/file`);
          expect(reply.status).toBe(200);
          await reply.body?.cancel();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('l’esportazione non è finita in tempo');
    } finally {
      await running.app.close();
    }
  }, 60_000);
});

describe('aprire la cartella', () => {
  it('apre la cartella del film, anche se non c’era ancora', async () => {
    const film = await newFilm();
    const open = vi
      .spyOn(app.get(FolderOpener, { strict: false }), 'open')
      .mockResolvedValue(undefined);

    const reply = await client.call('POST', `${exportsOf(film.id)}/folder`);

    expect(reply.status).toBe(204);
    expect(open).toHaveBeenCalledWith(path.resolve(folderOf(film.id)));
    expect(await readdir(folderOf(film.id))).toEqual([]);
  });

  it('se il sistema non la apre lo dice con il suo codice', async () => {
    const film = await newFilm();
    vi.spyOn(app.get(FolderOpener, { strict: false }), 'open').mockRejectedValue(
      Object.assign(new Error('niente'), { code: 'ENOENT' }),
    );

    const reply = await client.call('POST', `${exportsOf(film.id)}/folder`);

    expect(reply.status).toBe(500);
    expect(domainErrorSchema.parse(reply.body)).toMatchObject({
      code: 'media_failed',
      details: { field: 'folder' },
    });
  });

  it('un film che non esiste è «non trovato», e non apre niente', async () => {
    const open = vi.spyOn(app.get(FolderOpener, { strict: false }), 'open');

    expect((await client.call('POST', `${exportsOf('nessuno')}/folder`)).status).toBe(404);
    expect(open).not.toHaveBeenCalled();
  });
});

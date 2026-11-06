import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  FILM_COPY_MANIFEST,
  audioOverviewSchema,
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  shotPlansSchema,
  shotTakesSchema,
  type FilmCopyManifest,
} from '@filmzy/contracts';
import type { JobQueue, SheetStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import yauzl from 'yauzl';
import yazl from 'yazl';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import {
  filmAlreadyMounted,
  realSound,
  realVideo,
  takeWithFile,
} from '../../test-support/real-clip.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { JOB_QUEUE } from '../database/database.module.js';

/**
 * La copia di un film col server vero: si salva da un programma e si apre in un altro, con un'altra cartella
 * dei dati, come su un altro computer. Nessun fornitore: la copia non costa niente.
 */
type Running = { app: NestExpressApplication; client: Client; dataDir: string; base: string };
let from: Running;
let to: Running;

beforeAll(async () => {
  const [first, second] = await Promise.all([startApp(), startApp()]);
  from = { ...first, base: await first.app.getUrl() };
  to = { ...second, base: await second.app.getUrl() };
}, 60_000);

afterAll(async () => {
  await Promise.all([from.app.close(), to.app.close()]);
});

const checksum = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function newFilm(client: Client) {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  return projectSchema.parse(
    (
      await client.call('POST', '/projects', {
        idea: 'Una lettera che arriva con quarant’anni di ritardo.',
        genre: options.defaults.genre,
        tone: options.defaults.tone,
        style: options.defaults.style,
        cinematography: options.defaults.cinematography,
        durationS: 60,
      })
    ).body,
  );
}

/** Un film con la stesura, un'inquadratura col suo video, una musica e un film montato. */
async function richFilm() {
  const { film, shot } = await filmWithShot(from.client);
  // Il video sta nella cartella del film, come quelli che arrivano dai lavori.
  const takes = path.join(from.dataDir, 'progetti', film.id, 'take');
  await mkdir(takes, { recursive: true });
  const video = path.join(takes, 'clip.mp4');
  await copyFile(await realVideo(from.dataDir), video);
  const takeId = await takeWithFile(from.app, from.dataDir, {
    filmId: film.id,
    shotId: shot.id,
    file: video,
  });
  const music = await fetch(
    `${from.base}/api/projects/${film.id}/audio/uploads?${new URLSearchParams({
      kind: 'music',
      sceneId: 'scene-1',
      description: 'La mia musica',
    }).toString()}`,
    {
      method: 'POST',
      headers: { 'content-type': 'audio/wav' },
      body: await realSound(from.dataDir, 2),
    },
  );
  expect(music.status).toBe(201);
  await filmAlreadyMounted(from.app, from.dataDir, { filmId: film.id });
  return { film, shot, takeId };
}

async function copyOf(filmId: string): Promise<{ bytes: Buffer; name: string | null }> {
  const reply = await fetch(`${from.base}/api/projects/${filmId}/copy`);
  expect(reply.status).toBe(200);
  return {
    bytes: Buffer.from(await reply.arrayBuffer()),
    name: reply.headers.get('content-disposition'),
  };
}

async function importInto(
  target: Running,
  bytes: Buffer,
): Promise<{ status: number; body: unknown }> {
  const reply = await fetch(`${target.base}/api/projects/import`, { method: 'POST', body: bytes });
  return { status: reply.status, body: await reply.json() };
}

const fieldOf = (body: unknown) => domainErrorSchema.parse(body).details?.field;

/** I nomi dentro lo zip, e l'indice. */
async function contentsOf(bytes: Buffer): Promise<{ names: string[]; manifest: FilmCopyManifest }> {
  const zip = await new Promise<yauzl.ZipFile>((resolve, reject) => {
    yauzl.fromBuffer(bytes, { lazyEntries: true }, (error, opened) => {
      if (error !== null) reject(error);
      else resolve(opened);
    });
  });
  const names: string[] = [];
  let manifest: FilmCopyManifest | undefined;
  await new Promise<void>((resolve, reject) => {
    zip.on('entry', (entry: yauzl.Entry) => {
      names.push(entry.fileName);
      if (entry.fileName !== FILM_COPY_MANIFEST) {
        zip.readEntry();
        return;
      }
      zip.openReadStream(entry, (error, stream) => {
        if (error !== null) {
          reject(error);
          return;
        }
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          manifest = JSON.parse(Buffer.concat(chunks).toString('utf8')) as FilmCopyManifest;
          zip.readEntry();
        });
      });
    });
    zip.on('end', resolve);
    zip.on('error', reject);
    zip.readEntry();
  });
  if (manifest === undefined) throw new Error('niente indice');
  return { names, manifest };
}

/** Una copia fatta a mano: per provare quelle rovinate o fatte apposta. */
function handMade(entries: Record<string, string>): Promise<Buffer> {
  const zip = new yazl.ZipFile();
  for (const [name, content] of Object.entries(entries)) zip.addBuffer(Buffer.from(content), name);
  zip.end();
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    zip.outputStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    zip.outputStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    zip.outputStream.on('error', reject);
  });
}

describe('salvare una copia', () => {
  it('ha il nome del film, l’indice e i file; non il film montato, non le chiavi', async () => {
    const { film } = await richFilm();

    const { bytes, name } = await copyOf(film.id);
    const { names, manifest } = await contentsOf(bytes);

    expect(name).toContain('.filmzy');
    expect(names[0]).toBe(FILM_COPY_MANIFEST);
    expect(manifest).toMatchObject({ format: 'filmzy-film', projectId: film.id });
    expect(manifest.tables.projects).toHaveLength(1);
    expect(manifest.tables.takes?.length).toBeGreaterThan(0);
    expect(names.some((entry) => entry.startsWith(`files/progetti/${film.id}/`))).toBe(true);
    // Il film montato si rifà gratis: nella copia non c'è, nemmeno la sua riga nel registro dei file.
    expect(names.some((entry) => entry.includes('/montaggio/'))).toBe(false);
    expect(
      manifest.tables.assets?.every(
        (row) => typeof row.path === 'string' && names.includes(`files/${row.path}`),
      ),
    ).toBe(true);
    expect(Object.keys(manifest.tables)).not.toContain('film_assemblies');
    expect(Object.keys(manifest.tables)).not.toContain('settings');
  }, 120_000);

  it('un film che non c’è è «non trovato»', async () => {
    expect((await fetch(`${from.base}/api/projects/nessuno/copy`)).status).toBe(404);
    expect((await fetch(`${from.base}/api/projects/nessuno/copy/check`)).status).toBe(404);
  });

  it('con un lavoro aperto non si salva: si dice prima di scaricare', async () => {
    const film = await newFilm(from.client);
    const check = `${from.base}/api/projects/${film.id}/copy/check`;
    expect((await fetch(check)).status).toBe(204);

    // Un lavoro in coda che non parte durante la prova.
    from.app.get<JobQueue>(JOB_QUEUE, { strict: false }).enqueue({
      kind: 'prova',
      payload: null,
      projectId: film.id,
      runAfter: new Date(Date.now() + 3_600_000),
    });

    const refused = await fetch(check);
    expect(refused.status).toBe(400);
    expect(fieldOf(await refused.json())).toBe('filmWorking');
    expect((await fetch(`${from.base}/api/projects/${film.id}/copy`)).status).toBe(400);
  });
});

describe('aprire una copia su un altro computer', () => {
  it('il film torna com’era: storia, inquadrature, video e suoni', async () => {
    const { film, shot, takeId } = await richFilm();
    const { bytes } = await copyOf(film.id);

    const opened = await importInto(to, bytes);

    expect(opened.status).toBe(201);
    expect(projectSchema.parse(opened.body)).toMatchObject({ id: film.id, title: film.title });
    const plans = shotPlansSchema.parse(
      (await to.client.call('GET', `/projects/${film.id}/shots`)).body,
    );
    expect(plans.scenes[0]?.shots.length).toBeGreaterThan(0);
    const { takes } = shotTakesSchema.parse(
      (await to.client.call('GET', `/projects/${film.id}/shots/${shot.id}/takes`)).body,
    );
    const take = takes.find(({ id }) => id === takeId);
    expect(take?.assetId).toBeDefined();
    expect((await fetch(`${to.base}/api/assets/${take?.assetId ?? ''}`)).status).toBe(200);
    const audio = audioOverviewSchema.parse(
      (await to.client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    expect(audio.clips.map(({ description }) => description)).toContain('La mia musica');

    // I file sono gli stessi, tranne il film montato.
    const original = path.join(from.dataDir, 'progetti', film.id);
    const copied = path.join(to.dataDir, 'progetti', film.id);
    const files = (await readdir(original, { recursive: true })).filter(
      (name) => !name.startsWith('montaggio') && name.includes('.'),
    );
    expect(files.length).toBeGreaterThan(1);
    for (const file of files) {
      expect(checksum(await readFile(path.join(copied, file)))).toBe(
        checksum(await readFile(path.join(original, file))),
      );
    }
  }, 120_000);

  it('un film che c’è già non si tocca', async () => {
    const film = await newFilm(from.client);
    const { bytes } = await copyOf(film.id);
    expect((await importInto(to, bytes)).status).toBe(201);
    await to.client.call('PATCH', `/projects/${film.id}`, { title: 'Cambiato qui' });

    const again = await importInto(to, bytes);

    expect(again.status).toBe(400);
    expect(fieldOf(again.body)).toBe('filmExists');
    const kept = projectSchema.parse((await to.client.call('GET', `/projects/${film.id}`)).body);
    expect(kept.title).toBe('Cambiato qui');
  });

  it('un’immagine che due film hanno in comune viaggia con quello che si copia', async () => {
    // Il nome di un file è il suo contenuto: la riga è del primo film, ma ognuno ha il file nella sua cartella.
    const [first, second] = await Promise.all([newFilm(from.client), newFilm(from.client)]);
    const image = Buffer.from('la stessa immagine');
    const id = checksum(image);
    const files = from.app.get<SheetStore>(SHEET_STORE, { strict: false });
    for (const film of [first, second]) {
      const folder = path.join(from.dataDir, 'progetti', film.id, 'immagini');
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, `${id}.png`), image);
      files.registerAsset({
        id,
        projectId: film.id,
        path: `progetti/${film.id}/immagini/${id}.png`,
        contentType: 'image/png',
        bytes: image.byteLength,
      });
    }
    const { bytes } = await copyOf(second.id);

    const { manifest } = await contentsOf(bytes);
    expect(manifest.tables.assets).toEqual([
      expect.objectContaining({
        id,
        project_id: second.id,
        path: `progetti/${second.id}/immagini/${id}.png`,
      }),
    ]);
    expect((await importInto(to, bytes)).status).toBe(201);
    const served = await fetch(`${to.base}/api/assets/${id}`);
    expect(served.status).toBe(200);
    expect(Buffer.from(await served.arrayBuffer())).toEqual(image);
  });
});

describe('copie che non si aprono', () => {
  const manifestFor = (projectId: string, extra: Partial<FilmCopyManifest> = {}) =>
    JSON.stringify({
      format: 'filmzy-film',
      formatVersion: 1,
      schemaVersion: 1,
      appVersion: 'prova',
      exportedAt: '2026-11-06T10:00:00.000Z',
      projectId,
      tables: { projects: [{ id: projectId }] },
      ...extra,
    });

  const refused = async (bytes: Buffer) => {
    const reply = await importInto(to, bytes);
    expect(reply.status).toBe(400);
    return fieldOf(reply.body);
  };

  it('un file che non è una copia di Filmzy', async () => {
    expect(await refused(Buffer.from('non sono uno zip'))).toBe('copyFile');
    expect(await refused(await handMade({ 'altro.txt': 'ciao' }))).toBe('copyFile');
  });

  it('un nome che esce dalla cartella non scrive niente fuori', async () => {
    // yazl non scrive un nome con «..»: si scrive uno innocuo lungo uguale, e lo si cambia nei byte.
    const innocent = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-fuori'),
      'files/progetti/film-fuori/AA/AA/fuori.txt': 'sono uscito',
    });
    const bytes = Buffer.from(
      innocent.toString('latin1').replaceAll('film-fuori/AA/AA/', 'film-fuori/../../'),
      'latin1',
    );

    expect(await refused(bytes)).toBe('copyFile');
    expect(await readdir(to.dataDir)).not.toContain('fuori.txt');
  });

  it('i file di un altro film non entrano', async () => {
    const bytes = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-mio'),
      'files/progetti/film-di-un-altro/immagine.png': 'non sono tuo',
    });

    expect(await refused(bytes)).toBe('copyFile');
    expect(await readdir(path.join(to.dataDir, 'progetti')).catch(() => [])).not.toContain(
      'film-di-un-altro',
    );
  });

  it('righe di un altro film, o un file fuori dalla cartella del film, non entrano', async () => {
    const withTables = (tables: FilmCopyManifest['tables']) =>
      handMade({ [FILM_COPY_MANIFEST]: manifestFor('film-mio', { tables }) });

    expect(
      await refused(
        await withTables({
          projects: [{ id: 'film-mio' }],
          characters: [{ id: 'c', project_id: 'film-di-un-altro' }],
        }),
      ),
    ).toBe('copyFile');
    // Una riga che fa servire il database come se fosse un'immagine del film.
    expect(
      await refused(
        await withTables({
          projects: [{ id: 'film-mio' }],
          assets: [{ id: 'a', project_id: 'film-mio', path: 'filmzy.db' }],
        }),
      ),
    ).toBe('copyFile');
  });

  it('una copia fatta con una versione più nuova lo dice', async () => {
    const bytes = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-nuovo', { schemaVersion: 99_999 }),
    });

    expect(await refused(bytes)).toBe('filmTooNew');
  });
});

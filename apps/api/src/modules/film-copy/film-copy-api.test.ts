import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  FILM_COPY_MANIFEST,
  audioOverviewSchema,
  domainErrorSchema,
  projectSchema,
  shotPlansSchema,
  type FilmCopyManifest,
} from '@filmzy/contracts';
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

/**
 * La copia di un film col server vero: si salva da un programma e si apre in un altro, con un'altra cartella
 * dei dati, come su un altro computer. Nessun fornitore: la copia non costa niente.
 */
let from: { app: NestExpressApplication; client: Client; dataDir: string; base: string };
let to: { app: NestExpressApplication; client: Client; dataDir: string; base: string };

beforeAll(async () => {
  const [first, second] = await Promise.all([startApp(), startApp()]);
  from = { ...first, base: await first.app.getUrl() };
  to = { ...second, base: await second.app.getUrl() };
}, 60_000);

afterAll(async () => {
  await Promise.all([from.app.close(), to.app.close()]);
});

/** Un film con la stesura, un'inquadratura col suo video, una musica e un film montato. */
async function richFilm() {
  const { film, shot } = await filmWithShot(from.client);
  const video = await realVideo(from.dataDir);
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
  target: typeof to,
  bytes: Buffer,
  replace = false,
): Promise<{ status: number; body: unknown }> {
  const reply = await fetch(`${target.base}/api/projects/import${replace ? '?replace=1' : ''}`, {
    method: 'POST',
    body: bytes,
  });
  return { status: reply.status, body: await reply.json() };
}

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

const checksum = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

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
    // Il film montato si rifà gratis: nella copia non c'è.
    expect(names.some((entry) => entry.includes('/montaggio/'))).toBe(false);
    expect(Object.keys(manifest.tables)).not.toContain('film_assemblies');
    expect(Object.keys(manifest.tables)).not.toContain('settings');
  }, 120_000);

  it('un film che non c’è è «non trovato»', async () => {
    expect((await fetch(`${from.base}/api/projects/nessuno/copy`)).status).toBe(404);
  });
});

describe('aprire una copia su un altro computer', () => {
  it('il film torna com’era: storia, inquadrature, video e suoni', async () => {
    const { film, takeId } = await richFilm();
    const { bytes } = await copyOf(film.id);

    const opened = await importInto(to, bytes);

    expect(opened.status).toBe(201);
    expect(projectSchema.parse(opened.body)).toMatchObject({ id: film.id, title: film.title });
    const plans = shotPlansSchema.parse(
      (await to.client.call('GET', `/projects/${film.id}/shots`)).body,
    );
    expect(plans.scenes[0]?.shots.length).toBeGreaterThan(0);
    const audio = audioOverviewSchema.parse(
      (await to.client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    expect(audio.clips.map(({ description }) => description)).toContain('La mia musica');

    // Il video del take si apre, ed è lo stesso file.
    const takes = await to.client.call('GET', `/projects/${film.id}/shots`);
    expect(takes.status).toBe(200);
    const original = path.join(from.dataDir, 'progetti', film.id);
    const copied = path.join(to.dataDir, 'progetti', film.id);
    const files = (await readdir(original, { recursive: true })).filter(
      (name) => !name.startsWith('montaggio') && name.includes('.'),
    );
    for (const file of files) {
      expect(checksum(await readFile(path.join(copied, file)))).toBe(
        checksum(await readFile(path.join(original, file))),
      );
    }
    expect(takeId).toBeDefined();
  }, 120_000);

  it('un film che c’è già non si sovrascrive, a meno di chiederlo', async () => {
    const { film } = await richFilm();
    const { bytes } = await copyOf(film.id);
    await importInto(to, bytes);

    const again = await importInto(to, bytes);
    expect(again.status).toBe(400);
    expect(domainErrorSchema.parse(again.body).details?.field).toBe('filmExists');

    await to.client.call('PATCH', `/projects/${film.id}`, { title: 'Cambiato qui' });
    const replaced = await importInto(to, bytes, true);
    expect(replaced.status).toBe(201);
    expect(projectSchema.parse(replaced.body).title).toBe(film.title);
  }, 120_000);
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
    return domainErrorSchema.parse(reply.body).details?.field;
  };

  it('un file che non è una copia di Filmzy', async () => {
    expect(await refused(Buffer.from('non sono uno zip'))).toBe('copyFile');
    expect(await refused(await handMade({ 'altro.txt': 'ciao' }))).toBe('copyFile');
  });

  it('un nome che esce dalla cartella non scrive niente fuori', async () => {
    // yazl non scrive un nome con «..»: si scrive uno innocuo lungo uguale, e lo si cambia nei byte.
    const innocent = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-fuori'),
      'files/progetti/AA/AA/fuori.txt': 'sono uscito',
    });
    const bytes = Buffer.from(
      innocent.toString('latin1').replaceAll('progetti/AA/AA/', 'progetti/../../'),
      'latin1',
    );

    expect(await refused(bytes)).toBe('copyFile');
    expect(await readdir(to.dataDir)).not.toContain('fuori.txt');
  });

  it('righe di un altro film non entrano', async () => {
    const bytes = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-mio', {
        tables: {
          projects: [{ id: 'film-mio' }],
          characters: [{ id: 'c', project_id: 'film-di-un-altro' }],
        },
      }),
    });

    expect(await refused(bytes)).toBe('copyFile');
  });

  it('una copia fatta con una versione più nuova lo dice', async () => {
    const bytes = await handMade({
      [FILM_COPY_MANIFEST]: manifestFor('film-nuovo', { schemaVersion: 99_999 }),
    });

    expect(await refused(bytes)).toBe('filmTooNew');
  });
});

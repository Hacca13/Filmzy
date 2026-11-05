import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { AssemblyStore, SheetStore, TakeStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { SHEET_STORE } from '../modules/cast/tokens.js';
import { ASSEMBLY_STORE } from '../modules/export/tokens.js';
import { TAKE_STORE } from '../modules/shots/tokens.js';

const run = promisify(execFile);

/**
 * Il fornitore finto non fa video veri, ma chi lavora con ffmpeg ha bisogno di file veri: li fa lo stesso
 * ffmpeg, dentro la cartella dei dati, e un take riuscito li porta. Nessuna spesa.
 */

/** Un video vero, piccolo, con o senza suono. */
export async function realVideo(
  dataDir: string,
  {
    withSound = false,
    seconds = 1,
    size = '64x36',
  }: { withSound?: boolean; seconds?: number; size?: string } = {},
): Promise<string> {
  const dir = await mkdtemp(path.join(dataDir, 'prova-'));
  const file = path.join(dir, 'clip.mp4');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `testsrc=duration=${String(seconds)}:size=${size}:rate=10`,
      ...(withSound ? ['-f', 'lavfi', '-i', `sine=duration=${String(seconds)}`] : []),
      '-pix_fmt',
      'yuv420p',
      '-shortest',
      file,
    ],
    { windowsHide: true },
  );
  return file;
}

/** Ogni suono è diverso dagli altri: il nome di un file è il suo checksum, e due film non devono dividerlo. */
let nextFrequency = 300;

/** Un suono vero, che si sente: un WAV da caricare. */
export async function realSound(dataDir: string, seconds = 1): Promise<Buffer> {
  nextFrequency += 10;
  const dir = await mkdtemp(path.join(dataDir, 'prova-'));
  const file = path.join(dir, 'suono.wav');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${String(nextFrequency)}:duration=${String(seconds)}`,
      file,
    ],
    { windowsHide: true },
  );
  return readFile(file);
}

/** Un file vero nel registro dei file, come quelli che arrivano dai lavori. Dà il suo id. */
async function registerVideo(
  app: NestExpressApplication,
  dataDir: string,
  target: { filmId: string; file: string },
): Promise<string> {
  const { filmId, file } = target;
  const bytes = await readFile(file);
  const assetId = createHash('sha256').update(file).digest('hex');
  app.get<SheetStore>(SHEET_STORE, { strict: false }).registerAsset({
    id: assetId,
    projectId: filmId,
    path: path.relative(dataDir, file).replaceAll(path.sep, '/'),
    contentType: 'video/mp4',
    bytes: bytes.byteLength,
  });
  return assetId;
}

/** Un montaggio riuscito con questo video, senza rifare il film. Dà l'id del file e il suo percorso. */
export async function filmAlreadyMounted(
  app: NestExpressApplication,
  dataDir: string,
  { filmId, size }: { filmId: string; size?: string },
): Promise<{ assetId: string; file: string }> {
  const file = await realVideo(dataDir, {
    withSound: true,
    ...(size === undefined ? {} : { size }),
  });
  const assetId = await registerVideo(app, dataDir, { filmId, file });
  const assemblies = app.get<AssemblyStore>(ASSEMBLY_STORE, { strict: false });
  const { id } = assemblies.start(filmId, 'prova');
  assemblies.finish(id, { status: 'succeeded', assetId, durationS: 1 });
  return { assetId, file };
}

/** Un take riuscito con questo file, registrato come tutti gli altri. Dà l'id del take. */
export async function takeWithFile(
  app: NestExpressApplication,
  dataDir: string,
  target: { filmId: string; shotId: string; file: string },
): Promise<string> {
  const { filmId, shotId, file } = target;
  const takes = app.get<TakeStore>(TAKE_STORE, { strict: false });
  const assetId = await registerVideo(app, dataDir, { filmId, file });
  const take = takes.start(shotId, { modelId: 'video', modelLabel: 'Video' });
  takes.finish(take.id, { status: 'succeeded', assetId });
  return take.id;
}

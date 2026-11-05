import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { SheetStore, TakeStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { SHEET_STORE } from '../modules/cast/tokens.js';
import { TAKE_STORE } from '../modules/shots/tokens.js';

const run = promisify(execFile);

/**
 * Il fornitore finto non fa video veri, ma chi lavora con ffmpeg ha bisogno di file veri: li fa lo stesso
 * ffmpeg, dentro la cartella dei dati, e un take riuscito li porta. Nessuna spesa.
 */

/** Un video vero, piccolo, con o senza suono. */
export async function realVideo(
  dataDir: string,
  { withSound = false, seconds = 1 }: { withSound?: boolean; seconds?: number } = {},
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
      `testsrc=duration=${String(seconds)}:size=64x36:rate=10`,
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

/** Un suono vero, che si sente: un WAV da caricare. */
export async function realSound(dataDir: string, seconds = 1): Promise<Buffer> {
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
      `sine=frequency=880:duration=${String(seconds)}`,
      file,
    ],
    { windowsHide: true },
  );
  return readFile(file);
}

/** Un take riuscito con questo file, registrato come tutti gli altri. Dà l'id del take. */
export async function takeWithFile(
  app: NestExpressApplication,
  dataDir: string,
  target: { filmId: string; shotId: string; file: string },
): Promise<string> {
  const { filmId, shotId, file } = target;
  const bytes = await readFile(file);
  const takes = app.get<TakeStore>(TAKE_STORE, { strict: false });
  const files = app.get<SheetStore>(SHEET_STORE, { strict: false });
  const assetId = createHash('sha256').update(file).digest('hex');
  files.registerAsset({
    id: assetId,
    projectId: filmId,
    path: path.relative(dataDir, file).replaceAll(path.sep, '/'),
    contentType: 'video/mp4',
    bytes: bytes.byteLength,
  });
  const take = takes.start(shotId, { modelId: 'video', modelLabel: 'Video' });
  takes.finish(take.id, { status: 'succeeded', assetId });
  return take.id;
}

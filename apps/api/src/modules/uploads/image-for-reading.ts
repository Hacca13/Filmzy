import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { projectsDir } from '@filmzy/db';
import { shrinkImage } from '@filmzy/media';

import { mediaStep } from '../media/media-step.js';

/** Fino a questo peso la foto parte com'è per la lettura (byte); sopra, si manda ridotta. */
const READ_AS_IS_MAX_BYTES = 3 * 1024 * 1024;

/** Il lato più lungo della copia ridotta (px): i servizi comunque non guardano oltre. */
const READ_MAX_SIDE_PX = 1568;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export interface ImageForReading {
  mediaType: string;
  data: Uint8Array;
}

/**
 * La foto come la riceve il servizio che la legge (T4.8, T4.10). I servizi hanno un limite di peso per
 * immagine (circa 5 MB): una foto grande — come ne fa un telefono — si manda ridotta, ma l'originale
 * è quello che si salva. Una foto già leggera parte com'è. Le copie provvisorie stanno nella cartella
 * `caricate` del film e non restano mai, né se è andata bene né se ffmpeg ha fallito.
 */
export async function imageForReading(args: {
  dataDir: string;
  projectId: string;
  contentType: string;
  bytes: Buffer;
}): Promise<ImageForReading> {
  const { dataDir, projectId, contentType, bytes } = args;
  if (bytes.length <= READ_AS_IS_MAX_BYTES) return { mediaType: contentType, data: bytes };

  const dir = path.join(projectsDir(dataDir), projectId, 'caricate');
  await mkdir(dir, { recursive: true });
  const stem = path.join(dir, `lettura-${randomUUID()}`);
  const input = `${stem}.${EXTENSIONS[contentType] ?? 'img'}`;
  const output = `${stem}.jpg`;
  try {
    await writeFile(input, bytes);
    await mediaStep(() => shrinkImage({ input, output, maxSidePx: READ_MAX_SIDE_PX }));
    return { mediaType: 'image/jpeg', data: await readFile(output) };
  } finally {
    await Promise.all([rm(input, { force: true }), rm(output, { force: true })]);
  }
}

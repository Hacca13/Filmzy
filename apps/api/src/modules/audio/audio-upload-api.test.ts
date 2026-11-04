import { readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  audioClipSchema,
  audioOverviewSchema,
  domainErrorSchema,
  type AudioClip,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * I file audio dell'utente (D27): finiscono nel mix e **non vanno mai a un fornitore AI**. Col server
 * vero e un WAV vero, perché la durata la legge ffmpeg.
 */
let app: NestExpressApplication;
let client: Client;
let base: string;
let dataDir: string;
let receipts: ReceiptStore;

beforeAll(async () => {
  ({ app, client, dataDir } = await startApp());
  base = await app.getUrl();
  receipts = app.get<ReceiptStore>(RECEIPT_STORE);
}, 60_000);

afterAll(async () => {
  await app.close();
});

/** Un secondo di silenzio: PCM a 16 bit, mono, a 8000 Hz. */
function wavFile(seconds = 1): Buffer {
  const rate = 8000;
  const data = Buffer.alloc(seconds * rate * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function upload(
  filmId: string,
  query: Record<string, string>,
  body: Buffer,
  contentType = 'audio/wav',
) {
  const response = await fetch(
    `${base}/api/projects/${filmId}/audio/uploads?${new URLSearchParams(query).toString()}`,
    { method: 'POST', headers: { 'content-type': contentType }, body },
  );
  const parsed: unknown = await response.json();
  return { status: response.status, body: parsed };
}

const music = { kind: 'music', sceneId: 'scene-1', description: 'La mia musica.' };

async function uploaded(filmId: string, seconds = 1): Promise<AudioClip> {
  const reply = await upload(filmId, music, wavFile(seconds));
  expect(reply.status).toBe(201);
  return audioClipSchema.parse(reply.body);
}

describe('caricare un file audio', () => {
  it('diventa una clip pronta, con la durata vera e già in uso', async () => {
    const { film } = await filmWithFinal(client);

    const clip = await uploaded(film.id, 2);

    expect(clip).toMatchObject({ kind: 'music', source: 'uploaded', sceneId: 'scene-1' });
    expect(clip.durationS).toBeCloseTo(2, 1);
    const [variant] = clip.variants;
    expect(variant).toMatchObject({ status: 'succeeded' });
    expect(variant?.modelId).toBeUndefined();
    expect(clip.chosenVariantId).toBe(variant?.id);

    const file = await fetch(`${base}/api/assets/${variant?.assetId ?? ''}`);
    expect(file.headers.get('content-type')).toContain('audio/wav');
  });

  it('il file non esce dal computer: nessuna chiamata a nessun servizio, e non si può generare', async () => {
    const { film } = await filmWithFinal(client);
    const count = () => receipts.list().filter((r) => r.projectId === film.id).length;
    const before = count();

    const clip = await uploaded(film.id);
    const elsewhere = `/projects/${film.id}/audio/clips/${clip.id}`;

    expect(count()).toBe(before);
    for (const reply of [
      await client.call('GET', `${elsewhere}/options`),
      await client.call('POST', `${elsewhere}/variants`, {}),
    ]) {
      expect(reply.status).toBe(409);
      expect(domainErrorSchema.parse(reply.body).details?.field).toBe('source');
    }
    expect(count()).toBe(before);
  });

  it('va su qualunque traccia: una registrazione sta sui dialoghi, un effetto su un’inquadratura', async () => {
    const { film, shot } = await filmWithShot(client);

    const voice = await upload(film.id, { ...music, kind: 'dialogue' }, wavFile());
    const effect = await upload(
      film.id,
      { ...music, kind: 'sfx', shotId: shot.id, startS: '0.5' },
      wavFile(),
    );

    expect(audioClipSchema.parse(voice.body).kind).toBe('dialogue');
    expect(audioClipSchema.parse(effect.body)).toMatchObject({
      kind: 'sfx',
      shotId: shot.id,
      startS: 0.5,
    });
  });

  it('si toglie come le altre, e il secondo posto rispetta le stesse regole', async () => {
    const { film } = await filmWithFinal(client);
    const clip = await uploaded(film.id);

    const removed = await client.call('DELETE', `/projects/${film.id}/audio/clips/${clip.id}`);

    expect(audioOverviewSchema.parse(removed.body).clips).toEqual([]);
    expect((await upload(film.id, { ...music, sceneId: 'scene-99' }, wavFile())).status).toBe(404);
  });
});

describe('cosa non si accetta', () => {
  const fieldOf = (reply: { body: unknown }) => domainErrorSchema.parse(reply.body).details?.field;

  it('un file che non è audio, anche se dice di esserlo', async () => {
    const { film } = await filmWithFinal(client);

    const reply = await upload(film.id, music, Buffer.from('non sono musica'));

    expect(reply.status).toBe(400);
    expect(fieldOf(reply)).toBe('file');
  });

  it('un file rovinato non resta sul disco e non lascia clip', async () => {
    const { film } = await filmWithFinal(client);
    const broken = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WAVEgarbage'),
    ]);

    const reply = await upload(film.id, music, broken);

    expect(reply.status).toBeGreaterThanOrEqual(400);
    const overview = audioOverviewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    expect(overview.clips).toEqual([]);
    const folder = path.join(dataDir, 'progetti', film.id, 'caricate');
    await expect(readdir(folder).then((files) => files.length)).resolves.toBe(0);
  });

  it('un posto sbagliato: la musica sta sulla scena, un effetto su un’inquadratura', async () => {
    const { film, shot } = await filmWithShot(client);

    expect((await upload(film.id, { ...music, shotId: shot.id }, wavFile())).status).toBe(400);
    expect((await upload(film.id, { ...music, kind: 'sfx' }, wavFile())).status).toBe(400);
    expect((await upload(film.id, { ...music, kind: 'native' }, wavFile())).status).toBe(400);
    expect((await upload(film.id, { ...music, description: ' ' }, wavFile())).status).toBe(400);
  });

  it('un film che non c’è è 404', async () => {
    expect((await upload('inventato', music, wavFile())).status).toBe(404);
  });
});

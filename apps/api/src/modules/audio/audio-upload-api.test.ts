import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  audioClipSchema,
  audioOverviewSchema,
  audioTimelineSchema,
  domainErrorSchema,
  type AudioClip,
} from '@filmzy/contracts';
import type { ReceiptStore, SheetStore, TakeStore } from '@filmzy/db';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { SHEET_STORE } from '../cast/tokens.js';
import { TAKE_STORE } from '../shots/tokens.js';
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

describe('caricare un file su un blocco che c’è già (T5.6)', () => {
  async function uploadOn(filmId: string, clipId: string, body: Buffer) {
    const response = await fetch(`${base}/api/projects/${filmId}/audio/clips/${clipId}/uploads`, {
      method: 'POST',
      headers: { 'content-type': 'audio/wav' },
      body,
    });
    const parsed: unknown = await response.json();
    return { status: response.status, body: parsed };
  }

  it('diventa una variante in uso, non esce dal computer e si può ancora generare', async () => {
    const { film } = await filmWithFinal(client);
    const created = await client.call('POST', `/projects/${film.id}/audio/clips`, {
      ...music,
      durationS: 20,
    });
    const clip = audioClipSchema.parse(created.body);
    const count = () => receipts.list().filter((r) => r.projectId === film.id).length;
    const before = count();

    const reply = await uploadOn(film.id, clip.id, wavFile(2));

    expect(reply.status).toBe(201);
    const updated = audioClipSchema.parse(reply.body);
    expect(updated.source).toBe('generated');
    expect(updated.durationS).toBe(20);
    expect(updated.chosenVariantId).toBe(updated.variants[0]?.id);
    expect(updated.variants[0]?.modelId).toBeUndefined();
    expect(count()).toBe(before);
    expect(
      (await client.call('GET', `/projects/${film.id}/audio/clips/${clip.id}/options`)).status,
    ).toBe(200);
  });

  it('un file che non è audio non aggiunge niente, e una clip che non c’è è 404', async () => {
    const { film } = await filmWithFinal(client);
    const clip = await uploaded(film.id);

    expect((await uploadOn(film.id, clip.id, Buffer.from('non sono musica'))).status).toBe(400);
    expect((await uploadOn(film.id, 'inventata', wavFile())).status).toBe(404);
    const { clips } = audioOverviewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/audio`)).body,
    );
    expect(clips[0]?.variants).toHaveLength(1);
  });
});

describe('l’audio originale di un take (T5.6)', () => {
  const run = promisify(execFile);

  /** Un take riuscito con questo file: il fornitore finto non fa video veri, e qui il suono conta. */
  async function takeWith(filmId: string, shotId: string, file: string) {
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

  async function videoFile(withSound: boolean): Promise<string> {
    const dir = await mkdtemp(path.join(dataDir, 'prova-'));
    const file = path.join(dir, 'clip.mp4');
    await run(ffmpegPath(), [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc=duration=1:size=64x36:rate=10',
      ...(withSound ? ['-f', 'lavfi', '-i', 'sine=duration=1'] : []),
      '-pix_fmt',
      'yuv420p',
      '-shortest',
      file,
    ]);
    return file;
  }

  it('accenderlo si vede sulla linea del tempo e riapre la traccia, che parte muta', async () => {
    const { film, shot } = await filmWithShot(client);
    const takeId = await takeWith(film.id, shot.id, await videoFile(true));
    const audio = `/projects/${film.id}/audio`;

    const on = await client.call('PUT', `${audio}/takes/${takeId}/native`, { on: true });

    expect(on.status).toBe(200);
    expect(
      audioOverviewSchema.parse(on.body).tracks.find(({ kind }) => kind === 'native')?.muted,
    ).toBe(false);
    const timeline = audioTimelineSchema.parse(
      (await client.call('GET', `${audio}/timeline`)).body,
    );
    expect(timeline.shots[0]).toMatchObject({ takeId, nativeAudio: true });

    await client.call('PUT', `${audio}/takes/${takeId}/native`, { on: false });
    const after = audioTimelineSchema.parse((await client.call('GET', `${audio}/timeline`)).body);
    expect(after.shots[0]?.nativeAudio).toBe(false);
  });

  it('su una clip senza suono non si accende, e lo dice', async () => {
    const { film, shot } = await filmWithShot(client);
    const takeId = await takeWith(film.id, shot.id, await videoFile(false));

    const reply = await client.call('PUT', `/projects/${film.id}/audio/takes/${takeId}/native`, {
      on: true,
    });

    expect(reply.status).toBe(409);
    expect(domainErrorSchema.parse(reply.body).details?.field).toBe('nativeAudio');
  });

  it('un take di un altro film non si trova', async () => {
    const { film, shot } = await filmWithShot(client);
    const { film: other } = await filmWithFinal(client);
    const takeId = await takeWith(film.id, shot.id, await videoFile(true));

    const reply = await client.call('PUT', `/projects/${other.id}/audio/takes/${takeId}/native`, {
      on: true,
    });

    expect(reply.status).toBe(404);
  });
});

describe('cosa non si accetta', () => {
  const fieldOf = (reply: { body: unknown }) => domainErrorSchema.parse(reply.body).details?.field;

  it('un file che non è audio, anche se dice di esserlo', async () => {
    const { film } = await filmWithFinal(client);

    const reply = await upload(film.id, music, Buffer.from('non sono musica'));

    expect(reply.status).toBe(400);
    expect(fieldOf(reply)).toBe('audioFile');
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
    expect((await upload(film.id, { ...music, startS: '1' }, wavFile())).status).toBe(400);
    expect(
      (await upload(film.id, { ...music, kind: 'dialogue', startS: '99999' }, wavFile())).status,
    ).toBe(400);
  });

  it('una seconda musica sulla stessa scena: un blocco per scena (D24)', async () => {
    const { film } = await filmWithFinal(client);
    await uploaded(film.id);

    expect((await upload(film.id, music, wavFile())).status).toBe(409);
  });

  it('un film che non c’è è 404', async () => {
    expect((await upload('inventato', music, wavFile())).status).toBe(404);
  });
});

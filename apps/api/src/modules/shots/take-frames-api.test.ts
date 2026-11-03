import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  domainErrorSchema,
  shotImagesSchema,
  shotTakesSchema,
  type ShotImages,
  type ShotTakes,
} from '@filmzy/contracts';
import { ffmpegPath } from '@filmzy/media';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';

/**
 * «Tieni questo take» e «Usa questo fotogramma come punto di partenza» (T4.6), col server vero.
 * Per il fotogramma serve un video vero (due secondi, fatti da ffmpeg): il fornitore finto lo
 * consegna come clip del take, e il server ne estrae un fotogramma con lo stesso ffmpeg.
 */
const run = promisify(execFile);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const VIDEO_DURATION_S = 2;

let real: { app: NestExpressApplication; client: Client; baseUrl: string };
// Un server col video finto (non è un video vero): ffmpeg non ne cava niente.
let fake: { app: NestExpressApplication; client: Client };

beforeAll(async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-clip-'));
  const clip = path.join(dir, 'clip.mp4');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `testsrc=duration=${String(VIDEO_DURATION_S)}:size=160x90:rate=10`,
      '-c:v',
      'mpeg4',
      '-pix_fmt',
      'yuv420p',
      clip,
    ],
    { windowsHide: true },
  );
  const base64 = (await readFile(clip)).toString('base64');

  const started = await startAppWithFixtures({
    camera_operator: {
      polls: 1,
      files: [{ fileName: 'clip.mp4', contentType: 'video/mp4', base64 }],
    },
  });
  real = { ...started, baseUrl: await started.app.getUrl() };
  fake = await startApp();
}, 60_000);

afterAll(async () => {
  await real.app.close();
  await fake.app.close();
});

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

async function untilIdle(client: Client, path: string): Promise<ShotTakes> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);
    if (current.takes.every((take) => take.status === 'succeeded' || take.status === 'failed')) {
      return current;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il take non è arrivato in tempo');
}

/** Un film con un'inquadratura e un take riuscito. */
async function withTake(client: Client) {
  const film = await filmWithShot(client);
  const path = `${film.shots}/${film.shot.id}`;
  await client.call('POST', `${path}/takes`, {});
  const take = (await untilIdle(client, path)).takes[0];
  if (take?.status !== 'succeeded') throw new Error('il take doveva riuscire');
  return { ...film, path, take };
}

const readImages = async (client: Client, path: string): Promise<ShotImages> =>
  shotImagesSchema.parse((await client.call('GET', `${path}/images`)).body);

describe('«Tieni questo take»', () => {
  it('segna il take scelto, e solo quello; scegliere un altro toglie il segno al primo', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);
    await client.call('POST', `${path}/takes`, {});
    const [second] = (await untilIdle(client, path)).takes;
    if (second === undefined) throw new Error('doveva esserci un secondo take');
    expect(second.id).not.toBe(take.id);

    const chosen = await client.call('PUT', `${path}/takes/choice`, { takeId: take.id });
    expect(chosen.status).toBe(200);
    expect(
      shotTakesSchema
        .parse(chosen.body)
        .takes.filter((item) => item.chosen)
        .map((item) => item.id),
    ).toEqual([take.id]);

    await client.call('PUT', `${path}/takes/choice`, { takeId: second.id });
    const after = shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);
    expect(after.takes.filter((item) => item.chosen).map((item) => item.id)).toEqual([second.id]);
  }, 30_000);

  it('un take che non c’è, di un’altra inquadratura o non riuscito non si può scegliere', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);
    const other = await withTake(client);

    for (const takeId of ['non-esiste', other.take.id]) {
      expect(failure(await client.call('PUT', `${path}/takes/choice`, { takeId }))).toMatchObject({
        status: 409,
        code: 'invalid_request',
      });
    }
    // Il take di prima non è stato toccato.
    const current = shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);
    expect(current.takes.find((item) => item.id === take.id)?.chosen).toBe(false);
  }, 30_000);

  it('una richiesta sbagliata o un’inquadratura che non c’è danno un errore chiaro', async () => {
    const { client } = real;
    const { path, shots } = await withTake(client);

    expect(failure(await client.call('PUT', `${path}/takes/choice`, {})).status).toBe(400);
    expect(
      failure(await client.call('PUT', `${shots}/non-esiste/takes/choice`, { takeId: 'x' })),
    ).toMatchObject({ status: 404, code: 'not_found' });
  }, 30_000);
});

describe('«Usa questo fotogramma come punto di partenza»', () => {
  it('il fotogramma diventa il primo dell’inquadratura, si serve come immagine e resta tra le scelte', async () => {
    const { client, baseUrl } = real;
    const { path, take } = await withTake(client);

    const reply = await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1 });

    expect(reply.status).toBe(201);
    const images = shotImagesSchema.parse(reply.body);
    const first = images.images.find((image) => image.use === 'first_frame');
    expect(first).toMatchObject({ from: 'take_frame', takeId: take.id, atS: 1 });
    expect(images.candidates).toContainEqual({
      assetId: first?.assetId,
      mode: 'take_frame',
      takeId: take.id,
      atS: 1,
    });

    const file = await fetch(`${baseUrl}/api/assets/${first?.assetId ?? ''}`);
    expect(file.headers.get('content-type')).toContain('image/png');
    expect([...new Uint8Array(await file.arrayBuffer()).slice(0, 4)]).toEqual(PNG_SIGNATURE);
  }, 30_000);

  it('un secondo fotogramma prende il posto del primo; lo stesso momento due volte è una scelta sola', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);

    await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 0.5 });
    await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1.5 });
    await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1.5 });
    const images = await readImages(client, path);

    expect(images.images.filter((image) => image.use === 'first_frame')).toHaveLength(1);
    expect(images.images.find((image) => image.use === 'first_frame')?.atS).toBe(1.5);
    expect(
      images.candidates.filter((candidate) => candidate.mode === 'take_frame').map((c) => c.atS),
    ).toEqual(expect.arrayContaining([0.5, 1.5]));
    expect(images.candidates.filter((candidate) => candidate.atS === 1.5)).toHaveLength(1);
  }, 30_000);

  it('il fotogramma preso si può rimettere dopo averlo tolto, scegliendolo tra le immagini', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);
    await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1 });
    await client.call('PUT', `${path}/images`, { images: [] });
    const { candidates } = await readImages(client, path);
    const frame = candidates.find((candidate) => candidate.mode === 'take_frame');

    const back = await client.call('PUT', `${path}/images`, {
      images: [{ use: 'last_frame', assetId: frame?.assetId }],
    });

    expect(shotImagesSchema.parse(back.body).images).toEqual([
      { use: 'last_frame', from: 'take_frame', assetId: frame?.assetId, takeId: take.id, atS: 1 },
    ]);
  }, 30_000);

  it('mettere in pausa sull’ultimo istante vale anche se il lettore supera di un soffio la durata', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);

    for (const atS of [VIDEO_DURATION_S, VIDEO_DURATION_S + 0.2]) {
      const reply = await client.call('POST', `${path}/takes/${take.id}/frame`, { atS });
      expect(reply.status, String(atS)).toBe(201);
      expect(
        shotImagesSchema.parse(reply.body).images.find((image) => image.use === 'first_frame')?.atS,
      ).toBeLessThanOrEqual(VIDEO_DURATION_S);
    }
  }, 30_000);

  it('un momento oltre la fine del video si rifiuta, e un tempo impossibile non arriva a ffmpeg', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);

    expect(
      failure(await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 99 })),
    ).toMatchObject({ status: 409, code: 'invalid_request' });
    for (const atS of [-1, 99_999, 'due']) {
      expect(
        failure(await client.call('POST', `${path}/takes/${take.id}/frame`, { atS })).status,
      ).toBe(400);
    }
    expect((await readImages(client, path)).images).toEqual([]);
  }, 30_000);

  it('un take che non c’è o di un’altra inquadratura non dà fotogrammi', async () => {
    const { client } = real;
    const { path } = await withTake(client);
    const other = await withTake(client);

    for (const takeId of ['non-esiste', other.take.id]) {
      expect(
        failure(await client.call('POST', `${path}/takes/${takeId}/frame`, { atS: 1 })),
      ).toMatchObject({ status: 409, code: 'invalid_request' });
    }
    expect((await readImages(client, path)).images).toEqual([]);
  }, 30_000);

  it('se il video non si può leggere l’errore è chiaro e le immagini restano come prima', async () => {
    const { client } = fake;
    const { path, take } = await withTake(client);

    const reply = failure(await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1 }));

    expect(reply).toMatchObject({ status: 422, code: 'media_failed', retryable: false });
    expect(JSON.stringify(reply)).not.toMatch(/ffmpeg|[\\/]/i);
    expect((await readImages(client, path)).images).toEqual([]);
  }, 30_000);

  it('dopo il fotogramma un nuovo take parte dal primo fotogramma scelto', async () => {
    const { client } = real;
    const { path, take } = await withTake(client);
    await client.call('POST', `${path}/takes/${take.id}/frame`, { atS: 1 });

    const started = await client.call('POST', `${path}/takes`, {});

    expect(started.status).toBe(201);
    const done = await untilIdle(client, path);
    expect(done.takes).toHaveLength(2);
    expect(done.takes.every((item) => item.status === 'succeeded')).toBe(true);
  }, 30_000);
});

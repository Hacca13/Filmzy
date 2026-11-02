import {
  domainErrorSchema,
  scenePlanSchema,
  sheetOptionsSchema,
  shotImagesSchema,
  shotPlansSchema,
  shotStoryboardSchema,
  type ShotImages,
  type ShotStoryboard,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot as makeFilmWithShot } from '../../test-support/film-with-shot.js';

/**
 * «Imposta le immagini» (T4.2), col server vero, la coda dei lavori e il fornitore finto: le
 * immagini tra cui scegliere sono le varianti già fatte, il primo fotogramma serve per generare
 * l'ultimo, e a ogni scelta il server dice quanti servizi video accettano la combinazione.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
}, 30_000);

afterAll(async () => {
  await app.close();
});

const filmWithShot = () => makeFilmWithShot(client);

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

async function untilDone(path: string): Promise<ShotStoryboard> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const storyboard = shotStoryboardSchema.parse((await client.call('GET', path)).body);
    const status = storyboard.attempts[0]?.status;
    if (status === 'succeeded' || status === 'failed') return storyboard;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('le immagini non sono arrivate in tempo');
}

/** Un'inquadratura con lo storyboard fatto: c'è un'immagine da usare. */
async function shotWithStoryboard() {
  const film = await filmWithShot();
  const path = `${film.shots}/${film.shot.id}`;
  await client.call('POST', `${path}/storyboard`, {});
  const done = await untilDone(`${path}/storyboard`);
  const assetId = done.attempts[0]?.assetIds[0] ?? '';
  return { ...film, path, assetId };
}

const readImages = async (path: string): Promise<ShotImages> =>
  shotImagesSchema.parse((await client.call('GET', `${path}/images`)).body);

describe('le immagini di un’inquadratura', () => {
  it('all’inizio non c’è niente di impostato né da scegliere, e il video può partire coi riferimenti', async () => {
    const { shot, shots } = await filmWithShot();

    const images = await readImages(`${shots}/${shot.id}`);

    expect(images).toMatchObject({ shotId: shot.id, images: [], candidates: [] });
    expect(images.videoServices).toBeGreaterThan(0);
  });

  it('le varianti dello storyboard sono le immagini tra cui scegliere', async () => {
    const { path, assetId } = await shotWithStoryboard();

    const images = await readImages(path);

    expect(images.candidates).toEqual([{ assetId, mode: 'storyboard', attempt: 1 }]);
  });

  it('si imposta il primo fotogramma, e resta nella scheda dell’inquadratura', async () => {
    const { path, shots, shot, assetId } = await shotWithStoryboard();

    const reply = await client.call('PUT', `${path}/images`, {
      images: [{ use: 'first_frame', assetId }],
    });

    expect(reply.status).toBe(200);
    expect(shotImagesSchema.parse(reply.body).images).toEqual([
      { use: 'first_frame', from: 'generate', assetId },
    ]);
    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(plans.scenes[0]?.shots.find((candidate) => candidate.id === shot.id)?.images).toEqual([
      { use: 'first_frame', from: 'generate', assetId },
    ]);
  });

  it('un elenco vuoto toglie le immagini: torna a decidere l’aiuto regista', async () => {
    const { path, assetId } = await shotWithStoryboard();
    await client.call('PUT', `${path}/images`, { images: [{ use: 'reference', assetId }] });

    const reply = await client.call('PUT', `${path}/images`, { images: [] });

    expect(shotImagesSchema.parse(reply.body).images).toEqual([]);
  });

  it('un’immagine che non è dell’inquadratura, o un ruolo messo due volte, si rifiuta', async () => {
    const { path, assetId } = await shotWithStoryboard();

    expect(
      failure(
        await client.call('PUT', `${path}/images`, {
          images: [{ use: 'first_frame', assetId: 'a'.repeat(64) }],
        }),
      ),
    ).toMatchObject({ status: 409, details: { field: 'assetId' } });
    expect(
      failure(
        await client.call('PUT', `${path}/images`, {
          images: [
            { use: 'first_frame', assetId },
            { use: 'reference', assetId },
          ],
        }),
      ),
    ).toMatchObject({ status: 409, details: { field: 'images' } });
    expect(
      failure(await client.call('PUT', `${path}/images`, { images: [{ use: 'sfondo', assetId }] })),
    ).toMatchObject({ status: 400, code: 'invalid_request' });
    expect((await readImages(path)).images).toEqual([]);
  });

  it('un’inquadratura sconosciuta o di un altro film dà «non trovato»', async () => {
    const { shot, shots } = await filmWithShot();
    const other = await filmWithShot();

    for (const [method, path] of [
      ['GET', `${shots}/non-esiste/images`],
      ['PUT', `${shots}/non-esiste/images`],
      ['GET', `${other.shots}/${shot.id}/images`],
      ['GET', `${shots}/non-esiste/end-frame`],
    ] as const) {
      const reply = await client.call(method, path, method === 'PUT' ? { images: [] } : undefined);
      expect(failure(reply), `${method} ${path}`).toMatchObject({ status: 404, code: 'not_found' });
    }
  });
});

describe('l’ultimo fotogramma', () => {
  it('senza il primo fotogramma non si genera: lo dice, senza spendere', async () => {
    const { path } = await shotWithStoryboard();

    expect(failure(await client.call('POST', `${path}/end-frame`, {}))).toMatchObject({
      status: 409,
      code: 'invalid_request',
      details: { field: 'firstFrame' },
    });
    expect(failure(await client.call('GET', `${path}/end-frame/options`))).toMatchObject({
      status: 409,
      details: { field: 'firstFrame' },
    });
    expect(
      shotStoryboardSchema.parse((await client.call('GET', `${path}/end-frame`)).body),
    ).toEqual({ shotId: expect.any(String) as string, attempts: [] });
  });

  it('dal primo fotogramma si genera l’ultimo, lo si sceglie e diventa il fotogramma finale', async () => {
    const { path, assetId } = await shotWithStoryboard();
    await client.call('PUT', `${path}/images`, { images: [{ use: 'first_frame', assetId }] });

    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${path}/end-frame/options`)).body,
    );
    expect(options.length).toBeGreaterThan(0);
    expect((await client.call('POST', `${path}/end-frame`, {})).status).toBe(201);
    const done = await untilDone(`${path}/end-frame`);
    expect(done.attempts[0]?.status).toBe('succeeded');
    const lastFrame = done.attempts[0]?.assetIds[0] ?? '';

    const chosen = await client.call('PUT', `${path}/end-frame/choice`, { assetId: lastFrame });

    expect(shotStoryboardSchema.parse(chosen.body).chosenAssetId).toBe(lastFrame);
    const images = await readImages(path);
    expect(images.images).toEqual([
      { use: 'first_frame', from: 'generate', assetId },
      { use: 'last_frame', from: 'generate', assetId: lastFrame },
    ]);
    // Le varianti dell'ultimo fotogramma si possono scegliere come immagini dell'inquadratura.
    expect(images.candidates.map((candidate) => candidate.mode).sort()).toEqual([
      'end_frame',
      'storyboard',
    ]);
  }, 20_000);

  it('l’ultimo fotogramma scelto non cambia lo storyboard scelto', async () => {
    const { path, shots, shot, assetId } = await shotWithStoryboard();
    await client.call('PUT', `${path}/storyboard/choice`, { assetId });
    await client.call('PUT', `${path}/images`, { images: [{ use: 'first_frame', assetId }] });
    await client.call('POST', `${path}/end-frame`, {});
    const done = await untilDone(`${path}/end-frame`);
    await client.call('PUT', `${path}/end-frame/choice`, {
      assetId: done.attempts[0]?.assetIds[0] ?? '',
    });

    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    const plan = scenePlanSchema.parse(plans.scenes[0]);
    expect(plan.chosenStoryboards).toEqual({ [shot.id]: assetId });
  }, 20_000);
});

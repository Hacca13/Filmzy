import {
  domainErrorSchema,
  shotImagesSchema,
  sheetOptionsSchema,
  shotPlansSchema,
  shotStoryboardSchema,
  shotTakesSchema,
  type ShotTakes,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot as makeFilmWithShot } from '../../test-support/film-with-shot.js';

/**
 * Il giro del take video (T4.3), col server vero, la coda dei lavori e il fornitore finto: «Genera»
 * mette in coda un take, la clip si copia nella cartella del film e compare nella card, e ogni take
 * dice con quale servizio è stato fatto. Nessuna spesa vera.
 */
let app: NestExpressApplication;
let client: Client;
let baseUrl: string;

beforeAll(async () => {
  ({ app, client } = await startApp());
  baseUrl = await app.getUrl();
}, 30_000);

afterAll(async () => {
  await app.close();
});

const filmWithShot = () => makeFilmWithShot(client);

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

const readTakes = async (path: string): Promise<ShotTakes> =>
  shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);

async function untilIdle(path: string): Promise<ShotTakes> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = await readTakes(path);
    if (current.takes.every((take) => take.status === 'succeeded' || take.status === 'failed')) {
      return current;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il take non è arrivato in tempo');
}

async function shotPath() {
  const film = await filmWithShot();
  return { ...film, path: `${film.shots}/${film.shot.id}` };
}

describe('i take video di un’inquadratura', () => {
  it('prima di cominciare non ce n’è nessuno, e i servizi si vedono con la stima', async () => {
    const { path, shot } = await shotPath();

    expect(await readTakes(path)).toEqual({ shotId: shot.id, takes: [] });
    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${path}/takes/options`)).body,
    );
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.estimatedCostUsd > 0)).toBe(true);
  });

  it('«Genera» dà un take: la clip si salva nella cartella del film, si serve e compare nella card', async () => {
    const { path, shots } = await shotPath();

    const started = await client.call('POST', `${path}/takes`, {});
    expect(started.status).toBe(201);
    expect(['queued', 'running']).toContain(shotTakesSchema.parse(started.body).takes[0]?.status);

    const done = await untilIdle(path);
    const take = done.takes[0];
    expect(take?.status).toBe('succeeded');
    expect(take?.modelLabel).toBeTruthy();
    expect(typeof take?.costUsd).toBe('number');

    const file = await fetch(`${baseUrl}/api/assets/${take?.assetId ?? ''}`);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('video/mp4');

    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(Object.values(plans.scenes[0]?.clips ?? {})).toEqual([take?.assetId]);
  }, 30_000);

  it('rigenerare con un altro servizio dà un secondo take che dice con quale è stato fatto', async () => {
    const { path } = await shotPath();
    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${path}/takes/options`)).body,
    );
    const [first, second] = options;
    if (first === undefined || second === undefined) throw new Error('servono due servizi video');

    await client.call('POST', `${path}/takes`, { modelId: first.modelId });
    await untilIdle(path);
    await client.call('POST', `${path}/takes`, { modelId: second.modelId });
    const done = await untilIdle(path);

    expect(done.takes).toHaveLength(2);
    expect(done.takes.map((take) => take.modelId)).toEqual([second.modelId, first.modelId]);
    expect(done.takes.every((take) => take.status === 'succeeded')).toBe(true);
  }, 30_000);

  it('due richieste insieme (un doppio clic) aprono un solo take', async () => {
    const { path } = await shotPath();

    const replies = await Promise.all([
      client.call('POST', `${path}/takes`, {}),
      client.call('POST', `${path}/takes`, {}),
    ]);

    expect(replies.map((reply) => reply.status).sort()).toEqual([201, 409]);
    expect((await untilIdle(path)).takes).toHaveLength(1);
  }, 30_000);

  it('un servizio che non è fra quelli adatti non si usa: nessun take, nessuno scambio in silenzio', async () => {
    const { path } = await shotPath();

    const reply = failure(await client.call('POST', `${path}/takes`, { modelId: 'inventato' }));

    expect(reply).toMatchObject({ status: 409, code: 'no_eligible_model' });
    expect((await readTakes(path)).takes).toEqual([]);
  });

  it('con una combinazione di immagini che nessun servizio accetta il take non parte e non si spende', async () => {
    const { path } = await shotPath();
    await client.call('POST', `${path}/storyboard`, {});
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const storyboard = shotStoryboardSchema.parse(
        (await client.call('GET', `${path}/storyboard`)).body,
      );
      if (storyboard.attempts[0]?.status === 'succeeded') break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const { candidates } = shotImagesSchema.parse(
      (await client.call('GET', `${path}/images`)).body,
    );
    const assetId = candidates[0]?.assetId ?? '';
    // Solo l'ultimo fotogramma, senza il primo: nessun servizio lo accetta (D20).
    await client.call('PUT', `${path}/images`, { images: [{ use: 'last_frame', assetId }] });

    const reply = failure(await client.call('POST', `${path}/takes`, {}));

    expect(reply).toMatchObject({ status: 409, code: 'no_eligible_model' });
    expect((await readTakes(path)).takes).toEqual([]);
  }, 30_000);

  it('un’inquadratura sconosciuta o di un altro film dà «non trovato»', async () => {
    const { shot, shots } = await shotPath();
    const other = await shotPath();

    for (const [method, path] of [
      ['GET', `${shots}/non-esiste/takes`],
      ['GET', `${shots}/non-esiste/takes/options`],
      ['POST', `${shots}/non-esiste/takes`],
      ['GET', `${other.shots}/${shot.id}/takes`],
      ['POST', `${other.shots}/${shot.id}/takes`],
    ] as const) {
      const reply = await client.call(method, path, method === 'POST' ? {} : undefined);
      expect(failure(reply), `${method} ${path}`).toMatchObject({ status: 404, code: 'not_found' });
    }
  });

  it('rifare il piano della scena porta via le inquadrature con i loro take', async () => {
    const { path, shots } = await shotPath();
    await client.call('POST', `${path}/takes`, {});
    await untilIdle(path);

    await client.call('POST', shots, { sceneNumber: 1 });

    expect((await client.call('GET', `${path}/takes`)).status).toBe(404);
    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(plans.scenes[0]?.clips).toEqual({});
  }, 30_000);
});

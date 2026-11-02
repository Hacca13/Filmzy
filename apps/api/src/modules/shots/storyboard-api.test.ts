import {
  domainErrorSchema,
  locationImagesSchema,
  sheetOptionsSchema,
  shotPlansSchema,
  shotStoryboardSchema,
  type ShotStoryboard,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot as makeFilmWithShot } from '../../test-support/film-with-shot.js';

/**
 * Il giro dello storyboard (T4.1), col server vero, la coda dei lavori e il fornitore finto: dalle
 * inquadrature di una scena si fanno le varianti dell'immagine, se ne sceglie una e diventa il
 * riferimento della card. Nessuna spesa vera.
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

async function untilDone(path: string): Promise<ShotStoryboard> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const storyboard = shotStoryboardSchema.parse((await client.call('GET', path)).body);
    const status = storyboard.attempts[0]?.status;
    if (status === 'succeeded' || status === 'failed') return storyboard;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('le varianti non sono arrivate in tempo');
}

describe('lo storyboard di un’inquadratura', () => {
  it('prima di cominciare non ci sono tentativi, e i servizi si vedono con la stima', async () => {
    const { shot, shots } = await filmWithShot();

    const empty = shotStoryboardSchema.parse(
      (await client.call('GET', `${shots}/${shot.id}/storyboard`)).body,
    );
    expect(empty).toEqual({ shotId: shot.id, attempts: [] });

    const { options } = sheetOptionsSchema.parse(
      (await client.call('GET', `${shots}/${shot.id}/storyboard/options`)).body,
    );
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.estimatedCostUsd > 0)).toBe(true);
  });

  it('si fanno le varianti, si salvano nella cartella del film e si servono', async () => {
    const { shot, shots } = await filmWithShot();
    const path = `${shots}/${shot.id}/storyboard`;

    const started = await client.call('POST', path, {});
    expect(started.status).toBe(201);
    // Il lavoro parte subito: appena messo in coda può essere già in lavorazione.
    expect(['queued', 'running']).toContain(
      shotStoryboardSchema.parse(started.body).attempts[0]?.status,
    );

    const done = await untilDone(path);
    expect(done.attempts[0]?.status).toBe('succeeded');
    expect(done.attempts[0]?.assetIds.length).toBeGreaterThan(0);
    const file = await fetch(`${baseUrl}/api/assets/${done.attempts[0]?.assetIds[0] ?? ''}`);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('image/png');
  }, 20_000);

  it('con l’immagine del set scelta il giro funziona lo stesso: il set entra come riferimento', async () => {
    const { shot, shots, location, places } = await filmWithShot();
    const images = `${places}/${location.id}/images`;
    await client.call('POST', images, {});
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const status = locationImagesSchema.parse((await client.call('GET', images)).body).attempts[0]
        ?.status;
      if (status === 'succeeded') break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const set = locationImagesSchema.parse((await client.call('GET', images)).body);
    const chosen = set.attempts[0]?.assetIds[0] ?? '';
    await client.call('PUT', `${images}/choice`, { assetId: chosen });

    const path = `${shots}/${shot.id}/storyboard`;
    await client.call('POST', path, {});
    const done = await untilDone(path);

    expect(done.attempts[0]?.status).toBe('succeeded');
  }, 30_000);

  it('un secondo tentativo mentre il primo lavora si rifiuta', async () => {
    const { shot, shots } = await filmWithShot();
    const path = `${shots}/${shot.id}/storyboard`;
    await client.call('POST', path, {});

    expect(failure(await client.call('POST', path, {}))).toMatchObject({
      status: 409,
      details: { field: 'storyboard' },
    });
    await untilDone(path);
  }, 20_000);

  it('la variante scelta diventa il riferimento della card; una che non è sua si rifiuta', async () => {
    const { shot, shots } = await filmWithShot();
    const path = `${shots}/${shot.id}/storyboard`;
    await client.call('POST', path, {});
    const done = await untilDone(path);
    const assetId = done.attempts[0]?.assetIds[0] ?? '';

    expect(
      failure(await client.call('PUT', `${path}/choice`, { assetId: 'a'.repeat(64) })),
    ).toMatchObject({ status: 409, details: { field: 'assetId' } });

    const chosen = await client.call('PUT', `${path}/choice`, { assetId });
    expect(shotStoryboardSchema.parse(chosen.body).chosenAssetId).toBe(assetId);

    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(plans.scenes[0]?.chosenStoryboards).toEqual({ [shot.id]: assetId });
  }, 20_000);

  it('un servizio che non è fra quelli adatti non si usa: nessuno scambio in silenzio', async () => {
    const { shot, shots } = await filmWithShot();
    const path = `${shots}/${shot.id}/storyboard`;

    const reply = failure(await client.call('POST', path, { modelId: 'inventato' }));

    expect(reply).toMatchObject({ status: 409, code: 'no_eligible_model' });
    expect(shotStoryboardSchema.parse((await client.call('GET', path)).body).attempts).toEqual([]);
  });

  it('un’inquadratura sconosciuta o di un altro film dà «non trovato»', async () => {
    const { shot, shots } = await filmWithShot();
    const other = await filmWithShot();

    for (const [method, path] of [
      ['GET', `${shots}/non-esiste/storyboard`],
      ['GET', `${shots}/non-esiste/storyboard/options`],
      ['POST', `${shots}/non-esiste/storyboard`],
      ['PUT', `${shots}/non-esiste/storyboard/choice`],
      ['GET', `${other.shots}/${shot.id}/storyboard`],
      ['POST', `${other.shots}/${shot.id}/storyboard`],
    ] as const) {
      const body = { GET: undefined, POST: {}, PUT: { assetId: 'x' } }[method];
      const reply = await client.call(method, path, body);
      expect(failure(reply), `${method} ${path}`).toMatchObject({ status: 404, code: 'not_found' });
    }
  });

  it('se la scena cambia dopo, lo storyboard non parte finché il piano non è rifatto', async () => {
    const { film, shot, shots, final } = await filmWithShot();
    const scenes = final.screenplay.scenes.map((scene) =>
      scene.number === 1 ? { ...scene, summary: 'Una scena riscritta a mano.' } : scene,
    );
    await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
      screenplay: { ...final.screenplay, scenes },
    });

    const reply = failure(await client.call('POST', `${shots}/${shot.id}/storyboard`, {}));

    expect(reply).toMatchObject({
      status: 409,
      code: 'invalid_request',
      details: { field: 'plan' },
    });
    expect(
      shotStoryboardSchema.parse((await client.call('GET', `${shots}/${shot.id}/storyboard`)).body)
        .attempts,
    ).toEqual([]);
  });

  it('rifare il piano della scena porta via le inquadrature con il loro storyboard', async () => {
    const { shot, shots } = await filmWithShot();
    const path = `${shots}/${shot.id}/storyboard`;
    await client.call('POST', path, {});
    const done = await untilDone(path);
    await client.call('PUT', `${path}/choice`, { assetId: done.attempts[0]?.assetIds[0] ?? '' });

    await client.call('POST', shots, { sceneNumber: 1 });

    expect((await client.call('GET', path)).status).toBe(404);
    const plans = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(plans.scenes[0]?.chosenStoryboards).toEqual({});
  }, 20_000);
});

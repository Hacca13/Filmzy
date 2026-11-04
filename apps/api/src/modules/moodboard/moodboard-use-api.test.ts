import {
  moodboardViewSchema,
  shotImagesSchema,
  shotPlansSchema,
  shotTakesSchema,
  type MoodboardView,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';

/**
 * Come il moodboard arriva ai ruoli e alle inquadrature (T4.10, D37, D38), col server vero e un
 * analista finto che vede sempre delle persone: le immagini del moodboard si scelgono per
 * un'inquadratura («Dal moodboard») tranne quelle «solo per l'analisi», e cambiare palette o consigli
 * dopo i take dà un avviso leggero (R9) che passa rigirando.
 */
let app: NestExpressApplication;
let client: Client;
let base: string;

const PEOPLE = {
  data: {
    description: 'a crowded station platform',
    moodTags: ['busy'],
    lighting: 'low light',
    composition: 'wide',
    containsPeople: true,
    flags: [],
  },
};

beforeAll(async () => {
  ({ app, client } = await startAppWithFixtures({ image_analyst: PEOPLE }));
  base = await app.getUrl();
}, 60_000);

afterAll(async () => {
  await app.close();
});

async function untilMoodboardDone(film: string): Promise<MoodboardView> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = moodboardViewSchema.parse(
      (await client.call('GET', `/projects/${film}/moodboard`)).body,
    );
    if (current.run?.status === 'succeeded' || current.run?.status === 'failed') return current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il moodboard non è arrivato in tempo');
}

async function untilTake(path: string): Promise<void> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const current = shotTakesSchema.parse((await client.call('GET', `${path}/takes`)).body);
    if (current.takes.every((take) => take.status === 'succeeded' || take.status === 'failed'))
      return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il take non è arrivato in tempo');
}

describe('«Dal moodboard» tra le immagini dell’inquadratura', () => {
  it('le immagini del moodboard si offrono e si impostano; quelle solo per l’analisi no', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    await client.call('POST', `/projects/${film.id}/moodboard/generate`, {});
    const done = await untilMoodboardDone(film.id);
    const generated = done.moodboard.film.references.map((reference) => reference.assetId);
    expect(generated).toHaveLength(2);

    // Un'immagine con persone entra nel moodboard, ma solo per l'analisi.
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('folla'),
    ]);
    const uploaded = await fetch(`${base}/api/projects/${film.id}/moodboard/references`, {
      method: 'POST',
      headers: { 'content-type': 'image/png' },
      body: png,
    });
    expect(uploaded.status).toBe(201);
    const people = moodboardViewSchema
      .parse(await uploaded.json())
      .moodboard.film.references.find((reference) => reference.analysisOnly);
    expect(people).toBeDefined();

    const path = `${shots}/${shot.id}/images`;
    const offered = shotImagesSchema.parse((await client.call('GET', path)).body);
    const fromMoodboard = offered.candidates.filter((candidate) => candidate.mode === 'moodboard');
    expect(fromMoodboard.map((candidate) => candidate.assetId).sort()).toEqual(
      [...generated].sort(),
    );
    expect(offered.candidates.map((candidate) => candidate.assetId)).not.toContain(people?.assetId);

    const set = await client.call('PUT', path, {
      images: [{ use: 'reference', assetId: generated[0] }],
    });
    expect(shotImagesSchema.parse(set.body).images).toEqual([
      { use: 'reference', from: 'moodboard', assetId: generated[0] },
    ]);
    // Quella con persone non si può scegliere nemmeno scrivendo l'id a mano.
    const refused = await client.call('PUT', path, {
      images: [{ use: 'reference', assetId: people?.assetId }],
    });
    expect(refused.status).toBe(409);
  }, 120_000);
});

describe('R9: palette o consigli cambiati dopo il video', () => {
  it('avvisano in modo leggero i take già girati, e rigirando l’avviso passa', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    const shotPath = `${shots}/${shot.id}`;
    await client.call('POST', `${shotPath}/takes`, {});
    await untilTake(shotPath);
    const flagsOf = async () =>
      shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0]?.flags[shot.id];
    expect(await flagsOf()).toBeUndefined();

    // Aggiungere un'immagine non cambia palette né consigli: nessun avviso.
    await new Promise((resolve) => setTimeout(resolve, 20));
    await client.call('PUT', `/projects/${film.id}/moodboard`, {
      palette: [{ hex: '#c2813a' }],
      notes: 'Luce calda.',
    });

    expect(await flagsOf()).toEqual([
      expect.objectContaining({
        code: 'R9',
        reason: expect.stringContaining('rigiralo') as string,
        origin: 'rule',
        light: true,
      }),
    ]);

    // Rigirato il video dopo il cambiamento, l'inquadratura è di nuovo allineata.
    await new Promise((resolve) => setTimeout(resolve, 20));
    await client.call('POST', `${shotPath}/takes`, {});
    await untilTake(shotPath);
    expect(await flagsOf()).toBeUndefined();
  }, 120_000);

  it('il moodboard di una scena avvisa solo le inquadrature di quella scena', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    const shotPath = `${shots}/${shot.id}`;
    await client.call('POST', `${shotPath}/takes`, {});
    await untilTake(shotPath);
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Un'altra scena della stessa storia, se c'è: il suo moodboard non tocca questa inquadratura.
    const view = moodboardViewSchema.parse(
      (await client.call('GET', `/projects/${film.id}/moodboard`)).body,
    );
    const another = view.scenes.find((scene) => scene.sceneId !== shot.sceneId);
    if (another !== undefined) {
      await client.call('PUT', `/projects/${film.id}/moodboard`, {
        sceneId: another.sceneId,
        palette: [{ hex: '#111111' }],
        notes: "Un'altra scena.",
      });
      const other = shotPlansSchema.parse((await client.call('GET', shots)).body);
      expect(other.scenes[0]?.flags[shot.id]).toBeUndefined();
    }

    await client.call('PUT', `/projects/${film.id}/moodboard`, {
      sceneId: shot.sceneId,
      palette: [{ hex: '#111111' }],
      notes: 'Questa scena.',
    });
    const mine = shotPlansSchema.parse((await client.call('GET', shots)).body);
    expect(mine.scenes[0]?.flags[shot.id]?.[0]?.code).toBe('R9');
  }, 120_000);
});

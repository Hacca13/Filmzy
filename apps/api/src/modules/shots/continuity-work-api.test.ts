import {
  projectOptionsSchema,
  shotPlansSchema,
  shotStoryboardSchema,
  shotTakesSchema,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';

/**
 * R4 e R5 col server vero e il fornitore finto: si gira davvero un video, si cambia qualcosa a monte
 * dalle stesse rotte che usa l'interfaccia, e il giallo si legge dalle scene; rigirando passa.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
}, 60_000);

afterAll(async () => {
  await app.close();
});

/** Le date si contano in millisecondi: fra un passo e l'altro ne deve passare almeno uno. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

async function shoot(shotPath: string): Promise<void> {
  await client.call('POST', `${shotPath}/takes`, {});
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const { takes } = shotTakesSchema.parse((await client.call('GET', `${shotPath}/takes`)).body);
    if (takes.every((take) => take.status === 'succeeded' || take.status === 'failed')) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il take non è arrivato in tempo');
}

async function draw(shotPath: string): Promise<string> {
  await client.call('POST', `${shotPath}/storyboard`, {});
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const { attempts } = shotStoryboardSchema.parse(
      (await client.call('GET', `${shotPath}/storyboard`)).body,
    );
    const assetId = attempts[0]?.assetIds[0];
    if (attempts[0]?.status === 'succeeded' && assetId !== undefined) return assetId;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('lo storyboard non è arrivato in tempo');
}

describe('i gialli che nascono da un cambiamento a monte', () => {
  it('R5: il primo fotogramma cambiato dopo il video ingiallisce; rigirando passa', async () => {
    const { shot, shots } = await filmWithShot(client);
    const shotPath = `${shots}/${shot.id}`;
    const codes = async () =>
      (
        shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0]?.flags[shot.id] ??
        []
      ).map((flag) => flag.code);
    const assetId = await draw(shotPath);
    await shoot(shotPath);
    expect(await codes()).toEqual([]);

    await tick();
    const set = await client.call('PUT', `${shotPath}/images`, {
      images: [{ use: 'first_frame', assetId }],
    });
    expect(set.status).toBe(200);
    expect(await codes()).toEqual(['R5']);

    await tick();
    await shoot(shotPath);
    expect(await codes()).toEqual([]);
  }, 120_000);

  it('R4: la fotografia cambiata dopo il video dà un avviso leggero; sceglierla uguale no', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    const flags = async () =>
      shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0]?.flags[shot.id] ?? [];
    await shoot(`${shots}/${shot.id}`);
    await tick();

    await client.call('PATCH', `/projects/${film.id}`, { cinematography: film.cinematography });
    expect(await flags()).toEqual([]);

    const options = projectOptionsSchema.parse(
      (await client.call('GET', '/projects/options')).body,
    );
    const other = options.cinematography.find((item) => item.id !== film.cinematography);
    if (other === undefined) throw new Error('il seme deve avere due fotografie');
    const changed = await client.call('PATCH', `/projects/${film.id}`, {
      cinematography: other.id,
    });
    expect(changed.status).toBe(200);

    expect(await flags()).toEqual([
      expect.objectContaining({ code: 'R4', light: true, fix: 'regenerate', ignored: false }),
    ]);
  }, 120_000);
});

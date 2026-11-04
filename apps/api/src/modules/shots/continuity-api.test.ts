import { ROLE_OUTPUT_EXAMPLES, shotPlannerOutputSchema, shotPlansSchema } from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startAppWithFixtures, type Client } from '../../test-support/app-client.js';
import { filmWithFinal } from '../../test-support/film-with-shot.js';

/**
 * R1 dal principio alla fine (T5.1), col server vero: l'aiuto regista finto risponde come farebbe un
 * modello, il codice salva il piano e il giallo si legge dalle scene. Un cambiamento dichiarato deve
 * arrivare fin qui: è il passaggio che i test delle sole regole non vedono.
 */
let app: NestExpressApplication;
let client: Client;

const [base] = shotPlannerOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.shot_planner).shots;
if (base === undefined) throw new Error('serve un esempio con un’inquadratura');

const shotAt = (order: number, timeOfDay: string, change?: string) => ({
  ...base,
  order,
  continuity: {
    entry: { ...base.continuity.entry, timeOfDay },
    exit: { ...base.continuity.exit, timeOfDay },
    ...(change === undefined ? {} : { change }),
  },
});

beforeAll(async () => {
  ({ app, client } = await startAppWithFixtures({
    shot_planner: {
      data: {
        shots: [
          shotAt(0, 'sera'),
          // Salto dichiarato: non è un errore.
          shotAt(1, 'notte', 'Passano alcune ore.'),
          // Salto non dichiarato: è un errore.
          shotAt(2, 'alba'),
        ],
      },
    },
  }));
}, 60_000);

afterAll(async () => {
  await app.close();
});

describe('Ignora e Rimetti (T5.3)', () => {
  it('il giallo resta da leggere ma ignorato, si rimette, e una chiave che non c’è si rifiuta', async () => {
    const { shots } = await filmWithFinal(client);
    await client.call('POST', shots, { sceneNumber: 1 });
    const read = async () => {
      const scene = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
      return Object.values(scene?.flags ?? {}).flat();
    };
    const [flag] = await read();
    if (flag === undefined) throw new Error('doveva esserci un giallo');
    expect(flag).toMatchObject({ code: 'R1', fix: 'replan', ignored: false });

    const ignored = await client.call('PUT', `${shots}/flags`, { key: flag.key, ignored: true });
    expect(ignored.status).toBe(200);
    expect((await read())[0]).toMatchObject({ key: flag.key, ignored: true });

    await client.call('PUT', `${shots}/flags`, { key: flag.key, ignored: false });
    expect((await read())[0]).toMatchObject({ key: flag.key, ignored: false });

    const unknown = await client.call('PUT', `${shots}/flags`, { key: 'inventata', ignored: true });
    expect(unknown.status).toBe(409);
    // Rimettere ciò che non c'è più non è un errore: il giallo può essere passato nel frattempo.
    const gone = await client.call('PUT', `${shots}/flags`, { key: 'inventata', ignored: false });
    expect(gone.status).toBe(200);
  }, 60_000);

  it('ripensare la scena dà inquadrature nuove: il giallo torna, non ignorato', async () => {
    const { shots } = await filmWithFinal(client);
    await client.call('POST', shots, { sceneNumber: 1 });
    const first = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
    const [flag] = Object.values(first?.flags ?? {}).flat();
    if (flag === undefined) throw new Error('doveva esserci un giallo');
    await client.call('PUT', `${shots}/flags`, { key: flag.key, ignored: true });

    await client.call('POST', shots, { sceneNumber: 1 });

    const again = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
    expect(Object.values(again?.flags ?? {}).flat()[0]).toMatchObject({
      code: 'R1',
      ignored: false,
    });
  }, 60_000);
});

describe('il cambiamento dichiarato dall’aiuto regista', () => {
  it('si salva e R1 non lo segnala; quello non dichiarato sì, con il motivo', async () => {
    const { shots } = await filmWithFinal(client);

    expect((await client.call('POST', shots, { sceneNumber: 1 })).status).toBe(201);

    const scene = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
    const [first, second, third] = scene?.shots ?? [];
    expect(second?.continuity.change).toBe('Passano alcune ore.');
    expect(scene?.flags[first?.id ?? '']).toBeUndefined();
    expect(scene?.flags[second?.id ?? '']).toBeUndefined();
    expect(scene?.flags[third?.id ?? '']?.[0]).toMatchObject({ code: 'R1', light: false });
    expect(scene?.flags[third?.id ?? '']?.[0]?.reason).toContain('«notte» a «alba»');
  }, 60_000);
});

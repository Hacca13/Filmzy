import {
  connectionsOverviewSchema,
  filmEstimateSchema,
  projectOptionsSchema,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CONFIG_DIR, startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il primo avvio di chi ha appena installato (D90): il server vero, con le connessioni vere del seme e
 * **nessuna chiave**. Le altre prove usano il fornitore finto, che le chiavi non le vuole: per questo un
 * programma inutilizzabile senza chiavi era passato inosservato. Non parte nessuna richiesta ai fornitori.
 */
const KEYS = ['ANTHROPIC_API_KEY', 'FAL_KEY'] as const;
const previous = KEYS.map((name) => [name, process.env[name]] as const);

let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  for (const name of KEYS) Reflect.deleteProperty(process.env, name);
  ({ app, client } = await startApp(undefined, 'none', CONFIG_DIR));
}, 60_000);

afterAll(async () => {
  await app.close();
  for (const [name, value] of previous) {
    if (value !== undefined) process.env[name] = value;
  }
});

describe('senza nessuna chiave', () => {
  it('i fornitori si leggono, e dicono che manca la chiave', async () => {
    const reply = await client.call('GET', '/connections');

    expect(reply.status).toBe(200);
    const { groups } = connectionsOverviewSchema.parse(reply.body);
    const fal = groups.flatMap((group) => group.providers).find((p) => p.connectionId === 'fal');
    expect(fal?.key).toMatchObject({ name: 'FAL_KEY', present: false });
    expect(fal?.keyUrl).toContain('https://');
  });

  it('il modulo «La tua idea» si apre', async () => {
    const reply = await client.call('GET', '/projects/options');

    expect(reply.status).toBe(200);
    expect(projectOptionsSchema.parse(reply.body).genres.length).toBeGreaterThan(0);
  });

  it('il costo indicativo si legge lo stesso: viene dal listino, e serve a chi deve ancora decidere', async () => {
    const reply = await client.call('GET', '/projects/estimate?durationS=60');

    expect(reply.status).toBe(200);
    expect(filmEstimateSchema.parse(reply.body).available).toBe(true);
  });

  it('un film non si crea, e il motivo si può leggere', async () => {
    const options = projectOptionsSchema.parse(
      (await client.call('GET', '/projects/options')).body,
    );

    const reply = await client.call('POST', '/projects', {
      idea: 'Una storia.',
      genre: options.defaults.genre,
      tone: options.defaults.tone,
      style: options.defaults.style,
      cinematography: options.defaults.cinematography,
      durationS: 60,
    });

    // Il testo passa dal moderatore, che è un servizio: senza la sua chiave ci si ferma prima di salvare.
    expect(reply.status).toBe(409);
    expect(reply.body).toMatchObject({ code: 'secret_missing' });
  });
});

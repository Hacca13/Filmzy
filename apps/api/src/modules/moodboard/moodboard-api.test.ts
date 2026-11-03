import {
  domainErrorSchema,
  moodboardViewSchema,
  storyBibleSchema,
  type MoodboardView,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { filmWithShot } from '../../test-support/film-with-shot.js';
import { BibleService } from '../bible/bible.service.js';

/**
 * Il moodboard (T4.10, D37), col server vero: palette e consigli del film e delle scene si scrivono a
 * mano, senza moodboard il film funziona come prima, e la Bibbia lo riceve solo se c'è.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
}, 60_000);

afterAll(async () => {
  await app.close();
});

const amber = { hex: '#c2813a', name: 'Ambra' };

async function view(film: string): Promise<MoodboardView> {
  const reply = await client.call('GET', `/projects/${film}/moodboard`);
  expect(reply.status).toBe(200);
  return moodboardViewSchema.parse(reply.body);
}

const failure = (reply: { status: number; body: unknown }) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

describe('il moodboard di un film', () => {
  it("all'inizio non c'è niente: la funzione è accesa, la parte del film è vuota e le scene sono quelle della stesura", async () => {
    const { film } = await filmWithShot(client);

    const first = await view(film.id);

    expect(first.enabled).toBe(true);
    expect(first.moodboard.film).toEqual({ palette: [], notes: '', references: [] });
    expect(first.moodboard.scenes).toEqual([]);
    expect(first.scenes.length).toBeGreaterThan(0);
    expect(first.scenes[0]).toMatchObject({ sceneId: 'scene-1', number: 1 });
  }, 60_000);

  it('palette e consigli del film si salvano e si rileggono; salvarli vuoti li toglie', async () => {
    const { film } = await filmWithShot(client);
    const path = `/projects/${film.id}/moodboard`;

    const saved = await client.call('PUT', path, { palette: [amber], notes: '  Luce calda.  ' });
    expect(saved.status).toBe(200);
    expect(moodboardViewSchema.parse(saved.body).moodboard.film).toMatchObject({
      palette: [amber],
      notes: 'Luce calda.',
    });

    await client.call('PUT', path, { palette: [], notes: '' });
    expect((await view(film.id)).moodboard.film).toEqual({
      palette: [],
      notes: '',
      references: [],
    });
  }, 60_000);

  it("una scena ha la sua parte; una scena che non c'è nella stesura si rifiuta", async () => {
    const { film } = await filmWithShot(client);
    const path = `/projects/${film.id}/moodboard`;

    await client.call('PUT', path, { sceneId: 'scene-1', palette: [amber], notes: 'Notte.' });
    expect((await view(film.id)).moodboard.scenes[0]).toMatchObject({
      sceneId: 'scene-1',
      notes: 'Notte.',
    });

    const refused = failure(
      await client.call('PUT', path, { sceneId: 'scene-99', palette: [], notes: 'x' }),
    );
    expect(refused).toMatchObject({ status: 400, code: 'invalid_request' });
    expect(refused.details?.field).toBe('sceneId');
  }, 60_000);

  it("un colore sbagliato, troppi colori o un campo in più danno un errore chiaro; un film che non c'è, non trovato", async () => {
    const { film } = await filmWithShot(client);
    const path = `/projects/${film.id}/moodboard`;
    const many = Array.from({ length: 9 }, () => amber);

    for (const body of [
      { palette: [{ hex: 'rosso' }], notes: '' },
      { palette: many, notes: '' },
      { palette: [], notes: '', altro: 1 },
    ]) {
      expect(failure(await client.call('PUT', path, body)).status).toBe(400);
    }
    expect(failure(await client.call('GET', '/projects/non-esiste/moodboard')).status).toBe(404);
    expect(
      failure(
        await client.call('PUT', '/projects/non-esiste/moodboard', { palette: [], notes: '' }),
      ).status,
    ).toBe(404);
  }, 60_000);

  it("la Bibbia lo riceve solo se c'è, e solo come testo", async () => {
    const { film } = await filmWithShot(client);
    const bibles = app.get(BibleService);
    expect(storyBibleSchema.parse(await bibles.assemble(film.id)).moodboard).toBeUndefined();

    await client.call('PUT', `/projects/${film.id}/moodboard`, {
      palette: [amber],
      notes: 'Luce calda.',
    });

    expect((await bibles.assemble(film.id)).moodboard).toEqual({
      palette: [amber],
      notes: 'Luce calda.',
      referenceDescriptions: [],
    });
  }, 60_000);
});

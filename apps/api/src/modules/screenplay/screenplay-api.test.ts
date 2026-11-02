import {
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  screenplayEstimateSchema,
  screenplayVersionSchema,
  screenplayVersionsSchema,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Il giro della bozza (T3.4), col server vero e il fornitore finto: si crea un film, si scrive la
 * bozza, si chiede una modifica e si rilegge la versione di prima. Nessuna spesa vera.
 */
let app: NestExpressApplication;
let client: Client;
let receipts: ReceiptStore;

beforeAll(async () => {
  ({ app, client } = await startApp());
  receipts = app.get<ReceiptStore>(RECEIPT_STORE);
});

afterAll(async () => {
  await app.close();
});

async function newFilm() {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  const reply = await client.call('POST', '/projects', {
    idea: 'Una bobina dimenticata sull’ultimo treno della sera.',
    genre: options.defaults.genre,
    tone: options.defaults.tone,
    style: options.defaults.style,
    cinematography: options.defaults.cinematography,
    durationS: 60,
  });
  expect(reply.status).toBe(201);
  return projectSchema.parse(reply.body);
}

const base = (filmId: string) => `/projects/${filmId}/screenplay`;

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

describe('la bozza della sceneggiatura', () => {
  it('prima di scriverla non c’è: né l’ultima versione né un elenco', async () => {
    const film = await newFilm();

    expect(failure(await client.call('GET', base(film.id)))).toMatchObject({
      status: 404,
      code: 'not_found',
    });
    const versions = await client.call('GET', `${base(film.id)}/versions`);
    expect(screenplayVersionsSchema.parse(versions.body).versions).toEqual([]);
  });

  it('la stima dice quanto costerebbe, senza scrivere niente', async () => {
    const film = await newFilm();

    const reply = await client.call('POST', `${base(film.id)}/estimate`, { mode: 'draft' });
    const { estimate } = screenplayEstimateSchema.parse(reply.body);

    expect(reply.status).toBe(201);
    expect(estimate.modelLabel).not.toBe('');
    expect(estimate.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect((await client.call('GET', base(film.id))).status).toBe(404);
  });

  it('la bozza ha scene riassunte e proposte di personaggi e luoghi, e lascia lo scontrino', async () => {
    const film = await newFilm();

    const reply = await client.call('POST', `${base(film.id)}/draft`, {});
    const version = screenplayVersionSchema.parse(reply.body);

    expect(reply.status).toBe(201);
    expect(version).toMatchObject({ projectId: film.id, stage: 'draft', version: 1 });
    expect(version.screenplay.scenes.length).toBeGreaterThan(0);
    expect(version.screenplay.scenes.every((scene) => scene.summary !== '')).toBe(true);
    expect(version.screenplay.characters.length).toBeGreaterThan(0);
    expect(version.screenplay.locations.length).toBeGreaterThan(0);
    // Lo scontrino della chiamata è nel database e dice per quale film si è scritto.
    const receipt = receipts.get(version.generationId ?? '');
    expect(receipt).toMatchObject({ role: 'screenwriter', purpose: 'product', projectId: film.id });
  });

  it('ogni richiesta di modifica crea una versione nuova e la precedente resta consultabile', async () => {
    const film = await newFilm();
    const first = screenplayVersionSchema.parse(
      (await client.call('POST', `${base(film.id)}/draft`, {})).body,
    ).version;
    expect(first).toBe(1);

    const revised = await client.call('POST', `${base(film.id)}/revise`, {
      request: 'Rendila più cupa, con un finale aperto.',
    });
    const second = screenplayVersionSchema.parse(revised.body);

    expect(revised.status).toBe(201);
    expect(second).toMatchObject({
      version: 2,
      request: 'Rendila più cupa, con un finale aperto.',
    });

    const list = screenplayVersionsSchema.parse(
      (await client.call('GET', `${base(film.id)}/versions`)).body,
    ).versions;
    expect(list.map((item) => item.version)).toEqual([2, 1]);

    const oldId = list[1]?.id ?? '';
    const old = screenplayVersionSchema.parse(
      (await client.call('GET', `${base(film.id)}/versions/${oldId}`)).body,
    );
    expect(old.version).toBe(1);
    expect(old.request).toBeUndefined();

    const latest = screenplayVersionSchema.parse((await client.call('GET', base(film.id))).body);
    expect(latest.id).toBe(second.id);
  });

  it('una modifica senza bozza, o vuota, si rifiuta senza cambiare niente', async () => {
    const film = await newFilm();

    const noDraft = failure(
      await client.call('POST', `${base(film.id)}/revise`, { request: 'Più breve' }),
    );
    expect(noDraft).toMatchObject({ status: 404, details: { field: 'draft' } });

    await client.call('POST', `${base(film.id)}/draft`, {});
    const empty = failure(await client.call('POST', `${base(film.id)}/revise`, { request: '   ' }));
    expect(empty).toMatchObject({ status: 400, code: 'invalid_request' });
    const versions = await client.call('GET', `${base(film.id)}/versions`);
    expect(screenplayVersionsSchema.parse(versions.body).versions).toHaveLength(1);
  });

  it('un film che non c’è e una versione di un altro film danno «non trovato»', async () => {
    const film = await newFilm();
    const other = await newFilm();
    const version = screenplayVersionSchema.parse(
      (await client.call('POST', `${base(film.id)}/draft`, {})).body,
    );

    expect((await client.call('POST', '/projects/non-c-e/screenplay/draft', {})).status).toBe(404);
    expect((await client.call('GET', `${base(other.id)}/versions/${version.id}`)).status).toBe(404);
  });
});

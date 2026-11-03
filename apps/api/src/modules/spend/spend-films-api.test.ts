import {
  domainErrorSchema,
  filmSpendSchema,
  projectOptionsSchema,
  projectSchema,
  spendOverviewSchema,
  type GenerationReceipt,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * «Quanto ho speso» (T4.7), col server vero: gli scontrini di un film si dividono per ruolo e per
 * servizio, e i totali sono gli stessi della spesa del mese. Gli scontrini si scrivono a mano nel
 * database: nessuna chiamata, nessuna spesa vera (regola 5).
 */
let app: NestExpressApplication;
let client: Client;
let receipts: ReceiptStore;
let counter = 0;

beforeAll(async () => {
  ({ app, client } = await startApp());
  receipts = app.get<ReceiptStore>(RECEIPT_STORE);
});

afterAll(async () => {
  await app.close();
});

async function newFilm(title: string) {
  const options = projectOptionsSchema.parse((await client.call('GET', '/projects/options')).body);
  const film = projectSchema.parse(
    (
      await client.call('POST', '/projects', {
        idea: `${title}: una storia breve.`,
        genre: options.defaults.genre,
        tone: options.defaults.tone,
        style: options.defaults.style,
        cinematography: options.defaults.cinematography,
        durationS: 60,
      })
    ).body,
  );
  return film;
}

async function receipt(extra: Partial<GenerationReceipt>) {
  counter += 1;
  await receipts.write({
    id: `spesa-${String(counter)}`,
    role: 'camera_operator',
    purpose: 'product',
    releaseId: 'r',
    roleConfigHash: 'h',
    modelId: 'kling-o3-standard',
    modelLabel: 'Kling',
    connectionId: 'fal',
    providerModel: 'kling',
    inputHash: `in-${String(counter)}`,
    idempotencyKey: `key-${String(counter)}`,
    status: 'succeeded',
    attempts: 1,
    estimatedCostUsd: 1,
    actualCostUsd: 1,
    createdAt: new Date().toISOString(),
    ...extra,
  });
}

const filmSpend = async (id: string) => {
  const reply = await client.call('GET', `/spend/films/${id}`);
  expect(reply.status).toBe(200);
  return filmSpendSchema.parse(reply.body);
};

describe('quanto è costato un film', () => {
  it('un film senza scontrini costa zero e non ha righe', async () => {
    const film = await newFilm('Vuoto');

    expect(await filmSpend(film.id)).toMatchObject({
      projectId: film.id,
      title: film.title,
      totalUsd: 0,
      monthUsd: 0,
      roles: [],
      services: [],
    });
  });

  it('divide la spesa per ruolo e per servizio, con i nomi della configurazione', async () => {
    const film = await newFilm('Diviso');
    await receipt({ projectId: film.id, actualCostUsd: 6 });
    await receipt({ projectId: film.id, actualCostUsd: 2 });
    await receipt({
      projectId: film.id,
      role: 'screenwriter',
      modelId: 'claude-sonnet',
      connectionId: 'anthropic',
      actualCostUsd: 0.5,
    });

    const spent = await filmSpend(film.id);

    expect(spent.totalUsd).toBeCloseTo(8.5);
    expect(spent.monthUsd).toBeCloseTo(8.5);
    expect(spent.roles.map((role) => [role.role, role.spentUsd, role.calls])).toEqual([
      ['camera_operator', 8, 2],
      ['screenwriter', 0.5, 1],
    ]);
    // I nomi sono quelli del seme, non gli id: l'utente non vede id tecnici.
    expect(spent.roles[0]?.label).not.toBe('camera_operator');
    expect(spent.services).toHaveLength(2);
    expect(
      spent.services.every((service) => service.label !== '' && service.providerLabel !== ''),
    ).toBe(true);
  });

  it('una chiamata fallita non spende e non conta; la spesa di un altro film non entra', async () => {
    const film = await newFilm('Con errori');
    const other = await newFilm('Altro');
    await receipt({ projectId: film.id, actualCostUsd: 3 });
    await receipt({ projectId: film.id, status: 'failed', actualCostUsd: undefined });
    await receipt({ projectId: other.id, actualCostUsd: 40 });

    const spent = await filmSpend(film.id);

    expect(spent.totalUsd).toBe(3);
    expect(spent.roles).toEqual([expect.objectContaining({ spentUsd: 3, calls: 1 })]);
  });

  it('la parte del mese lascia fuori gli scontrini dei mesi scorsi', async () => {
    const film = await newFilm('Vecchio');
    await receipt({ projectId: film.id, actualCostUsd: 5, createdAt: '2020-01-15T10:00:00.000Z' });
    await receipt({ projectId: film.id, actualCostUsd: 2 });

    const spent = await filmSpend(film.id);

    expect(spent.totalUsd).toBe(7);
    expect(spent.monthUsd).toBe(2);
  });

  it('un film che non c’è dà «non trovato»', async () => {
    const reply = await client.call('GET', '/spend/films/non-esiste');

    expect(reply.status).toBe(404);
    expect(domainErrorSchema.parse(reply.body).code).toBe('not_found');
  });
});

describe('l’elenco dei film nella spesa', () => {
  it('ha i titoli, la spesa del mese e quanti film hanno speso, e i totali tornano', async () => {
    const film = await newFilm('Nell’elenco');
    await receipt({ projectId: film.id, actualCostUsd: 4 });
    await receipt({ projectId: film.id, actualCostUsd: 9, createdAt: '2020-02-01T10:00:00.000Z' });

    const overview = spendOverviewSchema.parse((await client.call('GET', '/spend')).body);
    const line = overview.films.find((candidate) => candidate.projectId === film.id);

    expect(line).toEqual({ projectId: film.id, title: film.title, spentUsd: 13, monthUsd: 4 });
    expect(overview.filmsMonth).toBe(overview.films.filter((item) => item.monthUsd > 0).length);
    expect(overview.servicesMonth).toBeGreaterThan(0);
    // I film che spendono nel mese stanno prima di quelli che non hanno speso.
    const months = overview.films.map((item) => item.monthUsd);
    expect(months).toEqual([...months].sort((a, b) => b - a));
  });
});

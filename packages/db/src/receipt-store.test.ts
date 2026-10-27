import type { GenerationReceipt } from '@filmzy/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createReceiptStore, type ReceiptStore } from './receipt-store.js';
import { generations } from './schema.js';
import { tempDataDir } from './test.fixtures.js';

function receipt(extra: Partial<GenerationReceipt> = {}): GenerationReceipt {
  return {
    id: 'g-1',
    role: 'screenwriter',
    purpose: 'draft_test',
    releaseId: 'bozza',
    roleConfigHash: 'abc',
    modelId: 'finto',
    modelLabel: 'Finto',
    connectionId: 'fake',
    providerModel: 'finto-1',
    inputHash: 'in',
    idempotencyKey: 'key',
    status: 'queued',
    attempts: 1,
    estimatedCostUsd: 0.004,
    createdAt: '2026-10-27T10:00:00.000Z',
    ...extra,
  };
}

let aperto: OpenedDatabase;
let store: ReceiptStore;

beforeEach(async () => {
  aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createReceiptStore(aperto.db);
  return () => {
    aperto.close();
  };
});

describe('scontrini nel database', () => {
  it('uno scontrino scritto si rilegge uguale', async () => {
    await store.write(receipt());

    expect(store.get('g-1')).toEqual(receipt());
  });

  it('lo stesso scontrino riscritto lungo la sua vita resta una riga sola', async () => {
    await store.write(receipt());
    await store.write(receipt({ status: 'running' }));
    await store.write(receipt({ status: 'succeeded', actualCostUsd: 0.0031, durationMs: 800 }));

    expect(aperto.db.select().from(generations).all()).toHaveLength(1);
    expect(store.get('g-1')).toMatchObject({ status: 'succeeded', actualCostUsd: 0.0031 });
  });

  it('il momento della richiesta non cambia quando lo scontrino si aggiorna', async () => {
    await store.write(receipt());
    await store.write(
      receipt({ status: 'failed', errorCode: 'timeout', createdAt: '2030-01-01T00:00:00.000Z' }),
    );

    expect(aperto.db.select().from(generations).all()[0]?.createdAt).toBe(
      new Date('2026-10-27T10:00:00.000Z').getTime(),
    );
  });

  it('anche uno scontrino fallito resta, col suo motivo', async () => {
    await store.write(receipt({ status: 'failed', errorCode: 'content_rejected' }));

    expect(store.get('g-1')).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
  });

  it("l'elenco ha i più recenti per primi e si può filtrare per scopo", async () => {
    await store.write(receipt({ id: 'a', createdAt: '2026-10-27T09:00:00.000Z' }));
    await store.write(
      receipt({ id: 'b', createdAt: '2026-10-27T11:00:00.000Z', purpose: 'product' }),
    );
    await store.write(receipt({ id: 'c', createdAt: '2026-10-27T10:00:00.000Z' }));

    expect(store.list().map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
    expect(store.list({ purpose: 'draft_test' }).map((entry) => entry.id)).toEqual(['c', 'a']);
    expect(store.list({ limit: 1 })).toHaveLength(1);
  });

  it("una riga rovinata si salta e non rompe l'elenco", async () => {
    await store.write(receipt({ id: 'buono' }));
    aperto.db
      .insert(generations)
      .values({
        id: 'rotto',
        purpose: 'draft_test',
        role: 'screenwriter',
        modelId: 'finto',
        status: 'queued',
        estimatedCostUsd: 0,
        createdAt: Date.now() + 1000,
        receipt: '{non è json',
      })
      .run();

    expect(store.get('rotto')).toBeUndefined();
    expect(store.list().map((entry) => entry.id)).toEqual(['buono']);
  });
});

describe('spesa dagli scontrini (D30)', () => {
  const month = new Date('2026-10-01T00:00:00.000Z');

  function at(day: string, extra: Partial<GenerationReceipt>): GenerationReceipt {
    return receipt({ createdAt: `2026-${day}T10:00:00.000Z`, ...extra });
  }

  it("somma il mese per fornitore: il costo vero se c'è, altrimenti la stima", async () => {
    await store.write(
      at('10-05', {
        id: 'a',
        connectionId: 'fal',
        status: 'succeeded',
        estimatedCostUsd: 1,
        actualCostUsd: 0.8,
      }),
    );
    await store.write(
      at('10-06', { id: 'b', connectionId: 'fal', status: 'running', estimatedCostUsd: 0.5 }),
    );
    await store.write(
      at('10-07', {
        id: 'c',
        connectionId: 'anthropic',
        status: 'succeeded',
        estimatedCostUsd: 0.01,
        actualCostUsd: 0.004,
      }),
    );
    // Costo vero non noto: vale la stima.
    await store.write(
      at('10-08', { id: 'd', connectionId: 'fal', status: 'succeeded', estimatedCostUsd: 2 }),
    );

    const spent = store.spentByConnectionSince(month);

    expect(spent.fal).toBeCloseTo(3.3);
    expect(spent.anthropic).toBeCloseTo(0.004);
  });

  it('una chiamata fallita non ha speso niente, a meno che il fornitore non dica il contrario', async () => {
    await store.write(
      at('10-05', {
        id: 'a',
        connectionId: 'fal',
        status: 'failed',
        estimatedCostUsd: 3,
        errorCode: 'timeout',
      }),
    );
    await store.write(
      at('10-05', {
        id: 'b',
        connectionId: 'fal',
        status: 'failed',
        estimatedCostUsd: 3,
        actualCostUsd: 0.2,
        errorCode: 'invalid_output',
      }),
    );

    expect(store.spentByConnectionSince(month).fal).toBeCloseTo(0.2);
  });

  it('conta solo da quando si chiede: il mese scorso non entra', async () => {
    await store.write(
      at('09-30', { id: 'vecchio', connectionId: 'fal', status: 'succeeded', actualCostUsd: 9 }),
    );
    await store.write(
      at('10-02', { id: 'nuovo', connectionId: 'fal', status: 'succeeded', actualCostUsd: 1 }),
    );

    expect(store.spentByConnectionSince(month)).toEqual({ fal: 1 });
  });

  it('una chiamata riscritta lungo la sua vita si conta una volta sola (regola 10)', async () => {
    const base = { id: 'x', connectionId: 'fal', estimatedCostUsd: 2 } as const;
    await store.write(at('10-05', { ...base, status: 'queued' }));
    await store.write(at('10-05', { ...base, status: 'running' }));
    await store.write(at('10-05', { ...base, status: 'succeeded', actualCostUsd: 1.5 }));

    expect(store.spentByConnectionSince(month).fal).toBeCloseTo(1.5);
  });

  it('per film: quanto si è speso su uno, e su ognuno', async () => {
    await store.write(
      at('10-05', { id: 'a', projectId: 'film-1', status: 'succeeded', actualCostUsd: 2 }),
    );
    await store.write(
      at('10-06', { id: 'b', projectId: 'film-1', status: 'succeeded', actualCostUsd: 1 }),
    );
    await store.write(
      at('10-07', { id: 'c', projectId: 'film-2', status: 'succeeded', actualCostUsd: 4 }),
    );
    // Senza film (una prova della bozza, per esempio): conta per il fornitore, non per un film.
    await store.write(at('10-08', { id: 'd', status: 'succeeded', actualCostUsd: 7 }));

    expect(store.spentOnProject('film-1')).toBeCloseTo(3);
    expect(store.spentOnProject('film-inesistente')).toBe(0);
    expect(store.spentByProject()).toEqual({ 'film-1': 3, 'film-2': 4 });
  });

  it('senza scontrini la spesa è zero, non un errore', () => {
    expect(store.spentByConnectionSince(month)).toEqual({});
    expect(store.spentByProject()).toEqual({});
  });
});

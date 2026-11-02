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

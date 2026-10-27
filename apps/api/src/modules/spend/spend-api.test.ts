import {
  connectionsOverviewSchema,
  domainErrorSchema,
  draftTestResultSchema,
  spendOverviewSchema,
  type ProviderSpend,
} from '@filmzy/contracts';
import type { ReceiptStore } from '@filmzy/db';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';
import { RECEIPT_STORE } from '../troupe/tokens.js';

/**
 * Il giro dei limiti di spesa, col server vero e il fornitore finto (nessuna spesa vera, regola 5):
 * si prova un ruolo, si accende un limite, la prova successiva chiede conferma, e con «prosegui»
 * passa. La spesa viene dagli scontrini che le prove lasciano nel database.
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

async function spend() {
  const reply = await client.call('GET', '/spend');
  expect(reply.status).toBe(200);
  return spendOverviewSchema.parse(reply.body);
}

async function provider(id: string): Promise<ProviderSpend> {
  const found = (await spend()).providers.find((candidate) => candidate.connectionId === id);
  if (found === undefined) throw new Error(`manca il fornitore ${id}`);
  return found;
}

const run = (body?: unknown) => client.call('POST', '/troupe/test/cinematographer/run', body);

describe('limiti di spesa (T3.1)', () => {
  it("all'inizio non si è speso niente e nessun fornitore ha un limite", async () => {
    const overview = await spend();

    expect(overview.totalMonthUsd).toBe(0);
    expect(overview.films).toEqual([]);
    expect(overview.providers.every((p) => p.level === 'none' && p.spentUsd === 0)).toBe(true);
  });

  it('senza limiti una prova passa e la spesa si vede, dagli scontrini', async () => {
    const reply = await run();
    const receipt = draftTestResultSchema.parse(reply.body).receipt;

    expect(reply.status).toBe(200);
    const anthropic = await provider('anthropic');
    expect(anthropic.spentUsd).toBeCloseTo(receipt.actualCostUsd ?? 0);
    expect(anthropic.spentUsd).toBeGreaterThan(0);
  });

  describe('«chiedi conferma sopra una cifra»', () => {
    it('si accende, e una prova che la supera chiede conferma senza spendere né lasciare uno scontrino', async () => {
      const set = await client.call('PUT', '/limits/confirm-above', { usd: 0.0000001 });
      expect(connectionsOverviewSchema.parse(set.body).limits.confirmAboveUsd).toBe(0.0000001);
      const before = receipts.list().length;

      const reply = await run();

      expect(reply.status).toBe(409);
      expect(domainErrorSchema.parse(reply.body)).toMatchObject({
        code: 'spend_cap_reached',
        retryable: false,
        details: {
          connectionId: 'anthropic',
          spend: { limit: 'confirm_above', limitUsd: 0.0000001 },
        },
      });
      expect(receipts.list()).toHaveLength(before);
    });

    it('con «prosegui» la stessa prova passa, e costa davvero', async () => {
      const before = (await provider('anthropic')).spentUsd;

      const reply = await run({ spendConfirmed: true });

      expect(reply.status).toBe(200);
      expect((await provider('anthropic')).spentUsd).toBeGreaterThan(before);
    });

    it('si spegne, e non blocca più niente', async () => {
      await client.call('PUT', '/limits/confirm-above', { usd: null });

      expect((await run()).status).toBe(200);
    });
  });

  describe('limite mensile di un fornitore', () => {
    it('quando la spesa lo raggiunge lo dice (100%), e la prova dopo chiede conferma', async () => {
      const spent = (await provider('anthropic')).spentUsd;
      await client.call('PUT', '/connections/anthropic/monthly-cap', { usd: spent });

      const anthropic = await provider('anthropic');
      expect(anthropic).toMatchObject({ capUsd: spent, level: 'reached' });
      expect(anthropic.percent).toBeCloseTo(100);

      const reply = await run();
      expect(reply.status).toBe(409);
      expect(domainErrorSchema.parse(reply.body).details?.spend).toMatchObject({
        limit: 'monthly_cap',
        limitUsd: spent,
      });
      expect(domainErrorSchema.parse(reply.body).details?.spend?.spentUsd).toBeCloseTo(spent);
    });

    it('alzarlo fa ripartire, e il livello torna a posto', async () => {
      const spent = (await provider('anthropic')).spentUsd;
      await client.call('PUT', '/connections/anthropic/monthly-cap', { usd: spent * 100 });

      expect((await run()).status).toBe(200);
      expect((await provider('anthropic')).level).toBe('ok');
    });

    it('toglierlo riporta a «nessun limite»', async () => {
      await client.call('PUT', '/connections/anthropic/monthly-cap', { usd: null });

      expect(await provider('anthropic')).toMatchObject({ level: 'none' });
    });
  });

  it('un limite sotto lo zero o nullo non esiste', async () => {
    expect((await client.call('PUT', '/limits/confirm-above', { usd: 0 })).status).toBe(400);
    expect((await client.call('PUT', '/limits/film-budget', { usd: -5 })).status).toBe(400);
  });
});

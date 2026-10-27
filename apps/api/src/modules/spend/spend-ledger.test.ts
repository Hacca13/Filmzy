import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GenerationReceipt, UserSettings } from '@filmzy/contracts';
import {
  createReceiptStore,
  openFilmzyDatabase,
  type OpenedDatabase,
  type ReceiptStore,
} from '@filmzy/db';
import { loadConfigFiles, type ConfigSource, type TroupeConfig } from '@filmzy/troupe';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SpendLedger } from './spend-ledger.js';

const CONFIG_DIR = fileURLToPath(new URL('../../../../../config', import.meta.url));

let seed: TroupeConfig;

beforeAll(async () => {
  const { config } = await loadConfigFiles(CONFIG_DIR);
  if (config === undefined) throw new Error('il seme non si è caricato');
  seed = config;
});

const NOW = new Date(2026, 9, 28, 12, 0, 0); // 28 ottobre 2026, ora locale

let opened: OpenedDatabase;
let receipts: ReceiptStore;
let current: { config: TroupeConfig; settings?: UserSettings };

beforeEach(async () => {
  opened = await openFilmzyDatabase({
    dataDir: await mkdtemp(path.join(tmpdir(), 'filmzy-spesa-')),
    appVersion: '0.0.0-test',
  });
  receipts = createReceiptStore(opened.db);
  current = { config: structuredClone(seed) };
});

afterEach(() => {
  opened.close();
});

function ledger(): SpendLedger {
  const configSource: ConfigSource = {
    load: () =>
      Promise.resolve({
        config: current.config,
        ...(current.settings === undefined ? {} : { settings: current.settings }),
        origin: 'test',
        releaseId: 'test',
        issues: [],
      }),
  };
  return new SpendLedger({ receipts, configSource, now: () => NOW });
}

function settings(spendCaps: UserSettings['spendCaps']): UserSettings {
  return {
    enabledModelIds: [],
    defaultModels: {},
    defaultModelByConnection: {},
    spendCaps,
    roleSettings: {},
  };
}

let counter = 0;

async function spend(
  amount: number,
  extra: Partial<GenerationReceipt> & { when?: Date } = {},
): Promise<void> {
  const { when = new Date(2026, 9, 10, 9, 0, 0), ...rest } = extra;
  counter += 1;
  await receipts.write({
    id: `g-${String(counter)}`,
    role: 'camera_operator',
    purpose: 'product',
    releaseId: 'r',
    roleConfigHash: 'h',
    modelId: 'kling-o3-standard',
    modelLabel: 'Kling',
    connectionId: 'fal',
    providerModel: 'x',
    inputHash: 'i',
    idempotencyKey: `k-${String(counter)}`,
    status: 'succeeded',
    attempts: 1,
    estimatedCostUsd: amount,
    actualCostUsd: amount,
    createdAt: when.toISOString(),
    ...rest,
  });
}

const call = { connectionId: 'fal', modelId: 'kling-o3-standard', estimatedCostUsd: 1 };

describe('senza nessun limite', () => {
  it('non si blocca niente, per quanto si sia speso (D36: nessun limite è preimpostato)', async () => {
    await spend(500);

    expect(
      await ledger().check({ ...call, projectId: 'film-1', estimatedCostUsd: 100 }),
    ).toBeUndefined();
  });

  it('si vede solo la spesa, e nessun fornitore ha un livello', async () => {
    await spend(3);

    const overview = await ledger().overview();

    expect(overview?.providers.find((p) => p.connectionId === 'fal')).toMatchObject({
      spentUsd: 3,
      level: 'none',
    });
    expect(overview?.providers.every((p) => p.capUsd === undefined)).toBe(true);
  });
});

describe('limite mensile di un fornitore', () => {
  beforeEach(() => {
    current.settings = settings({ monthlyByConnection: { fal: 5 } });
  });

  it('chiede conferma se la spesa del mese più la stima lo supera', async () => {
    await spend(4.5);

    expect(await ledger().check({ ...call, estimatedCostUsd: 0.6 })).toEqual({
      limit: 'monthly_cap',
      limitUsd: 5,
      spentUsd: 4.5,
      estimatedUsd: 0.6,
    });
  });

  it('arrivare esattamente al limite non lo supera', async () => {
    await spend(4);

    expect(await ledger().check({ ...call, estimatedCostUsd: 1 })).toBeUndefined();
  });

  it('conta solo il mese corrente, e solo quel fornitore', async () => {
    await spend(100, { when: new Date(2026, 8, 30, 23, 0, 0) });
    await spend(100, { connectionId: 'anthropic' });

    expect(await ledger().check({ ...call, estimatedCostUsd: 4 })).toBeUndefined();
  });

  it('un altro fornitore senza limite non si blocca', async () => {
    await spend(100, { connectionId: 'anthropic' });

    expect(await ledger().check({ ...call, connectionId: 'anthropic' })).toBeUndefined();
  });

  it("il valore scritto nella release vale finché l'utente non ne sceglie un altro", async () => {
    current.settings = undefined;
    const fal = current.config.connections.fal;
    if (fal === undefined) throw new Error('il seme non ha fal');
    fal.monthly_cap_usd = 2;
    await spend(1.5);

    expect((await ledger().check({ ...call, estimatedCostUsd: 1 }))?.limitUsd).toBe(2);

    current.settings = settings({ monthlyByConnection: { fal: 50 } });
    expect(await ledger().check({ ...call, estimatedCostUsd: 1 })).toBeUndefined();
  });
});

describe('limite per film', () => {
  beforeEach(() => {
    current.settings = settings({ filmBudgetUsd: 10 });
  });

  it('si applica ai film: la spesa del film più la stima', async () => {
    await spend(9.5, { projectId: 'film-1' });

    expect(await ledger().check({ ...call, projectId: 'film-1', estimatedCostUsd: 1 })).toEqual({
      limit: 'film_budget',
      limitUsd: 10,
      spentUsd: 9.5,
      estimatedUsd: 1,
    });
  });

  it("un altro film non c'entra, e una chiamata senza film (una prova) non ha un film da contare", async () => {
    await spend(9.5, { projectId: 'film-1' });

    expect(await ledger().check({ ...call, projectId: 'film-2' })).toBeUndefined();
    expect(await ledger().check({ ...call })).toBeUndefined();
  });

  it('conta anche i mesi passati: il film è uno solo', async () => {
    await spend(9.5, { projectId: 'film-1', when: new Date(2026, 5, 1) });

    expect((await ledger().check({ ...call, projectId: 'film-1' }))?.limit).toBe('film_budget');
  });
});

describe('chiedi conferma sopra una cifra', () => {
  it('guarda la stima della singola generazione, non quanto già speso', async () => {
    current.settings = settings({ confirmAboveUsd: 2 });
    await spend(1000);

    expect(await ledger().check({ ...call, estimatedCostUsd: 2 })).toBeUndefined();
    expect(await ledger().check({ ...call, estimatedCostUsd: 2.5 })).toEqual({
      limit: 'confirm_above',
      limitUsd: 2,
      spentUsd: 0,
      estimatedUsd: 2.5,
    });
  });
});

describe('più limiti insieme', () => {
  it('dice prima il mensile, poi il film, poi la soglia', async () => {
    current.settings = settings({
      monthlyByConnection: { fal: 1 },
      filmBudgetUsd: 1,
      confirmAboveUsd: 0.1,
    });
    await spend(0.9, { projectId: 'film-1' });
    const big = { ...call, projectId: 'film-1', estimatedCostUsd: 0.5 };

    expect((await ledger().check(big))?.limit).toBe('monthly_cap');

    current.settings = settings({ filmBudgetUsd: 1, confirmAboveUsd: 0.1 });
    expect((await ledger().check(big))?.limit).toBe('film_budget');

    current.settings = settings({ confirmAboveUsd: 0.1 });
    expect((await ledger().check(big))?.limit).toBe('confirm_above');
  });
});

describe('panoramica', () => {
  beforeEach(() => {
    current.settings = settings({ monthlyByConnection: { fal: 10 } });
  });

  it.each([
    [7.9, 'ok'],
    [8, 'warning'],
    [9.99, 'warning'],
    [10, 'reached'],
    [12, 'reached'],
  ] as const)('con %f $ su 10 il livello è %s', async (amount, level) => {
    await spend(amount);

    const fal = (await ledger().overview())?.providers.find((p) => p.connectionId === 'fal');

    expect(fal?.level).toBe(level);
    expect(fal?.capUsd).toBe(10);
    expect(fal?.percent).toBeCloseTo((amount / 10) * 100, 1);
  });

  it("dà l'inizio del mese, il totale e i film dal più caro", async () => {
    await spend(2, { projectId: 'film-1' });
    await spend(5, { projectId: 'film-2' });
    await spend(1, { connectionId: 'anthropic' });

    const overview = await ledger().overview();

    expect(new Date(overview?.monthStart ?? '').getTime()).toBe(new Date(2026, 9, 1).getTime());
    expect(overview?.totalMonthUsd).toBeCloseTo(8);
    expect(overview?.films).toEqual([
      { projectId: 'film-2', spentUsd: 5 },
      { projectId: 'film-1', spentUsd: 2 },
    ]);
  });

  it('un fornitore spento senza spesa non si mostra; uno sparito ma con spesa sì', async () => {
    const eleven = current.config.connections.elevenlabs;
    if (eleven === undefined) throw new Error('il seme non ha elevenlabs');
    eleven.enabled = false;
    await spend(0.7, { connectionId: 'vecchio-fornitore' });

    const ids = (await ledger().overview())?.providers.map((p) => p.connectionId) ?? [];

    expect(ids).not.toContain('elevenlabs');
    expect(ids).toContain('vecchio-fornitore');
  });

  it('i limiti che non sono di un fornitore si vedono', async () => {
    current.settings = settings({ filmBudgetUsd: 20, confirmAboveUsd: 3 });

    const overview = await ledger().overview();

    expect(overview).toMatchObject({ filmBudgetUsd: 20, confirmAboveUsd: 3 });
  });
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROLE_INPUT_EXAMPLES, type GenerationContext, type SpendBreach } from '@filmzy/contracts';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { ConfigSource, LoadedConfig } from './config/source.js';
import { applyEnvironmentOverlay, loadEnvironmentOverlay } from './config/environments.js';
import type { TroupeConfig } from './config/load-files.js';
import { loadSeedConfig, SEED_CONFIG_DIR } from './config/seed.fixtures.js';
import { FileInstructionsSource } from './instructions/resolve.js';
import { MemoryReceiptSink } from './receipts.js';
import { enforceSpend, type SpendCheckInput, type SpendGuard } from './spend.js';
import { createTroupe } from './troupe.js';

const FIXTURES = fileURLToPath(new URL('../test/fixtures', import.meta.url));
const INSTRUCTIONS = new FileInstructionsSource(path.join(SEED_CONFIG_DIR, 'ai', 'instructions'));

let offline: TroupeConfig;

beforeAll(async () => {
  const seed = await loadSeedConfig();
  const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
  offline = applyEnvironmentOverlay(seed, overlay ?? {}).config;
});

function source(): ConfigSource {
  return {
    load: (): Promise<LoadedConfig> =>
      Promise.resolve({
        config: {
          ...offline,
          connections: Object.fromEntries(
            Object.entries(offline.connections).map(([id, connection]) => [
              id,
              { ...connection, fixtures: FIXTURES },
            ]),
          ),
        },
        origin: 'test',
        releaseId: 'test',
        issues: [],
      }),
  };
}

const breach: SpendBreach = {
  limit: 'monthly_cap',
  limitUsd: 5,
  spentUsd: 4.99,
  estimatedUsd: 0.02,
};

/** Un guardiano che ricorda cosa gli si è chiesto. */
function guard(result: SpendBreach | undefined) {
  const seen: SpendCheckInput[] = [];
  const spend: SpendGuard = {
    check: (input) => {
      seen.push(input);
      return Promise.resolve(result);
    },
  };
  return { spend, seen };
}

function troupeWith(spend: SpendGuard | undefined) {
  const receipts = new MemoryReceiptSink();
  const troupe = createTroupe({
    configSource: source(),
    instructions: INSTRUCTIONS,
    receiptSink: receipts,
    ...(spend === undefined ? {} : { spend }),
    sleep: () => Promise.resolve(),
  });
  return { troupe, receipts };
}

const ctx: GenerationContext = { purpose: 'product', projectId: 'film-1' };
const input = ROLE_INPUT_EXAMPLES.cinematographer as never;

describe('enforceSpend', () => {
  it("senza guardiano, o con l'utente che ha detto di proseguire, non chiede niente", async () => {
    const { spend, seen } = guard(breach);
    const base = { role: 'r', connectionId: 'c', modelId: 'm', estimatedCostUsd: 1 };

    await expect(enforceSpend(undefined, ctx, base)).resolves.toBeUndefined();
    await expect(
      enforceSpend(spend, { ...ctx, spendConfirmed: true }, base),
    ).resolves.toBeUndefined();
    expect(seen).toEqual([]);
  });

  it('passa il film e la stima al guardiano', async () => {
    const { spend, seen } = guard(undefined);

    await enforceSpend(spend, ctx, {
      role: 'r',
      connectionId: 'fal',
      modelId: 'm',
      estimatedCostUsd: 0.4,
    });

    expect(seen).toEqual([
      { connectionId: 'fal', modelId: 'm', projectId: 'film-1', estimatedCostUsd: 0.4 },
    ]);
  });

  it('un limite superato è spend_cap_reached, con il limite nei dettagli e senza riprovare', async () => {
    const { spend } = guard(breach);

    await expect(
      enforceSpend(spend, ctx, {
        role: 'r',
        connectionId: 'fal',
        modelId: 'm',
        estimatedCostUsd: 0.02,
      }),
    ).rejects.toMatchObject({
      code: 'spend_cap_reached',
      retryable: false,
      details: { role: 'r', connectionId: 'fal', modelId: 'm', spend: breach },
    });
  });
});

describe('run con i limiti di spesa (D30)', () => {
  it('senza nessun limite acceso non si blocca niente', async () => {
    const { spend, seen } = guard(undefined);
    const { troupe, receipts } = troupeWith(spend);

    const { receipt } = await troupe.run('cinematographer', input, ctx);

    expect(receipt.status).toBe('succeeded');
    expect(seen).toHaveLength(1);
    expect(seen[0]?.estimatedCostUsd).toBeGreaterThan(0);
    expect(receipts.all()).toHaveLength(1);
  });

  it('un limite superato ferma la chiamata prima di spendere: nessuno scontrino, nessun fornitore', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { spend } = guard(breach);
    const { troupe, receipts } = troupeWith(spend);

    await expect(troupe.run('cinematographer', input, ctx)).rejects.toMatchObject({
      code: 'spend_cap_reached',
      details: { spend: breach },
    });

    expect(receipts.all()).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("con «prosegui» la stessa chiamata passa, e lo scontrino c'è", async () => {
    const { spend } = guard(breach);
    const { troupe, receipts } = troupeWith(spend);

    const { receipt } = await troupe.run('cinematographer', input, {
      ...ctx,
      spendConfirmed: true,
    });

    expect(receipt.status).toBe('succeeded');
    expect(receipts.all()).toHaveLength(1);
  });

  it('stimare non è generare: la stima non passa dal guardiano', async () => {
    const { spend, seen } = guard(breach);
    const { troupe } = troupeWith(spend);

    await troupe.estimate('cinematographer', input);

    expect(seen).toEqual([]);
  });
});

import path from 'node:path';
import process from 'node:process';

import { ROLE_INPUT_EXAMPLES } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { FileConfigSource } from './config/source.js';
import type { TroupeConfig } from './config/load-files.js';
import { SEED_CONFIG_DIR } from './config/seed.fixtures.js';
import { FileInstructionsSource } from './instructions/resolve.js';
import { MemoryReceiptSink } from './receipts.js';
import { createTroupe } from './troupe.js';

/**
 * L'unica prova che **costa**: un ruolo di testo con un LLM vero (criterio di T1.1). Si salta se
 * `ANTHROPIC_API_KEY` non c'è, quindi in CI e per chi non ha una chiave non succede niente.
 *
 * Gli id dei modelli nel seme sono ancora da verificare (T1.7): se il tuo account usa un id
 * diverso, passalo con `FILMZY_TEST_PROVIDER_MODEL`.
 *
 *   ANTHROPIC_API_KEY=... pnpm --filter @filmzy/troupe test troupe.reale
 */
const hasKey = (process.env.ANTHROPIC_API_KEY ?? '').trim() !== '';

describe.skipIf(!hasKey)('un ruolo di testo con un LLM vero (costa qualche centesimo)', () => {
  it('il direttore della fotografia scrive un prompt e lo scontrino dice quanto è costato', async () => {
    const override = process.env.FILMZY_TEST_PROVIDER_MODEL?.trim();
    const receipts = new MemoryReceiptSink();

    const troupe = createTroupe({
      configSource: {
        load: async () => {
          const loaded = await new FileConfigSource(SEED_CONFIG_DIR).load();
          if (loaded.config === undefined || override === undefined) return loaded;
          return { ...loaded, config: withProviderModel(loaded.config, 'claude-sonnet', override) };
        },
      },
      instructions: new FileInstructionsSource(path.join(SEED_CONFIG_DIR, 'ai', 'instructions')),
      receiptSink: receipts,
      secrets: { env: process.env },
    });

    const { data, receipt } = await troupe.run(
      'cinematographer',
      ROLE_INPUT_EXAMPLES.cinematographer as never,
      { purpose: 'eval' },
    );

    expect(data.prompt.length).toBeGreaterThan(20);
    expect(receipt.status).toBe('succeeded');
    expect(receipt.usage?.inputTokens).toBeGreaterThan(0);
    expect(receipt.actualCostUsd).toBeGreaterThan(0);

    console.log(
      `Risposta del direttore della fotografia (${String(receipt.actualCostUsd)} $):\n${data.prompt}`,
    );
  }, 60_000);
});

if (!hasKey) {
  // Senza chiave la prova non si fa, ma va detto: il criterio di T1.1 la prevede.
  console.log(
    'Prova con LLM vero saltata: metti ANTHROPIC_API_KEY in .env per eseguirla (costa qualche centesimo).',
  );
}

function withProviderModel(
  config: TroupeConfig,
  modelId: string,
  providerModel: string,
): TroupeConfig {
  const model = config.models[modelId];
  if (model === undefined) return config;
  return {
    ...config,
    models: { ...config.models, [modelId]: { ...model, provider_model: providerModel } },
  };
}

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROLE_INPUT_EXAMPLES, type GenerationContext } from '@filmzy/contracts';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { ConfigSource, LoadedConfig } from './config/source.js';
import { applyEnvironmentOverlay, loadEnvironmentOverlay } from './config/environments.js';
import type { TroupeConfig } from './config/load-files.js';
import { loadSeedConfig, SEED_CONFIG_DIR } from './config/seed.fixtures.js';
import { FileInstructionsSource } from './instructions/resolve.js';
import { MemoryReceiptSink } from './receipts.js';
import { createTroupe } from './troupe.js';

const FIXTURES = fileURLToPath(new URL('../test/fixtures', import.meta.url));
const INSTRUCTIONS = new FileInstructionsSource(path.join(SEED_CONFIG_DIR, 'ai', 'instructions'));

const ctx: GenerationContext = { purpose: 'product', projectId: 'proj-1' };

/** Il seme col fornitore finto, come in `TROUPE_ENV=offline`, e le fixture che vuole il test. */
let offline: TroupeConfig;

beforeAll(async () => {
  const seed = await loadSeedConfig();
  const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
  offline = applyEnvironmentOverlay(seed, overlay ?? {}).config;
});

function sourceWith(
  fixturesDir?: string,
  change?: (config: TroupeConfig) => TroupeConfig,
): ConfigSource {
  return {
    load: (): Promise<LoadedConfig> => {
      const connections = Object.fromEntries(
        Object.entries(offline.connections).map(([id, connection]) => [
          id,
          { ...connection, fixtures: fixturesDir },
        ]),
      );
      const config = { ...offline, connections };
      return Promise.resolve({
        config: change === undefined ? config : change(config),
        origin: 'test',
        releaseId: 'test',
        issues: [],
      });
    },
  };
}

function troupeWith(fixturesDir?: string, change?: (config: TroupeConfig) => TroupeConfig) {
  const receipts = new MemoryReceiptSink();
  const troupe = createTroupe({
    configSource: sourceWith(fixturesDir, change),
    instructions: INSTRUCTIONS,
    receiptSink: receipts,
    now: () => new Date('2026-10-21T10:00:00.000Z'),
    sleep: () => Promise.resolve(),
  });
  return { troupe, receipts };
}

describe('run con il fornitore finto', () => {
  it('il direttore della fotografia risponde e lascia uno scontrino chiuso', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { troupe } = troupeWith(FIXTURES);

    const { data, receipt } = await troupe.run(
      'cinematographer',
      ROLE_INPUT_EXAMPLES.cinematographer as never,
      ctx,
    );

    expect(data.prompt).toContain('town square');
    expect(receipt.status).toBe('succeeded');
    expect(receipt.modelId).toBe('claude-sonnet');
    expect(receipt.modelLabel).toBe('Claude Sonnet');
    expect(receipt.instructions).toEqual({ id: 'cinematographer', version: 1, variant: undefined });
    expect(receipt.attempts).toBe(1);
    expect(receipt.actualCostUsd).toBeGreaterThan(0);
    expect(receipt.inputHash).toHaveLength(64);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('lo scontrino passa da queued a running e poi si chiude (§4.11)', async () => {
    const { troupe, receipts } = troupeWith(FIXTURES);
    await troupe.run('cinematographer', ROLE_INPUT_EXAMPLES.cinematographer as never, ctx);

    // Lo stesso scontrino, aggiornato: un id solo.
    expect(receipts.all()).toHaveLength(1);
    expect(receipts.last()?.status).toBe('succeeded');
    expect(receipts.last()?.purpose).toBe('product');
    expect(receipts.last()?.projectId).toBe('proj-1');
  });

  it('senza fixture usa la risposta di esempio del ruolo', async () => {
    const { troupe } = troupeWith();
    const { data } = await troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, ctx);

    expect(data.allowed).toBe(true);
  });
});

describe('errori e tentativi (§4.10)', () => {
  it('un errore tecnico dà pochi tentativi, poi si ferma con codice e dettagli', async () => {
    const { troupe, receipts } = troupeWith(path.join(FIXTURES, 'errori'));

    await expect(
      troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, ctx),
    ).rejects.toMatchObject({ code: 'provider_unavailable', retryable: true });

    // Il moderatore ha retries.technical_error = 2 nel seme: primo tentativo più due.
    const receipt = receipts.last();
    expect(receipt?.status).toBe('failed');
    expect(receipt?.errorCode).toBe('provider_unavailable');
    expect(receipt?.attempts).toBe(3);
  });

  it('un rifiuto del contenuto non si riprova (D36)', async () => {
    const { troupe, receipts } = troupeWith(path.join(FIXTURES, 'rifiuto'));

    await expect(
      troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, ctx),
    ).rejects.toMatchObject({ code: 'content_rejected', retryable: false });

    expect(receipts.last()?.attempts).toBe(1);
    expect(receipts.last()?.errorCode).toBe('content_rejected');
  });

  it('una risposta fuori schema si ripara, e se non basta si ferma (§4.9)', async () => {
    const { troupe, receipts } = troupeWith(path.join(FIXTURES, 'fuori-schema'));

    await expect(
      troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, ctx),
    ).rejects.toMatchObject({ code: 'invalid_output' });

    // retries.invalid_output = 1 nel seme: un tentativo più una riparazione.
    expect(receipts.last()?.attempts).toBe(2);
  });
});

describe('si ferma prima di spendere', () => {
  it('su un ruolo che non è di testo: quelli passano da submit', async () => {
    const { troupe, receipts } = troupeWith();

    await expect(troupe.run('composer' as never, {} as never, ctx)).rejects.toMatchObject({
      code: 'invalid_request',
    });
    expect(receipts.all()).toEqual([]);
  });

  it('su un ruolo di testo spento, e senza scrivere scontrini', async () => {
    const { troupe, receipts } = troupeWith(undefined, (config) => ({
      ...config,
      roles: {
        ...config.roles,
        sound_planner: { ...config.roles.sound_planner, enabled: false } as never,
      },
    }));

    await expect(
      troupe.run('sound_planner', ROLE_INPUT_EXAMPLES.sound_planner as never, ctx),
    ).rejects.toMatchObject({ code: 'role_disabled' });
    expect(receipts.all()).toEqual([]);
  });

  it('se nessun servizio è idoneo, dicendo perché (D36)', async () => {
    const { troupe, receipts } = troupeWith(undefined, (config) => ({
      ...config,
      roles: {
        ...config.roles,
        moderator: { ...config.roles.moderator, model: 'servizio-inventato' } as never,
      },
    }));

    await expect(
      troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, ctx),
    ).rejects.toMatchObject({ code: 'no_eligible_model' });
    expect(receipts.all()).toEqual([]);
  });

  it('su un input non valido, dicendo quale campo', async () => {
    const { troupe, receipts } = troupeWith();

    await expect(
      troupe.run('moderator', { text: '', context: 'idea', language: 'it' } as never, ctx),
    ).rejects.toMatchObject({ code: 'invalid_request', details: { field: 'text' } });
    expect(receipts.all()).toEqual([]);
  });

  it('se si prova a scegliere il servizio per un ruolo di testo (§4.1)', async () => {
    const { troupe } = troupeWith();

    await expect(
      troupe.run('moderator', ROLE_INPUT_EXAMPLES.moderator as never, {
        ...ctx,
        modelId: 'claude-sonnet',
      }),
    ).rejects.toMatchObject({ code: 'invalid_request' });
  });
});

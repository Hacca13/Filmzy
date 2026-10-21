import { mkdtemp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import type { MediaInput } from './adapters/types.js';
import { LocalAssetStore } from './assets.js';
import { applyEnvironmentOverlay, loadEnvironmentOverlay } from './config/environments.js';
import type { TroupeConfig } from './config/load-files.js';
import { loadSeedConfig, SEED_CONFIG_DIR } from './config/seed.fixtures.js';
import { createMediaRunner, type CollectedMedia } from './media.js';
import { MemoryReceiptSink } from './receipts.js';
import type { TranslateInput } from './translators/types.js';

const FIXTURES_ERRORI = fileURLToPath(new URL('../test/fixtures/errori', import.meta.url));

/** Il seme col fornitore finto, come in `TROUPE_ENV=offline`. */
let offline: TroupeConfig;

beforeAll(async () => {
  const seed = await loadSeedConfig();
  const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
  offline = applyEnvironmentOverlay(seed, overlay ?? {}).config;
});

function request(): Omit<TranslateInput, 'modelId'> {
  const reference: MediaInput = {
    use: 'reference',
    file: { fileName: 'anna.png', contentType: 'image/png', bytes: new Uint8Array([1, 2, 3]) },
  };

  return {
    role: 'camera_operator',
    prompt: 'medium shot of [[char:anna]] at a table, warm light',
    inputs: [reference],
    characterIds: ['anna'],
    durationS: 5,
    params: { resolution: '720p', aspect_ratio: '16:9', audio: false },
    idempotencyKey: 'shot-1:abc',
  };
}

/** La sorgente di configurazione del test: il seme in offline, senza scelte dell'utente. */
function sourceOf(config: TroupeConfig) {
  return {
    load: () => Promise.resolve({ config, origin: 'test', releaseId: 'test', issues: [] }),
  };
}

describe('submit e collect con il fornitore finto', () => {
  it('manda il lavoro, lo raccoglie e salva il file nella cartella', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-media-'));
    const receipts = new MemoryReceiptSink();
    const media = createMediaRunner({
      configSource: sourceOf(offline),
      assets: new LocalAssetStore(dir),
      receiptSink: receipts,
    });

    const job = await media.submit('camera_operator', request(), { purpose: 'bench' });
    expect(job.providerRequestId).toMatch(/^fake-/);
    expect(job.estimatedCostUsd).toBeGreaterThan(0);

    let result: CollectedMedia = await media.collect(job.receiptId);
    expect(result.state).toBe('running');

    result = await media.collect(job.receiptId);
    expect(result.state).toBe('succeeded');
    expect(result.assets?.[0]?.path.startsWith(dir)).toBe(true);
    expect(result.assets?.[0]?.contentType).toBe('video/mp4');

    // Lo scontrino è uno solo, chiuso, e dice chi ha fatto il lavoro (§4.11).
    expect(receipts.all()).toHaveLength(1);
    expect(receipts.last()?.status).toBe('succeeded');
    expect(receipts.last()?.modelLabel).toBeTypeOf('string');
    expect(receipts.last()?.actualCostUsd).toBeGreaterThan(0);
    expect(receipts.last()?.providerRequestId).toBe(job.providerRequestId);
  });

  it('un lavoro rifiutato chiude lo scontrino con il suo codice, senza file', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-media-'));
    const receipts = new MemoryReceiptSink();
    const withFixtures: TroupeConfig = {
      ...offline,
      connections: Object.fromEntries(
        Object.entries(offline.connections).map(([id, connection]) => [
          id,
          { ...connection, fixtures: FIXTURES_ERRORI },
        ]),
      ),
    };

    const media = createMediaRunner({
      configSource: sourceOf(withFixtures),
      assets: new LocalAssetStore(dir),
      receiptSink: receipts,
    });

    const job = await media.submit('camera_operator', request(), { purpose: 'bench' });
    const result = await media.collect(job.receiptId);

    expect(result.state).toBe('failed');
    expect(result.error?.code).toBe('content_rejected');
    expect(result.assets).toBeUndefined();
    expect(receipts.last()?.errorCode).toBe('content_rejected');
  });

  it('non raccoglie un lavoro che non ha mandato', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-media-'));
    const media = createMediaRunner({
      configSource: sourceOf(offline),
      assets: new LocalAssetStore(dir),
    });

    await expect(media.collect('scontrino-inventato')).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});

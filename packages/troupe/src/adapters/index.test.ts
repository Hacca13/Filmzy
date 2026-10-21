import { ROLE_IO } from '@filmzy/contracts';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { applyEnvironmentOverlay, loadEnvironmentOverlay } from '../config/environments.js';
import type { TroupeConfig } from '../config/load-files.js';
import { loadSeedConfig, SEED_CONFIG_DIR } from '../config/seed.fixtures.js';
import { llmAdapterFor, mediaAdapterFor } from './index.js';

/** La configurazione come la vede `TROUPE_ENV=offline`: ogni connessione al fornitore finto. */
let offline: TroupeConfig;

beforeAll(async () => {
  const seed = await loadSeedConfig();
  const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
  offline = applyEnvironmentOverlay(seed, overlay ?? {}).config;
});

function optionsFor(connectionId: string) {
  const connection = offline.connections[connectionId];
  if (connection === undefined) throw new Error(`il seme non ha la connessione "${connectionId}"`);
  return { connectionId, connection };
}

describe('indice dei plugin con il seme in offline', () => {
  it('ogni connessione diventa il fornitore finto e sa servire testo e media', () => {
    for (const connectionId of Object.keys(offline.connections)) {
      expect(() => llmAdapterFor(optionsFor(connectionId))).not.toThrow();
      expect(() => mediaAdapterFor(optionsFor(connectionId))).not.toThrow();
    }
  });

  it('esegue un ruolo LLM senza rete', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const adapter = llmAdapterFor(optionsFor('anthropic'));

    const { data } = await adapter.generate({
      role: 'moderator',
      modelId: 'claude-haiku',
      providerModel: 'claude-haiku-5-5',
      user: 'Una donna torna nella sua città natale',
      outputSchema: ROLE_IO.moderator.output,
    });

    expect(data).toMatchObject({ allowed: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('esegue un ruolo video senza rete, dalla coda al file', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const adapter = mediaAdapterFor(optionsFor('fal'));

    const { providerRequestId } = await adapter.submit({
      role: 'camera_operator',
      modelId: 'seedance-2',
      providerModel: 'fal-ai/seedance-2',
      prompt: 'close up, woman smiles, golden hour light',
      params: { duration_s: 5 },
      idempotencyKey: 'shot-2:seedance-2:def456',
    });

    let status = await adapter.poll(providerRequestId);
    while (status.state === 'queued' || status.state === 'running') {
      status = await adapter.poll(providerRequestId);
    }

    if (status.state !== 'succeeded') throw new Error(`stato inatteso: ${status.state}`);
    expect(status.files).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('dice quale adapter manca, con i nomi disponibili', () => {
    const connection = { ...optionsFor('fal').connection, adapter: 'inventato' };

    expect(() => llmAdapterFor({ connectionId: 'fal', connection })).toThrow(
      /adapter "inventato".*Disponibili: fake/s,
    );
  });
});

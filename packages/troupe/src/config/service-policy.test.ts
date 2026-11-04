import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ModelEntry } from '@filmzy/contracts';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { TroupeConfig } from './load-files.js';
import { loadSeedConfig, modelOf, SEED_CONFIG_DIR } from './seed.fixtures.js';
import { validateServicePolicy } from './service-policy.js';

let seed: TroupeConfig;
const tempDirs: string[] = [];

beforeAll(async () => {
  seed = await loadSeedConfig();
});

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

/** Il seme con una voce in più, costruita sulla musica che c'è già. */
function withService(service: {
  label?: string;
  provider_model?: string;
  connection?: string;
  kind?: 'music' | 'voice';
}): TroupeConfig {
  const copy = structuredClone(seed);
  copy.models.nuovo = { ...modelOf(seed, 'music-stable-audio-3'), ...service } as ModelEntry;
  return copy;
}

async function tempConfigDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-policy-'));
  tempDirs.push(dir);
  return dir;
}

describe('i servizi vietati dai loro termini (D79)', () => {
  it('il seme non ne usa nessuno', async () => {
    expect(await validateServicePolicy(seed, SEED_CONFIG_DIR)).toEqual([]);
  });

  it('ferma ElevenLabs Music dalla sua connessione, anche con un altro nome, e dice perché', async () => {
    const issues = await validateServicePolicy(
      withService({ label: 'La mia musica', provider_model: 'music_v2_5', connection: 'elevenlabs' }),
      SEED_CONFIG_DIR,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        severity: 'error',
        code: 'service_blocked_by_policy',
        section: 'models',
        key: 'nuovo',
        modelId: 'nuovo',
      }),
    ]);
    expect(issues[0]?.message).toContain('Per policy di Filmzy non si può usare «La mia musica»');
    expect(issues[0]?.message).toContain('escludono i film');
    expect(issues[0]?.message).toContain('caricarlo come file audio');
  });

  it('ferma ElevenLabs Music anche se passa da un altro fornitore', async () => {
    const issues = await validateServicePolicy(
      withService({ provider_model: 'fornitore/elevenlabs/music' }),
      SEED_CONFIG_DIR,
    );

    expect(issues.map((issue) => issue.code)).toEqual(['service_blocked_by_policy']);
  });

  it.each([
    ['nel nome, con le maiuscole', { label: 'SUNO v5' }],
    ['nel servizio di un rivenditore', { provider_model: 'rivenditore/suno-v5' }],
    ['attaccato al resto della parola', { provider_model: 'sunoapi/genera' }],
  ])('ferma Suno %s', async (_where, service) => {
    const issues = await validateServicePolicy(withService(service), SEED_CONFIG_DIR);

    expect(issues[0]?.message).toContain('I termini di Suno');
  });

  it('ferma Suno anche dall’indirizzo della connessione', async () => {
    const config = withService({ connection: 'rivenditore' });
    config.connections.rivenditore = {
      adapter: 'fal',
      base_url: 'https://api.sunoapi.example/v1',
      api_key: 'none',
      timeout_s: 60,
      max_concurrency: 1,
      enabled: false,
    };

    const issues = await validateServicePolicy(config, SEED_CONFIG_DIR);

    expect(issues.map((issue) => issue.modelId)).toEqual(['nuovo']);
  });

  it('non scambia per Suno una parola che lo contiene', async () => {
    const issues = await validateServicePolicy(
      withService({ label: 'Musica di nessuno' }),
      SEED_CONFIG_DIR,
    );

    expect(issues).toEqual([]);
  });

  it('lascia passare le voci di ElevenLabs: i termini della musica non le riguardano', async () => {
    const issues = await validateServicePolicy(
      withService({ kind: 'voice', label: 'Voci', provider_model: 'voce', connection: 'elevenlabs' }),
      SEED_CONFIG_DIR,
    );

    expect(issues).toEqual([]);
  });

  it('senza il file non passa niente', async () => {
    const issues = await validateServicePolicy(seed, await tempConfigDir());

    expect(issues).toEqual([
      expect.objectContaining({ severity: 'error', code: 'file_unreadable' }),
    ]);
  });

  it('con un file fuori schema non passa niente', async () => {
    const dir = await tempConfigDir();
    await mkdir(path.join(dir, 'ai'));
    await writeFile(path.join(dir, 'ai', 'policy.yaml'), 'version: 1\n');

    const issues = await validateServicePolicy(seed, dir);

    expect(issues[0]).toMatchObject({ severity: 'error', code: 'schema_invalid' });
  });
});

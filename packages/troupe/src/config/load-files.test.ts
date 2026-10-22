import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectionsFileSchema, modelsFileSchema } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  configToYamlFiles,
  loadBenchPlan,
  loadConfigFiles,
  parseConfigFile,
} from './load-files.js';
import { FileConfigSource } from './source.js';

/** La cartella `config/` del repository: i file di seme veri. */
const SEED_CONFIG_DIR = fileURLToPath(new URL('../../../../config', import.meta.url));

describe('parseConfigFile', () => {
  it('legge un file valido', () => {
    const raw = `version: 1
connections:
  fal:
    adapter: fal
    api_key: env:FAL_KEY
    timeout_s: 900
    max_concurrency: 3
    enabled: true
`;
    const { data, issues } = parseConfigFile(
      connectionsFileSchema,
      'ai/connections.yaml',
      raw,
      'connections',
    );
    expect(issues).toEqual([]);
    expect(data?.connections.fal?.adapter).toBe('fal');
  });

  it('dà un problema leggibile se il file non è YAML', () => {
    const { data, issues } = parseConfigFile(
      connectionsFileSchema,
      'ai/connections.yaml',
      'version: 1\n  rotto: [',
      'connections',
    );
    expect(data).toBeUndefined();
    expect(issues[0]?.code).toBe('yaml_invalid');
    expect(issues[0]?.message).toContain('ai/connections.yaml');
  });

  it('nomina il campo sbagliato quando lo schema non passa', () => {
    const raw = `version: 1
connections:
  fal:
    adapter: fal
    api_key: sk-una-chiave-in-chiaro
    timeout_s: 900
    max_concurrency: 3
    enabled: true
`;
    const { issues } = parseConfigFile(
      connectionsFileSchema,
      'ai/connections.yaml',
      raw,
      'connections',
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('schema_invalid');
    expect(issues[0]?.field).toBe('connections.fal.api_key');
    expect(issues[0]?.key).toBe('fal');
  });

  it('rifiuta un id segnaposto con status active (§4.6 punto 7)', () => {
    const raw = `version: 1
models:
  seedance-2:
    label: Seedance 2
    kind: video
    connection: fal
    provider_model: "<id da verificare>"
    family: seedance
    capabilities:
      durations_s: { min: 4, max: 15 }
      input_modes: [references]
      max_reference_images: 12
      max_characters: 2
      native_audio: true
      real_faces: verified_assets
      minors: false
    pricing: { unit: per_second, value: 0.15, checked: 2026-10-13 }
    status: active
`;
    const { issues } = parseConfigFile(modelsFileSchema, 'ai/models.yaml', raw, 'models');
    expect(issues[0]?.message).toContain('provider_model');
  });
});

describe('loadConfigFiles sui file di seme del repository', () => {
  it('li legge tutti senza problemi di struttura', async () => {
    const { config, issues } = await loadConfigFiles(SEED_CONFIG_DIR);
    expect(issues).toEqual([]);
    expect(config).toBeDefined();
  });

  it('porta i movimenti di macchina in camelCase, come li usano le istruzioni', async () => {
    const { config } = await loadConfigFiles(SEED_CONFIG_DIR);
    const movement = config?.presets.cameraMovements.find((m) => m.id === 'push_in');
    expect(movement?.endFrameHint).toContain('the camera has moved closer');
  });

  it('ha i ruoli, i modelli e le connessioni del seme', async () => {
    const { config } = await loadConfigFiles(SEED_CONFIG_DIR);
    expect(config?.roles.moderator?.model).toBe('claude-haiku');
    expect(config?.models['claude-sonnet']?.kind).toBe('llm');
    expect(config?.connections.fal?.delivery).toBe('polling');
    expect(config?.limits.max_characters).toBe(2);
    expect(config?.features.moodboard).toBe(false);
  });

  it('dice quale file manca se la cartella non è una configurazione', async () => {
    const { config, issues } = await loadConfigFiles(fileURLToPath(new URL('.', import.meta.url)));
    expect(config).toBeUndefined();
    expect(issues.every((issue) => issue.code === 'file_unreadable')).toBe(true);
    expect(issues.map((issue) => issue.file)).toContain('ai/connections.yaml');
  });
});

describe('FileConfigSource', () => {
  it('consegna la configurazione e nessuna scelta dell\'utente (§4.3)', async () => {
    const loaded = await new FileConfigSource(SEED_CONFIG_DIR).load();
    expect(loaded.config).toBeDefined();
    expect(loaded.settings).toBeUndefined();
    expect(loaded.origin).toBe(SEED_CONFIG_DIR);
  });
});

describe('loadBenchPlan', () => {
  it('legge il piano della settimana 1', async () => {
    const planPath = fileURLToPath(new URL('../../../../config/bench/week1.yaml', import.meta.url));
    const { plan, issues } = await loadBenchPlan(planPath);
    expect(issues).toEqual([]);
    expect(plan?.name).toBe('coerenza-personaggi-v1');
    expect(plan?.models).toContain('seedance-2');
  });
});

describe('configToYamlFiles: il giro completo (pnpm troupe export → import)', () => {
  it('riscrive i file del seme e rileggendoli si ottiene la stessa configurazione', async () => {
    const { config } = await loadConfigFiles(SEED_CONFIG_DIR);
    expect(config).toBeDefined();
    if (config === undefined) return;

    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-export-'));
    for (const { file, text } of configToYamlFiles(config)) {
      const destinazione = path.join(dir, file);
      await mkdir(path.dirname(destinazione), { recursive: true });
      await writeFile(destinazione, text, 'utf8');
    }

    const riletta = await loadConfigFiles(dir);

    expect(riletta.issues).toEqual([]);
    expect(riletta.config).toEqual(config);
  });

  it('scrive i nove file del seme, con i preset in snake_case', async () => {
    const { config } = await loadConfigFiles(SEED_CONFIG_DIR);
    if (config === undefined) throw new Error('il seme non si è letto');

    const files = configToYamlFiles(config);
    expect(files.map(({ file }) => file)).toEqual([
      'ai/connections.yaml',
      'ai/models.yaml',
      'ai/roles.yaml',
      'features.yaml',
      'presets/styles.yaml',
      'presets/cinematography.yaml',
      'presets/camera_movements.yaml',
      'presets/character_tags.yaml',
      'presets/genres.yaml',
    ]);

    const movimenti = files.find(({ file }) => file.endsWith('camera_movements.yaml'))?.text ?? '';
    expect(movimenti).toContain('end_frame_hint:');
    expect(movimenti).not.toContain('endFrameHint');
  });
});

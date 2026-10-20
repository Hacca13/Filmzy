import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  applyEnvironmentOverlay,
  configEnvironmentFromEnv,
  loadEnvironmentOverlay,
} from './environments.js';
import { loadConfigFiles } from './load-files.js';

const SEED_CONFIG_DIR = fileURLToPath(new URL('../../../../config', import.meta.url));

async function seedConfig() {
  const { config } = await loadConfigFiles(SEED_CONFIG_DIR);
  if (config === undefined) throw new Error('i file di seme non si sono caricati');
  return config;
}

describe('configEnvironmentFromEnv', () => {
  it('senza TROUPE_ENV non applica nessun adattamento', () => {
    expect(configEnvironmentFromEnv({})).toBeUndefined();
    expect(configEnvironmentFromEnv({ TROUPE_ENV: '' })).toBeUndefined();
  });

  it.each(['development', 'offline', 'test'])('accetta %j', (value) => {
    expect(configEnvironmentFromEnv({ TROUPE_ENV: value })).toBe(value);
  });

  it('dà un errore leggibile su un ambiente che non esiste', () => {
    expect(() => configEnvironmentFromEnv({ TROUPE_ENV: 'produzione' })).toThrow(
      /TROUPE_ENV non valido: "produzione".*development, offline, test/s,
    );
  });
});

describe('loadEnvironmentOverlay sui file del seme', () => {
  it('offline manda ogni connessione al fornitore finto, con la chiave `*`', async () => {
    const { overlay, issues } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
    expect(issues).toEqual([]);
    expect(overlay?.connections?.['*']?.adapter).toBe('fake');
  });

  it('development cambia solo la politica del router', async () => {
    const { overlay, issues } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'development');
    expect(issues).toEqual([]);
    expect(overlay?.roles?.camera_operator?.routing?.policy).toBe('cheap');
  });
});

describe('applyEnvironmentOverlay', () => {
  it('con `*` porta tutte le connessioni al fornitore finto e tiene il resto (offline)', async () => {
    const config = await seedConfig();
    const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
    const { config: adapted, issues } = applyEnvironmentOverlay(config, overlay ?? {});

    expect(issues).toEqual([]);
    expect(Object.values(adapted.connections).every((c) => c.adapter === 'fake')).toBe(true);
    expect(adapted.connections.fal?.fixtures).toBe('packages/troupe/test/fixtures');
    // La fusione è profonda: i campi non toccati restano quelli del seme.
    expect(adapted.connections.fal?.timeout_s).toBe(900);
    expect(adapted.connections.anthropic?.api_key).toBe('env:ANTHROPIC_API_KEY');
  });

  it('fonde in profondità e lascia intatto il resto (development)', async () => {
    const config = await seedConfig();
    const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'development');
    const { config: adapted, issues } = applyEnvironmentOverlay(config, overlay ?? {});

    expect(issues).toEqual([]);
    expect(adapted.roles.camera_operator?.routing?.policy).toBe('cheap');
    // `candidates` non è nella sovrapposizione: resta quello del seme.
    expect(adapted.roles.camera_operator?.routing?.candidates).toEqual(
      config.roles.camera_operator?.routing?.candidates,
    );
    expect(adapted.roles.moderator).toEqual(config.roles.moderator);
    expect(adapted.connections).toEqual(config.connections);
  });

  it('le liste si sostituiscono, non si sommano', async () => {
    const config = await seedConfig();
    const { config: adapted, issues } = applyEnvironmentOverlay(config, {
      roles: { camera_operator: { routing: { candidates: ['seedance-2'] } } },
    });

    expect(issues).toEqual([]);
    expect(adapted.roles.camera_operator?.routing?.candidates).toEqual(['seedance-2']);
  });

  it('dice quando l\'ambiente cambia una voce che non esiste', async () => {
    const config = await seedConfig();
    const { issues } = applyEnvironmentOverlay(config, {
      connections: { inventata: { enabled: false } },
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('environment_unknown_key');
    expect(issues[0]?.message).toContain('"inventata"');
  });

  it('dice quando l\'ambiente rende una voce non valida', async () => {
    const config = await seedConfig();
    const { issues } = applyEnvironmentOverlay(config, {
      // `timeout_s` deve restare un numero positivo: una sovrapposizione non può romperlo.
      connections: { fal: { timeout_s: -1 } },
    });

    expect(issues[0]?.code).toBe('environment_invalid_result');
    expect(issues[0]?.field).toBe('timeout_s');
  });
});

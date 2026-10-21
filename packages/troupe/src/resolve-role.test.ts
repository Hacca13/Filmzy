import type { UserSettings } from '@filmzy/contracts';
import { beforeAll, describe, expect, it } from 'vitest';

import type { TroupeConfig } from './config/load-files.js';
import { loadSeedConfig, modelOf, roleOf } from './config/seed.fixtures.js';
import { resolveRole } from './resolve-role.js';

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

function withSeed(change: (config: TroupeConfig) => void): TroupeConfig {
  const copy = structuredClone(seed);
  change(copy);
  return copy;
}

const noSettings: UserSettings = {
  enabledModelIds: [],
  defaultModels: {},
  defaultModelByConnection: {},
  spendCaps: {},
  roleSettings: {},
};

describe('resolveRole sul seme', () => {
  it('prende il servizio e i parametri della release', () => {
    const resolved = resolveRole(seed, 'moderator');

    expect(resolved.modelId).toBe('claude-haiku');
    expect(resolved.connectionId).toBe('anthropic');
    expect(resolved.params).toEqual({ temperature: 0, max_tokens: 500 });
    expect(resolved.releaseInstructions).toBe('moderator@1');
    expect(resolved.retries).toEqual({ invalid_output: 1, technical_error: 2 });
  });

  it('un ruolo con candidati prende il primo idoneo', () => {
    const resolved = resolveRole(seed, 'camera_operator');
    expect(resolved.modelId).toBe('kling-o3-standard');
  });

  it('si ferma su un ruolo spento, senza chiamare nessuno', () => {
    expect(() => resolveRole(seed, 'composer')).toThrow(
      expect.objectContaining({ code: 'role_disabled' }),
    );
  });

  it('si ferma su un ruolo che non è configurato', () => {
    expect(() => resolveRole(seed, 'moodboard_designer')).toThrow(
      expect.objectContaining({ code: 'config_invalid' }),
    );
  });
});

describe("le scelte dell'utente vincono sulla release (D38)", () => {
  it('cambia il servizio del ruolo', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['claude-sonnet'],
      roleSettings: { moderator: { modelId: 'claude-sonnet' } },
    };

    expect(resolveRole(seed, 'moderator', settings).modelId).toBe('claude-sonnet');
  });

  it('cambia la creatività, lasciando gli altri parametri', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['claude-haiku'],
      roleSettings: { moderator: { params: { temperature: 0.7 } } },
    };

    expect(resolveRole(seed, 'moderator', settings).params).toEqual({
      temperature: 0.7,
      max_tokens: 500,
    });
  });

  it('porta con sé la versione delle istruzioni scelta', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['claude-haiku'],
      roleSettings: { moderator: { instructions: 'moderator@2' } },
    };

    expect(resolveRole(seed, 'moderator', settings).userInstructions).toBe('moderator@2');
  });

  it('un servizio non attivato non si usa (D36)', () => {
    const settings: UserSettings = { ...noSettings, enabledModelIds: ['claude-sonnet'] };

    expect(() => resolveRole(seed, 'moderator', settings)).toThrow(
      expect.objectContaining({ code: 'no_eligible_model' }),
    );
  });

  it('senza impostazioni non si filtra nulla: valgono tutte le voci della release (§4.3)', () => {
    expect(resolveRole(seed, 'moderator', undefined).modelId).toBe('claude-haiku');
  });
});

describe('idoneità del servizio (§4.8)', () => {
  it('dice perché nessun servizio va bene, servizio per servizio', () => {
    const config = withSeed((c) => {
      c.models['claude-haiku'] = { ...modelOf(c, 'claude-haiku'), status: 'retired' };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/è ritirato/);
  });

  it('non usa un servizio la cui connessione è spenta', () => {
    const config = withSeed((c) => {
      c.connections.anthropic = { ...c.connections.anthropic, enabled: false } as never;
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/è spenta/);
  });

  it('non usa un servizio che non accetta i parametri del ruolo', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), params: { temperature: 5 } };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/il massimo è 1/);
  });

  it('non usa un servizio di un altro tipo', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), model: 'seedance-2', params: {} };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/è di tipo video/);
  });
});

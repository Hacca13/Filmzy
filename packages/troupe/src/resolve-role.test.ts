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
    // Niente temperatura: i modelli del seme non la accettano (T1.7, D42).
    expect(resolved.params).toEqual({ max_tokens: 500 });
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

describe('il predefinito del gruppo (T2.7)', () => {
  const allEnabled = (config: TroupeConfig) =>
    Object.keys(config.models).filter((id) => config.models[id]?.status !== 'retired');

  it('un ruolo di testo usa il servizio predefinito del gruppo al posto di quello della release', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: allEnabled(seed),
      defaultModels: { text: 'claude-sonnet' },
    };

    // Il moderatore della release usa claude-haiku: il predefinito dell'utente vince.
    expect(resolveRole(seed, 'moderator', settings).modelId).toBe('claude-sonnet');
  });

  it('il servizio scelto per il ruolo vince sul predefinito del gruppo', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: allEnabled(seed),
      defaultModels: { text: 'claude-sonnet' },
      roleSettings: { moderator: { modelId: 'claude-haiku' } },
    };

    expect(resolveRole(seed, 'moderator', settings).modelId).toBe('claude-haiku');
  });

  it('se il predefinito non è idoneo (non attivato) si guarda quello della release', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['claude-haiku'],
      defaultModels: { text: 'claude-sonnet' },
    };

    expect(resolveRole(seed, 'moderator', settings).modelId).toBe('claude-haiku');
  });

  it('un predefinito di un altro gruppo non tocca i ruoli di testo', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: allEnabled(seed),
      defaultModels: { video: 'seedance-2' },
    };

    expect(resolveRole(seed, 'moderator', settings).modelId).toBe('claude-haiku');
  });

  it('per un ruolo con candidati il predefinito del gruppo passa in testa', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: allEnabled(seed),
      defaultModels: { video: 'seedance-2' },
    };

    expect(resolveRole(seed, 'camera_operator', settings).modelId).toBe('seedance-2');
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
    // Nessun modello del seme accetta la temperatura (T1.7): qui la si dichiara di proposito,
    // perché quello che si prova è il meccanismo di D38, non il catalogo di oggi.
    const config = withSeed((c) => {
      c.models['claude-haiku'] = {
        ...modelOf(c, 'claude-haiku'),
        params: { ...modelOf(c, 'claude-haiku').params, temperature: { min: 0, max: 1 } },
      };
    });
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['claude-haiku'],
      roleSettings: { moderator: { params: { temperature: 0.7 } } },
    };

    expect(resolveRole(config, 'moderator', settings).params).toEqual({
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
      c.roles.moderator = { ...roleOf(c, 'moderator'), params: { max_tokens: 999999 } };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/il massimo è 128000/);
  });

  it('non usa un servizio che non ha quel parametro (la temperatura, T1.7)', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), params: { temperature: 0.5 } };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/"temperature" non lo accetta/);
  });

  it('non usa un servizio di un altro tipo', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), model: 'seedance-2', params: {} };
    });

    expect(() => resolveRole(config, 'moderator')).toThrow(/è di tipo video/);
  });
});

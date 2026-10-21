import { beforeAll, describe, expect, it } from 'vitest';

import { applyEnvironmentOverlay, loadEnvironmentOverlay } from './environments.js';
import type { TroupeConfig } from './load-files.js';
import {
  connectionOf,
  loadSeedConfig,
  modelOf,
  roleOf,
  SEED_CONFIG_DIR,
} from './seed.fixtures.js';
import { validateConfig } from './validate.js';

/** La data della ricerca del seme: così i test non invecchiano con il calendario. */
const NOW = new Date('2026-10-20T00:00:00Z');

const SEED_SECRETS = {
  env: { ANTHROPIC_API_KEY: 'sk-prova', FAL_KEY: 'fal-prova' },
};

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

/** Copia profonda, per cambiare una voce senza toccare il seme degli altri test. */
function withSeed(change: (config: TroupeConfig) => void): TroupeConfig {
  const copy = structuredClone(seed);
  change(copy);
  return copy;
}

describe('validateConfig sui file di seme', () => {
  it('non trova niente da dire: id e prezzi sono verificati (T1.7)', () => {
    const issues = validateConfig(seed, { now: NOW, secrets: SEED_SECRETS });

    // Dopo T1.7 il seme non ha più né errori né avvisi: i servizi che l'MVP usa sono `active`,
    // con id e prezzi verificati. La musica resta `testing`, ma il suo ruolo è spento (T5.4).
    expect(issues).toEqual([]);
  });

  it('con il fornitore finto non chiede nessuna chiave (TROUPE_ENV=offline)', async () => {
    const { overlay } = await loadEnvironmentOverlay(SEED_CONFIG_DIR, 'offline');
    const { config } = applyEnvironmentOverlay(seed, overlay ?? {});

    const issues = validateConfig(config, { now: NOW, environment: 'offline' });
    expect(issues.filter((issue) => issue.code === 'secret_missing')).toEqual([]);
  });

  it('senza chiavi le connessioni attive danno errore, con il nome della variabile', () => {
    const issues = validateConfig(seed, { now: NOW, secrets: { env: {} } });
    const missing = issues.filter((issue) => issue.code === 'secret_missing');

    expect(missing.map((issue) => issue.connectionId).sort()).toEqual(['anthropic', 'fal']);
    expect(missing[0]?.message).toContain('ANTHROPIC_API_KEY');
    expect(missing[0]?.severity).toBe('error');
  });

  it('in test le chiavi non servono (§4.6 punto 5)', () => {
    const issues = validateConfig(seed, { now: NOW, environment: 'test', secrets: { env: {} } });
    expect(issues.filter((issue) => issue.code === 'secret_missing')).toEqual([]);
  });
});

describe('riferimenti (§4.6 punto 2)', () => {
  it('nomina ruolo e campo quando un ruolo usa un servizio che non esiste', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), model: 'claude-inventato' };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'unknown_model',
    );

    expect(issue?.severity).toBe('error');
    expect(issue?.role).toBe('moderator');
    expect(issue?.field).toBe('model');
    expect(issue?.message).toContain('"claude-inventato"');
  });

  it('non lascia passare un ruolo LLM con un modello video', () => {
    const config = withSeed((c) => {
      c.roles.moderator = { ...roleOf(c, 'moderator'), model: 'seedance-2' };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'model_kind_mismatch',
    );

    expect(issue?.message).toContain('tipo llm');
    expect(issue?.message).toContain('tipo video');
  });

  it('segnala un servizio su una connessione spenta, usato da un ruolo attivo', () => {
    const config = withSeed((c) => {
      c.connections.anthropic = { ...connectionOf(c, 'anthropic'), enabled: false };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'connection_disabled',
    );

    expect(issue?.connectionId).toBe('anthropic');
  });

  it('lascia in pace un ruolo spento: nel seme composer aspetta il fornitore (T5.4)', () => {
    const issues = validateConfig(seed, { now: NOW, secrets: SEED_SECRETS });
    expect(issues.filter((issue) => issue.role === 'composer')).toEqual([]);
  });

  it('controlla che prompt_from scriva davvero un prompt visivo', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = { ...roleOf(c, 'camera_operator'), prompt_from: 'moderator' };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'prompt_from_not_visual',
    );

    expect(issue?.role).toBe('camera_operator');
    expect(issue?.field).toBe('prompt_from');
  });
});

describe('parametri (§4.6 punto 3)', () => {
  it('rifiuta un parametro che il modello non accetta', () => {
    const config = withSeed((c) => {
      c.roles.moderator = {
        ...roleOf(c, 'moderator'),
        params: { ...c.roles.moderator?.params, top_k: 5 },
      };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'param_not_accepted',
    );

    expect(issue?.field).toBe('params.top_k');
    expect(issue?.message).toContain('"claude-haiku"');
  });

  it('rifiuta un valore fuori dai limiti del modello', () => {
    const config = withSeed((c) => {
      c.roles.casting = { ...roleOf(c, 'casting'), params: { max_tokens: 999999 } };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'param_out_of_limits',
    );

    expect(issue?.message).toContain('il massimo è 128000');
    expect(issue?.field).toBe('params.max_tokens');
  });

  it('rifiuta un valore fuori dall\'elenco ammesso', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        params: { ...c.roles.camera_operator?.params, resolution: '4k' },
      };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'param_out_of_limits',
    );

    expect(issue?.message).toContain('i valori ammessi sono');
  });

  it('un parametro deve andare bene per *ogni* candidato, non solo per il primo', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        params: { ...c.roles.camera_operator?.params, aspect_ratio: '4:3' },
      };
    });
    const issues = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).filter(
      (i) => i.code === 'param_out_of_limits',
    );

    // Seedance accetta 4:3, Kling e Gemini no: due errori, non zero.
    expect(issues.map((issue) => issue.modelId).sort()).toEqual([
      'gemini-omni-flash',
      'kling-o3-standard',
    ]);
  });
});

describe('stato e capacità (§4.6 punti 7 e 9)', () => {
  it('vieta un modello ritirato', () => {
    const config = withSeed((c) => {
      c.models['claude-haiku'] = { ...modelOf(c, 'claude-haiku'), status: 'retired' };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'model_retired',
    );

    expect(issue?.severity).toBe('error');
    expect(issue?.modelId).toBe('claude-haiku');
  });

  it('pretende image_edit per il ritocco', () => {
    const config = withSeed((c) => {
      const model = c.models['nano-banana-2-edit'];
      if (model?.kind === 'image') model.capabilities.image_edit = 'unknown';
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'missing_capability' && i.role === 'retoucher',
    );

    expect(issue?.field).toBe('capabilities.image_edit');
  });
});

describe('funzioni (§4.6 punto 8)', () => {
  it('con real_people accesa pretende un servizio video che accetti volti verificati', () => {
    const config = withSeed((c) => {
      c.features.real_people = true;
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        routing: { policy: 'balanced', candidates: ['gemini-omni-flash'] },
      };
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'real_people_without_model',
    );

    expect(issue?.role).toBe('camera_operator');
  });

  it('con real_people accesa il seme va bene: Seedance accetta gli asset verificati', () => {
    const config = withSeed((c) => {
      c.features.real_people = true;
    });
    const issues = validateConfig(config, { now: NOW, secrets: SEED_SECRETS });

    expect(issues.filter((i) => i.code === 'real_people_without_model')).toEqual([]);
  });

  it('con keyframes accesa il seme va bene: Kling O3 accetta primo e ultimo fotogramma (D20)', () => {
    const config = withSeed((c) => {
      c.features.keyframes = true;
    });
    const issues = validateConfig(config, { now: NOW, secrets: SEED_SECRETS });

    // Verificato in T1.7: lo stesso punto d'accesso di Kling prende riferimenti e fotogrammi.
    expect(issues.filter((i) => i.code === 'keyframes_without_model')).toEqual([]);
  });

  it('con keyframes accesa, se nel catalogo nessuno li accetta, è un errore (D20)', () => {
    const config = withSeed((c) => {
      c.features.keyframes = true;
      const kling = c.models['kling-o3-standard'];
      if (kling?.kind === 'video') kling.capabilities.input_modes = ['references'];
    });
    const issue = validateConfig(config, { now: NOW, secrets: SEED_SECRETS }).find(
      (i) => i.code === 'keyframes_without_model',
    );

    expect(issue?.severity).toBe('error');
  });
});

describe('prezzi (§4.6 punto 6)', () => {
  it('oggi i prezzi del seme sono freschi: nessun avviso', () => {
    const issues = validateConfig(seed, { now: NOW, secrets: SEED_SECRETS });
    expect(issues.filter((issue) => issue.code === 'price_stale')).toEqual([]);
  });

  it('avvisa quando la verifica ha più di 30 giorni', () => {
    const issues = validateConfig(seed, {
      now: new Date('2026-12-01T00:00:00Z'),
      secrets: SEED_SECRETS,
    });
    const stale = issues.filter((issue) => issue.code === 'price_stale');

    expect(stale.length).toBeGreaterThan(0);
    expect(stale.every((issue) => issue.severity === 'warning')).toBe(true);
    expect(stale[0]?.message).toContain('giorni fa');
  });
});

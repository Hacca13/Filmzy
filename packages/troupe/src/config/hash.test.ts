import { beforeAll, describe, expect, it } from 'vitest';

import { canonicalJson, configHash, hashRoleConfig } from './hash.js';
import type { TroupeConfig } from './load-files.js';
import { loadSeedConfig, modelOf, roleOf } from './seed.fixtures.js';

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

describe('canonicalJson', () => {
  it('mette le chiavi in ordine, a ogni livello', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('tiene l\'ordine delle liste, che è un dato', () => {
    expect(canonicalJson({ candidates: ['b', 'a'] })).toBe('{"candidates":["b","a"]}');
  });
});

describe('configHash', () => {
  it('non cambia se cambia solo l\'ordine delle chiavi', () => {
    expect(configHash({ a: 1, b: 2 })).toBe(configHash({ b: 2, a: 1 }));
  });

  it('cambia se cambia un valore', () => {
    expect(configHash({ a: 1 })).not.toBe(configHash({ a: 2 }));
  });
});

describe('hashRoleConfig', () => {
  it('cambia quando cambia la creatività del ruolo', () => {
    const before = hashRoleConfig(seed, 'casting');
    const after = hashRoleConfig(
      { ...seed, roles: { ...seed.roles, casting: { ...roleOf(seed, 'casting'), params: { temperature: 0.2 } } } },
      'casting',
    );

    expect(before).toBeDefined();
    expect(after).not.toBe(before);
  });

  it('cambia quando il servizio del ruolo punta a un altro id presso il fornitore', () => {
    const before = hashRoleConfig(seed, 'camera_operator');
    const after = hashRoleConfig(
      {
        ...seed,
        models: {
          ...seed.models,
          'kling-o3-standard': {
            ...modelOf(seed, 'kling-o3-standard'),
            provider_model: 'fal-ai/kling-o3-standard-verificato',
          },
        },
      },
      'camera_operator',
    );

    expect(after).not.toBe(before);
  });

  it('non cambia se cambia un ruolo diverso', () => {
    const before = hashRoleConfig(seed, 'moderator');
    const after = hashRoleConfig(
      { ...seed, roles: { ...seed.roles, casting: { ...roleOf(seed, 'casting'), params: {} } } },
      'moderator',
    );

    expect(after).toBe(before);
  });

  it('non dà un hash per un ruolo che non è configurato', () => {
    expect(hashRoleConfig(seed, 'moodboard_designer')).toBeUndefined();
  });
});

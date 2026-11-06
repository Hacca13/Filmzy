import { beforeAll, describe, expect, it } from 'vitest';

import type { TroupeConfig } from './load-files.js';
import { mergeSeed } from './merge-seed.js';
import { loadSeedConfig, modelOf, roleOf } from './seed.fixtures.js';

let seed: TroupeConfig;

const without = <T>(entries: Record<string, T>, key: string) =>
  Object.fromEntries(Object.entries(entries).filter(([name]) => name !== key));

beforeAll(async () => {
  seed = await loadSeedConfig();
});

/** Il seme di una versione passata: senza Opus, con un prezzo vecchio per Sonnet. */
function oldSeed(): TroupeConfig {
  return {
    ...seed,
    models: {
      ...without(seed.models, 'claude-opus'),
      'claude-sonnet': {
        ...modelOf(seed, 'claude-sonnet'),
        pricing: { unit: 'per_mtok', input: 9, output: 99, checked: '2026-10-01' },
      },
    },
  };
}

describe('il seme di una versione nuova sulla configurazione dell’utente (D95)', () => {
  it('un modello nuovo si aggiunge, uno che l’utente non ha toccato si aggiorna', () => {
    const base = oldSeed();

    const merged = mergeSeed(base, base, seed);

    expect(merged.models['claude-opus']).toEqual(seed.models['claude-opus']);
    expect(merged.models['claude-sonnet']).toEqual(seed.models['claude-sonnet']);
  });

  it('quello che l’utente ha cambiato resta suo', () => {
    const base = oldSeed();
    const screenwriter = roleOf(base, 'screenwriter');
    const current: TroupeConfig = {
      ...base,
      roles: { ...base.roles, screenwriter: { ...screenwriter, label: 'Il mio sceneggiatore' } },
    };

    const merged = mergeSeed(base, current, seed);

    expect(merged.roles.screenwriter?.label).toBe('Il mio sceneggiatore');
  });

  it('una voce tolta dall’utente non torna, una che il seme non ha più resta', () => {
    const base = oldSeed();
    const current: TroupeConfig = {
      ...base,
      models: {
        ...without(base.models, 'claude-haiku'),
        'il-mio-modello': modelOf(base, 'claude-sonnet'),
      },
    };

    const merged = mergeSeed(base, current, seed);

    expect(merged.models['claude-haiku']).toBeUndefined();
    expect(merged.models['il-mio-modello']).toBeDefined();
  });

  it('senza il seme di prima si aggiunge solo il nuovo, e niente dell’utente cambia', () => {
    const current = oldSeed();

    const merged = mergeSeed(undefined, current, seed);

    expect(merged.models['claude-opus']).toEqual(seed.models['claude-opus']);
    expect(merged.models['claude-sonnet']).toEqual(current.models['claude-sonnet']);
  });

  it('i preset nuovi vanno in fondo, l’ordine dell’utente resta', () => {
    const base: TroupeConfig = {
      ...seed,
      presets: { ...seed.presets, genres: seed.presets.genres.slice(1) },
    };
    const current: TroupeConfig = {
      ...base,
      presets: { ...base.presets, genres: [...base.presets.genres].reverse() },
    };

    const merged = mergeSeed(base, current, seed);

    expect(merged.presets.genres.map(({ id }) => id)).toEqual([
      ...current.presets.genres.map(({ id }) => id),
      seed.presets.genres[0]?.id,
    ]);
  });

  it('lo stesso seme due volte non cambia niente', () => {
    expect(mergeSeed(seed, seed, seed)).toEqual(seed);
  });
});

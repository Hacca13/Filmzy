import type { TroupeConfigData } from '@filmzy/contracts';
import { beforeAll, describe, expect, it } from 'vitest';

import { diffConfigs } from './diff.js';
import { loadSeedConfig } from './seed.fixtures.js';

/** Il seme vero: le differenze si provano sulla configurazione che il programma ha davvero. */
let seed: TroupeConfigData;

beforeAll(async () => {
  seed = (await loadSeedConfig());
});

function clone(config: TroupeConfigData): TroupeConfigData {
  return structuredClone(config);
}

describe('diffConfigs', () => {
  it('due configurazioni uguali non hanno differenze', () => {
    expect(diffConfigs(seed, clone(seed))).toEqual([]);
  });

  it("l'ordine delle chiavi non conta", () => {
    const reordered = clone(seed);
    reordered.connections = Object.fromEntries(Object.entries(seed.connections).reverse());

    expect(diffConfigs(seed, reordered)).toEqual([]);
  });

  it('un servizio cambiato dice quale voce e quali campi', () => {
    const after = clone(seed);
    const model = after.models['claude-sonnet'];
    if (model === undefined) throw new Error('il seme non ha claude-sonnet');
    after.models['claude-sonnet'] = { ...model, status: 'retired', label: 'Claude Sonnet (vecchio)' };

    expect(diffConfigs(seed, after)).toEqual([
      {
        section: 'models',
        key: 'claude-sonnet',
        label: 'Claude Sonnet (vecchio)',
        kind: 'changed',
        fields: expect.arrayContaining(['status', 'label']) as string[],
      },
    ]);
  });

  it('un ruolo che cambia servizio', () => {
    const after = clone(seed);
    const role = after.roles.screenwriter;
    if (role === undefined) throw new Error('il seme non ha lo sceneggiatore');
    after.roles.screenwriter = { ...role, model: 'claude-haiku' };

    expect(diffConfigs(seed, after)).toEqual([
      {
        section: 'roles',
        key: 'screenwriter',
        label: 'Sceneggiatore',
        kind: 'changed',
        fields: ['model'],
      },
    ]);
  });

  it('una voce aggiunta e una tolta', () => {
    const after = clone(seed);
    const { fal, ...others } = after.connections;
    after.connections = {
      ...others,
      nuova: { adapter: 'fake', api_key: 'none', timeout_s: 30, max_concurrency: 1, enabled: true },
    };

    const changes = diffConfigs(seed, after);

    expect(fal).toBeDefined();
    expect(changes).toContainEqual({
      section: 'connections',
      key: 'fal',
      label: 'fal',
      kind: 'removed',
      fields: [],
    });
    expect(changes).toContainEqual({
      section: 'connections',
      key: 'nuova',
      label: 'nuova',
      kind: 'added',
      fields: [],
    });
  });

  it('i preset si riconoscono dall\'id dentro la loro categoria', () => {
    const after = clone(seed);
    const [first, ...rest] = after.presets.styles;
    if (first === undefined) throw new Error('il seme non ha stili');
    after.presets.styles = [
      { ...first, description: 'Un\'altra descrizione' },
      ...rest,
      { id: 'nuovo-stile', label: 'Nuovo stile', description: 'd', hint: 'h', enabled: true },
    ];

    expect(diffConfigs(seed, after)).toEqual([
      {
        section: 'presets',
        key: `styles:${first.id}`,
        label: first.label,
        kind: 'changed',
        fields: ['description'],
      },
      {
        section: 'presets',
        key: 'styles:nuovo-stile',
        label: 'Nuovo stile',
        kind: 'added',
        fields: [],
      },
    ]);
  });

  it('funzioni e limiti: un valore alla volta', () => {
    const after = clone(seed);
    after.features.real_people = !after.features.real_people;
    after.limits.max_characters = after.limits.max_characters + 1;

    expect(diffConfigs(seed, after)).toEqual([
      { section: 'features', key: 'real_people', label: 'real_people', kind: 'changed', fields: [] },
      {
        section: 'limits',
        key: 'max_characters',
        label: 'max_characters',
        kind: 'changed',
        fields: [],
      },
    ]);
  });

  it('un limite che compare dal nulla è una differenza', () => {
    const after = clone(seed);
    after.limits.film_budget_usd = 5;

    expect(diffConfigs(seed, after).map((change) => change.key)).toEqual(['film_budget_usd']);
  });
});

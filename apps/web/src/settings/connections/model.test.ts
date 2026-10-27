import type { ConnectionsOverview, ProviderState, ServiceState } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  enabledServiceIds,
  hasLinkedProvider,
  mergedProviders,
  parseUsd,
  serviceGroups,
  usdToField,
  withServiceToggled,
} from './model';

function service(modelId: string, enabled: boolean): ServiceState {
  return {
    modelId,
    label: modelId,
    kind: 'video',
    status: 'active',
    price: { unit: 'per_second', value: 0.1, checked: '2026-10-21' },
    vision: false,
    enabled,
    usable: true,
    isProviderDefault: false,
  };
}

function provider(connectionId: string, services: ServiceState[]): ProviderState {
  return {
    connectionId,
    label: connectionId,
    adapter: 'fal',
    enabled: true,
    keyRequired: true,
    keyWritable: false,
    canTest: true,
    services,
    usedBy: [],
  };
}

describe('enabledServiceIds', () => {
  it('raccoglie i servizi attivati del fornitore da tutti i gruppi, senza doppioni', () => {
    const overview: ConnectionsOverview = {
      hasChoices: true,
      limits: {},
      groups: [
        { group: 'image', providers: [provider('fal', [service('a', true), service('b', false)])] },
        {
          group: 'video',
          providers: [
            provider('fal', [service('c', true)]),
            provider('altro', [service('z', true)]),
          ],
        },
        { group: 'vision', providers: [provider('fal', [service('a', true)])] },
      ],
    };

    expect(enabledServiceIds(overview, 'fal').sort()).toEqual(['a', 'c']);
    expect(enabledServiceIds(overview, 'altro')).toEqual(['z']);
    expect(enabledServiceIds(overview, 'inesistente')).toEqual([]);
  });
});

describe('withServiceToggled', () => {
  it('accende o spegne uno solo, e tiene gli altri', () => {
    expect(withServiceToggled(['a', 'b'], 'c', true)).toEqual(['a', 'b', 'c']);
    expect(withServiceToggled(['a', 'b'], 'a', false)).toEqual(['b']);
    expect(withServiceToggled(['a', 'b'], 'b', true)).toEqual(['a', 'b']);
  });
});

describe('parseUsd', () => {
  it('capisce virgola e punto, e il vuoto è «nessun limite»', () => {
    expect(parseUsd('25')).toBe(25);
    expect(parseUsd(' 12,5 ')).toBe(12.5);
    expect(parseUsd('12.50')).toBe(12.5);
    expect(parseUsd('')).toBeNull();
    expect(parseUsd('   ')).toBeNull();
  });

  it.each(['0', '-3', 'abc', '1,2,3', 'Infinity'])('rifiuta %j', (text) => {
    expect(parseUsd(text)).toBeUndefined();
  });
});

describe('usdToField', () => {
  it('scrive con la virgola, e senza limite il campo è vuoto', () => {
    expect(usdToField(12.5)).toBe('12,5');
    expect(usdToField(25)).toBe('25');
    expect(usdToField(undefined)).toBe('');
  });
});

describe('mergedProviders', () => {
  const fal = (services: ServiceState[]) => provider('fal', services);
  const imageService = { ...service('immagine', true), kind: 'image' as const };

  const overview: ConnectionsOverview = {
    hasChoices: false,
    limits: {},
    groups: [
      { group: 'image', providers: [fal([imageService])] },
      {
        group: 'video',
        defaultConnectionId: 'fal',
        providers: [
          fal([service('clip', false), service('immagine', true)]),
          { ...provider('spento', [service('x', false)]), enabled: false },
        ],
      },
    ],
  };

  it('un fornitore che compare in più gruppi è uno solo, coi servizi di tutti', () => {
    const merged = mergedProviders(overview);

    expect(merged.map((entry) => entry.provider.connectionId)).toEqual(['fal']);
    expect(merged[0]?.provider.services.map((s) => s.modelId).sort()).toEqual(['clip', 'immagine']);
  });

  it("dice i gruppi in cui lavora e se in ognuno c'è già un fornitore di solito", () => {
    expect(mergedProviders(overview)[0]?.groups).toEqual([
      { group: 'image', hasDefault: false },
      { group: 'video', hasDefault: true },
    ]);
  });

  it('i fornitori spenti nella release non si propongono', () => {
    expect(
      mergedProviders(overview).some((entry) => entry.provider.connectionId === 'spento'),
    ).toBe(false);
  });
});

describe('serviceGroups', () => {
  it('il gruppo del tipo, e «Lettura immagini» se il servizio sa leggerle', () => {
    expect(serviceGroups({ ...service('t', true), kind: 'llm' })).toEqual(['text']);
    expect(serviceGroups({ ...service('t', true), kind: 'llm', vision: true })).toEqual([
      'text',
      'vision',
    ]);
    expect(serviceGroups({ ...service('m', true), kind: 'music' })).toEqual(['audio']);
  });
});

describe('hasLinkedProvider', () => {
  const linked = (extra: Partial<ProviderState>): ConnectionsOverview => ({
    hasChoices: true,
    limits: {},
    groups: [
      { group: 'video', providers: [{ ...provider('fal', [service('c', true)]), ...extra }] },
    ],
  });

  it('serve un fornitore acceso, con la chiave e un servizio attivato e utilizzabile', () => {
    expect(hasLinkedProvider(linked({ key: { name: 'FAL_KEY', present: true } }))).toBe(true);
  });

  it('senza la chiave, o spento, o senza servizi, non conta', () => {
    expect(hasLinkedProvider(linked({ key: { name: 'FAL_KEY', present: false } }))).toBe(false);
    expect(
      hasLinkedProvider(linked({ enabled: false, key: { name: 'FAL_KEY', present: true } })),
    ).toBe(false);
    expect(
      hasLinkedProvider(
        linked({ services: [service('c', false)], key: { name: 'FAL_KEY', present: true } }),
      ),
    ).toBe(false);
  });

  it('un fornitore che non vuole la chiave (il finto) è collegato con un servizio attivato', () => {
    expect(hasLinkedProvider(linked({ keyRequired: false }))).toBe(true);
  });
});

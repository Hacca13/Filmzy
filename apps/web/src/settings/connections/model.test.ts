import type { ConnectionsOverview, ProviderState, ServiceState } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { enabledServiceIds, parseUsd, usdToField, withServiceToggled } from './model';

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

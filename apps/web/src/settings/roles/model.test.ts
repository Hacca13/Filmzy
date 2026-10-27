import type { RoleState } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  AS_DEFAULT,
  parseTemperature,
  problemText,
  roleSummary,
  selectedService,
  temperatureToField,
} from './model';

function role(extra: Partial<RoleState> = {}): RoleState {
  return {
    roleId: 'screenwriter',
    label: 'Sceneggiatore',
    kind: 'llm',
    group: 'text',
    enabled: true,
    inUse: {
      connectionId: 'anthropic',
      connectionLabel: 'Anthropic',
      modelId: 'claude-sonnet',
      modelLabel: 'Claude Sonnet',
    },
    providers: [],
    instructions: { label: 'Versione 2', recommended: true, newerAvailable: false },
    ...extra,
  };
}

describe('roleSummary', () => {
  it('ruolo, fornitore, servizio e versione delle istruzioni', () => {
    expect(roleSummary(role())).toBe('Sceneggiatore · Anthropic · Claude Sonnet · Versione 2');
  });

  it('senza servizio dice perché', () => {
    const stuck = role({ inUse: undefined, problem: 'role_disabled', instructions: undefined });

    expect(roleSummary(stuck)).toBe('Sceneggiatore · Spento');
  });
});

describe('problemText', () => {
  it('ogni problema ha una frase semplice, senza codici', () => {
    for (const problem of [
      'role_disabled',
      'no_eligible_model',
      'config_invalid',
      'timeout',
    ] as const) {
      const text = problemText(role({ inUse: undefined, problem }));

      expect(text, problem).toBeDefined();
      expect(text, problem).not.toContain(problem);
    }
  });

  it('senza problema non dice niente', () => {
    expect(problemText(role())).toBeUndefined();
  });
});

describe('selectedService', () => {
  it('quello scelto per il ruolo, o «come da programma»', () => {
    expect(selectedService(role({ chosenModelId: 'claude-haiku' }))).toBe('claude-haiku');
    expect(selectedService(role())).toBe(AS_DEFAULT);
  });
});

describe('parseTemperature', () => {
  const limits = { min: 0, max: 1 };

  it('capisce virgola e punto, e il vuoto torna al valore del programma', () => {
    expect(parseTemperature('0,7', limits)).toBe(0.7);
    expect(parseTemperature('0.25', limits)).toBe(0.25);
    expect(parseTemperature('', limits)).toBeNull();
  });

  it.each(['abc', '1,5', '-0,1'])('rifiuta %j fuori dai limiti o non numerico', (text) => {
    expect(parseTemperature(text, limits)).toBeUndefined();
  });

  it('senza limiti accetta qualunque numero', () => {
    expect(parseTemperature('5', {})).toBe(5);
  });
});

describe('temperatureToField', () => {
  it("con la virgola, vuoto se non c'è", () => {
    expect(temperatureToField(0.7)).toBe('0,7');
    expect(temperatureToField(undefined)).toBe('');
  });
});

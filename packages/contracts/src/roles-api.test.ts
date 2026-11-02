import { describe, expect, it } from 'vitest';

import {
  roleChangeResultSchema,
  rolesOverviewSchema,
  setRoleServiceBodySchema,
  setRoleTemperatureBodySchema,
} from './roles-api.js';

describe('setRoleServiceBodySchema', () => {
  it('un servizio, oppure null per tornare a quello della release', () => {
    expect(setRoleServiceBodySchema.parse({ modelId: 'claude-sonnet' })).toEqual({
      modelId: 'claude-sonnet',
    });
    expect(setRoleServiceBodySchema.parse({ modelId: null })).toEqual({ modelId: null });
  });

  it.each([{}, { modelId: 'Claude Sonnet' }, { modelId: 3 }])('rifiuta %j', (body) => {
    expect(setRoleServiceBodySchema.safeParse(body).success).toBe(false);
  });
});

describe('setRoleTemperatureBodySchema', () => {
  it('un numero, oppure null per tornare al valore del programma', () => {
    expect(setRoleTemperatureBodySchema.parse({ value: 0.7 })).toEqual({ value: 0.7 });
    expect(setRoleTemperatureBodySchema.parse({ value: null })).toEqual({ value: null });
  });

  it.each([{}, { value: '0.7' }, { value: Infinity }])('rifiuta %j', (body) => {
    expect(setRoleTemperatureBodySchema.safeParse(body).success).toBe(false);
  });
});

describe('rolesOverviewSchema', () => {
  const role = {
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
    chosenModelId: 'claude-sonnet',
    providers: [
      {
        connectionId: 'anthropic',
        label: 'Anthropic',
        services: [{ modelId: 'claude-sonnet', label: 'Claude Sonnet' }],
      },
    ],
    temperature: { value: 0.7, min: 0, max: 1, chosen: true },
    instructions: { label: 'Versione 2', recommended: true, newerAvailable: false },
  };

  it('un ruolo con servizio in uso, alternative, creatività e istruzioni', () => {
    expect(rolesOverviewSchema.parse({ roles: [role] })).toEqual({ roles: [role] });
  });

  it('un ruolo senza servizio idoneo dice perché', () => {
    const stuck = { ...role, inUse: undefined, problem: 'no_eligible_model', providers: [] };

    expect(rolesOverviewSchema.parse({ roles: [stuck] }).roles[0]?.problem).toBe(
      'no_eligible_model',
    );
  });
});

describe('roleChangeResultSchema', () => {
  it('dice cosa si è scartato cambiando servizio', () => {
    const result = roleChangeResultSchema.parse({
      overview: { roles: [] },
      discarded: ['temperature'],
    });

    expect(result.discarded).toEqual(['temperature']);
    expect(
      roleChangeResultSchema.safeParse({ overview: { roles: [] }, discarded: ['altro'] }).success,
    ).toBe(false);
  });
});

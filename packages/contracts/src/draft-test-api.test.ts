import { describe, expect, it } from 'vitest';

import {
  draftTestEstimateSchema,
  draftTestResultSchema,
  testableRolesSchema,
} from './draft-test-api.js';

const receipt = {
  id: 'g-1',
  role: 'cinematographer',
  purpose: 'draft_test',
  releaseId: 'bozza',
  roleConfigHash: 'abc',
  modelId: 'finto',
  modelLabel: 'Finto',
  connectionId: 'fake',
  providerModel: 'finto-1',
  inputHash: 'in',
  idempotencyKey: 'key',
  status: 'succeeded',
  attempts: 1,
  estimatedCostUsd: 0.004,
  actualCostUsd: 0.003,
  createdAt: '2026-10-27T10:00:00.000Z',
};

describe('testableRolesSchema', () => {
  it("un elenco di ruoli con il nome per l'utente", () => {
    const roles = { roles: [{ roleId: 'cinematographer', label: 'Direttore della fotografia' }] };
    expect(testableRolesSchema.parse(roles)).toEqual(roles);
  });

  it('rifiuta un ruolo senza nome', () => {
    expect(testableRolesSchema.safeParse({ roles: [{ roleId: 'x', label: '' }] }).success).toBe(
      false,
    );
  });
});

describe('draftTestEstimateSchema', () => {
  it("servizio, costo e l'esempio che si proverebbe", () => {
    const estimate = {
      estimate: { modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: 0.004 },
      example: { idea: 'una storia' },
    };
    expect(draftTestEstimateSchema.parse(estimate)).toEqual(estimate);
  });

  it('un costo negativo non esiste', () => {
    expect(
      draftTestEstimateSchema.safeParse({
        estimate: { modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: -1 },
        example: {},
      }).success,
    ).toBe(false);
  });
});

describe('draftTestResultSchema', () => {
  it('esempio, risultato e scontrino della prova', () => {
    const result = { example: { a: 1 }, output: { prompt: 'x' }, receipt };
    expect(draftTestResultSchema.parse(result)).toEqual(result);
  });

  it('senza scontrino non è una prova valida: ogni chiamata ne produce uno', () => {
    expect(draftTestResultSchema.safeParse({ example: {}, output: {} }).success).toBe(false);
  });
});

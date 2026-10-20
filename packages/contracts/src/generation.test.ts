import { describe, expect, it } from 'vitest';

import { GENERATION_PURPOSES, generationContextSchema, modelOptionSchema } from './generation.js';

describe('generationContextSchema', () => {
  it.each(GENERATION_PURPOSES)('accetta lo scopo %j', (purpose) => {
    expect(generationContextSchema.parse({ purpose }).purpose).toBe(purpose);
  });

  it("accetta un modelId scelto dall'utente per questa generazione (D36)", () => {
    const ctx = {
      projectId: 'proj-1',
      shotId: 'shot-1',
      purpose: 'product' as const,
      modelId: 'kling-o3-standard',
    };
    expect(generationContextSchema.parse(ctx)).toEqual(ctx);
  });

  it('rifiuta uno scopo inventato', () => {
    expect(generationContextSchema.safeParse({ purpose: 'preview' }).success).toBe(false);
  });
});

describe('modelOptionSchema', () => {
  it('accetta un servizio mai provato (senza quality)', () => {
    const option = {
      modelId: 'seedance-2',
      label: 'Seedance 2',
      estimatedCostUsd: 0.75,
      isDefault: false,
    };
    expect(modelOptionSchema.parse(option)).toEqual(option);
  });

  it('accetta un servizio con voto delle prove', () => {
    const option = {
      modelId: 'kling-o3-standard',
      label: 'Kling O3 · Standard',
      estimatedCostUsd: 1.12,
      quality: 4,
      isDefault: true,
    };
    expect(modelOptionSchema.parse(option).quality).toBe(4);
  });

  it('rifiuta un costo negativo', () => {
    expect(
      modelOptionSchema.safeParse({
        modelId: 'x',
        label: 'X',
        estimatedCostUsd: -1,
        isDefault: false,
      }).success,
    ).toBe(false);
  });
});

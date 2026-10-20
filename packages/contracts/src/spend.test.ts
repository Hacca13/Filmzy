import { describe, expect, it } from 'vitest';

import { estimateSchema, spendCapSchema } from './spend.js';

describe('estimateSchema', () => {
  it('accetta il servizio fissato con il suo costo (architettura §4.1)', () => {
    const estimate = {
      modelId: 'kling-o3-standard',
      modelLabel: 'Kling O3 · Standard',
      estimatedCostUsd: 1.12,
    };
    expect(estimateSchema.parse(estimate)).toEqual(estimate);
  });
});

describe('spendCapSchema', () => {
  it('accetta nessun tetto: senza preimpostati (D36)', () => {
    expect(spendCapSchema.parse({})).toEqual({});
  });

  it('accetta solo il tetto per film', () => {
    expect(spendCapSchema.parse({ filmBudgetUsd: 50 }).filmBudgetUsd).toBe(50);
  });

  it('accetta tetti mensili per connessione e per modello', () => {
    const caps = {
      monthlyByConnection: { fal: 100 },
      monthlyByModel: { 'kling-o3-standard': 40 },
      confirmAboveUsd: 2,
    };
    expect(spendCapSchema.parse(caps)).toEqual(caps);
  });

  it('rifiuta un tetto negativo', () => {
    expect(spendCapSchema.safeParse({ filmBudgetUsd: -1 }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { GENERATION_STATUSES, generationReceiptSchema, generationStatusSchema } from './receipt.js';

describe('generationStatusSchema', () => {
  it.each(GENERATION_STATUSES)('accetta %j', (status) => {
    expect(generationStatusSchema.parse(status)).toBe(status);
  });
});

describe('generationReceiptSchema', () => {
  const base = {
    id: 'gen-1',
    role: 'camera_operator' as const,
    purpose: 'product' as const,
    projectId: 'proj-1',
    shotId: 'shot-1',
    releaseId: 'release-3',
    roleConfigHash: 'abc123',
    modelId: 'kling-o3-standard',
    modelLabel: 'Kling O3 · Standard',
    connectionId: 'fal',
    providerModel: 'kling-o3-standard-ref-to-video',
    inputHash: 'def456',
    idempotencyKey: 'shot-1:kling-o3-standard:def456',
    status: 'succeeded' as const,
    attempts: 1,
    estimatedCostUsd: 1.12,
    actualCostUsd: 1.08,
    createdAt: '2026-10-20T19:00:00.000Z',
  };

  it('accetta uno scontrino di successo', () => {
    expect(generationReceiptSchema.parse(base).status).toBe('succeeded');
  });

  it('accetta uno scontrino di un rifiuto, senza riserve (D36)', () => {
    const rejected = {
      ...base,
      status: 'failed' as const,
      errorCode: 'content_rejected' as const,
      actualCostUsd: undefined,
    };
    expect(generationReceiptSchema.parse(rejected).errorCode).toBe('content_rejected');
  });

  it('rifiuta una data di creazione non ISO', () => {
    expect(generationReceiptSchema.safeParse({ ...base, createdAt: '20/10/2026' }).success).toBe(
      false,
    );
  });

  it('rifiuta un ruolo inventato', () => {
    expect(generationReceiptSchema.safeParse({ ...base, role: 'director' }).success).toBe(false);
  });
});

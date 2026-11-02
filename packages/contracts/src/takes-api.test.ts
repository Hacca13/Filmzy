import { describe, expect, it } from 'vitest';

import {
  VIDEO_PROMPT_MAX_CHARS,
  shotTakeSchema,
  shotTakesSchema,
  takeJobPayloadSchema,
} from './takes-api.js';

const take = {
  id: 't-1',
  status: 'succeeded',
  modelId: 'kling-o3-standard',
  modelLabel: 'Kling · Standard',
  assetId: 'a1',
  costUsd: 0.42,
  createdAt: '2026-11-02T10:00:00.000Z',
};

describe('shotTakeSchema', () => {
  it('un take riuscito dice con quale servizio è stato fatto e quanto è costato', () => {
    const parsed = shotTakeSchema.parse(take);

    expect(parsed.modelLabel).toBe('Kling · Standard');
    expect(parsed.costUsd).toBe(0.42);
  });

  it('un take in coda o fallito non ha la clip né il costo, e il fallito dice perché', () => {
    const { assetId: _asset, costUsd: _cost, ...bare } = take;

    expect(shotTakeSchema.parse({ ...bare, status: 'queued' }).assetId).toBeUndefined();
    expect(
      shotTakeSchema.parse({ ...bare, status: 'failed', errorCode: 'timeout' }).errorCode,
    ).toBe('timeout');
  });

  it('rifiuta uno stato inventato, un costo negativo e un servizio senza nome', () => {
    expect(shotTakeSchema.safeParse({ ...take, status: 'boh' }).success).toBe(false);
    expect(shotTakeSchema.safeParse({ ...take, costUsd: -1 }).success).toBe(false);
    expect(shotTakeSchema.safeParse({ ...take, modelLabel: '' }).success).toBe(false);
  });
});

describe('shotTakesSchema e takeJobPayloadSchema', () => {
  it('i take di un’inquadratura sono un elenco, anche vuoto', () => {
    expect(shotTakesSchema.parse({ shotId: 's-1', takes: [] }).takes).toEqual([]);
    expect(shotTakesSchema.parse({ shotId: 's-1', takes: [take] }).takes).toHaveLength(1);
  });

  it('il lavoro in coda porta il film, l’inquadratura, il take e il servizio scelto', () => {
    const payload = { projectId: 'p', shotId: 's-1', takeId: 't-1', modelId: 'seedance-2' };

    expect(takeJobPayloadSchema.parse(payload)).toEqual(payload);
    expect(takeJobPayloadSchema.safeParse({ ...payload, modelId: 'Nome Con Spazi' }).success).toBe(
      false,
    );
  });

  it('il prompt di un video ha un limite sensato', () => {
    expect(VIDEO_PROMPT_MAX_CHARS).toBeGreaterThan(200);
  });
});

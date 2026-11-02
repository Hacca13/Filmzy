import { describe, expect, it } from 'vitest';

import {
  STORYBOARD_PROMPT_MAX_CHARS,
  chooseStoryboardBodySchema,
  shotStoryboardSchema,
  storyboardJobPayloadSchema,
} from './storyboard-api.js';

const attempt = {
  attempt: 1,
  status: 'succeeded',
  createdAt: '2026-11-02T10:00:00.000Z',
  assetIds: ['a', 'b', 'c'],
};

describe('shotStoryboardSchema', () => {
  it('porta i tentativi dal più recente e, se c’è, la variante scelta', () => {
    const parsed = shotStoryboardSchema.parse({
      shotId: 's-1',
      attempts: [attempt],
      chosenAssetId: 'b',
    });

    expect(parsed.chosenAssetId).toBe('b');
    expect(
      shotStoryboardSchema.parse({ shotId: 's-1', attempts: [] }).chosenAssetId,
    ).toBeUndefined();
  });

  it('rifiuta uno stato inventato e un tentativo senza numero', () => {
    expect(
      shotStoryboardSchema.safeParse({ shotId: 's-1', attempts: [{ ...attempt, status: 'boh' }] })
        .success,
    ).toBe(false);
    expect(
      shotStoryboardSchema.safeParse({
        shotId: 's-1',
        attempts: [{ ...attempt, attempt: undefined }],
      }).success,
    ).toBe(false);
  });
});

describe('storyboardJobPayloadSchema', () => {
  it('serve il film, l’inquadratura, il numero del tentativo e il servizio scelto', () => {
    const payload = { projectId: 'p', shotId: 's-1', attempt: 2, modelId: 'nano-banana-2' };

    expect(storyboardJobPayloadSchema.parse(payload)).toEqual(payload);
    expect(storyboardJobPayloadSchema.safeParse({ ...payload, attempt: 0 }).success).toBe(false);
    expect(
      storyboardJobPayloadSchema.safeParse({ ...payload, modelId: 'Nome Con Spazi' }).success,
    ).toBe(false);
  });
});

describe('STORYBOARD_PROMPT_MAX_CHARS', () => {
  it('è un limite sensato per un prompt di immagine', () => {
    expect(STORYBOARD_PROMPT_MAX_CHARS).toBeGreaterThan(200);
  });
});

describe('chooseStoryboardBodySchema', () => {
  it('vuole solo l’immagine scelta', () => {
    expect(chooseStoryboardBodySchema.parse({ assetId: 'b' })).toEqual({ assetId: 'b' });
    expect(chooseStoryboardBodySchema.safeParse({}).success).toBe(false);
    expect(chooseStoryboardBodySchema.safeParse({ assetId: 'b', altro: 1 }).success).toBe(false);
  });
});

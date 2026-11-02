import { describe, expect, it } from 'vitest';

import {
  MAX_SHOT_REFERENCES,
  setShotImagesBodySchema,
  shotImagesSchema,
} from './shot-images-api.js';

describe('setShotImagesBodySchema', () => {
  it('accetta immagini col loro ruolo, o nessuna (decide l’aiuto regista)', () => {
    expect(setShotImagesBodySchema.parse({ images: [] })).toEqual({ images: [] });
    expect(
      setShotImagesBodySchema.parse({
        images: [
          { use: 'first_frame', assetId: 'a' },
          { use: 'last_frame', assetId: 'b' },
          { use: 'reference', assetId: 'c' },
        ],
      }).images,
    ).toHaveLength(3);
  });

  it('rifiuta un ruolo inventato, una chiave in più e troppe immagini', () => {
    expect(
      setShotImagesBodySchema.safeParse({ images: [{ use: 'sfondo', assetId: 'a' }] }).success,
    ).toBe(false);
    expect(
      setShotImagesBodySchema.safeParse({
        images: [{ use: 'reference', assetId: 'a', from: 'upload' }],
      }).success,
    ).toBe(false);
    const many = Array.from({ length: MAX_SHOT_REFERENCES + 3 }, (_, index) => ({
      use: 'reference' as const,
      assetId: `a${String(index)}`,
    }));
    expect(setShotImagesBodySchema.safeParse({ images: many }).success).toBe(false);
  });
});

describe('shotImagesSchema', () => {
  it('porta le immagini impostate, quelle tra cui scegliere e i servizi video che le accettano', () => {
    const parsed = shotImagesSchema.parse({
      shotId: 's-1',
      images: [{ use: 'first_frame', from: 'generate', assetId: 'a' }],
      candidates: [{ assetId: 'a', mode: 'storyboard', attempt: 1 }],
      videoServices: 0,
    });

    expect(parsed.videoServices).toBe(0);
    expect(shotImagesSchema.safeParse({ ...parsed, videoServices: -1 }).success).toBe(false);
  });
});

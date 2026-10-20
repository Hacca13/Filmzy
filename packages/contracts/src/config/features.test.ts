import { describe, expect, it } from 'vitest';

import { featuresFileSchema, featuresSchema, limitsSchema } from './features.js';

describe('featuresSchema', () => {
  it('accetta le undici funzioni del seme, tutte spente nell\'MVP', () => {
    const features = {
      real_people: false,
      dialogue: false,
      dubbing: false,
      music: false,
      sound_effects: false,
      preview_gate: false,
      keyframes: false,
      image_upload: false,
      retouch: false,
      moodboard: false,
      c2pa_marking: false,
    };
    expect(featuresSchema.parse(features)).toEqual(features);
  });

  it('rifiuta una funzione mancante', () => {
    const incomplete: Partial<ReturnType<typeof featuresSchema.parse>> = featuresSchema.parse({
      real_people: false,
      dialogue: false,
      dubbing: false,
      music: false,
      sound_effects: false,
      preview_gate: false,
      keyframes: false,
      image_upload: false,
      retouch: false,
      moodboard: false,
      c2pa_marking: false,
    });
    delete incomplete.c2pa_marking;
    expect(featuresSchema.safeParse(incomplete).success).toBe(false);
  });

  it('rifiuta una funzione inventata', () => {
    expect(
      featuresSchema.safeParse({
        real_people: false,
        dialogue: false,
        dubbing: false,
        music: false,
        sound_effects: false,
        preview_gate: false,
        keyframes: false,
        image_upload: false,
        retouch: false,
        moodboard: false,
        c2pa_marking: false,
        video_edit: false,
      }).success,
    ).toBe(false);
  });
});

describe('limitsSchema', () => {
  it('accetta solo max_characters, senza tetti preimpostati (D36)', () => {
    expect(limitsSchema.parse({ max_characters: 2 })).toEqual({ max_characters: 2 });
  });
});

describe('featuresFileSchema', () => {
  it('accetta il file completo', () => {
    const file = {
      version: 1 as const,
      features: {
        real_people: false,
        dialogue: false,
        dubbing: false,
        music: false,
        sound_effects: false,
        preview_gate: false,
        keyframes: false,
        image_upload: false,
        retouch: false,
        moodboard: false,
        c2pa_marking: false,
      },
      limits: { max_characters: 2 },
    };
    expect(featuresFileSchema.parse(file).limits.max_characters).toBe(2);
  });
});

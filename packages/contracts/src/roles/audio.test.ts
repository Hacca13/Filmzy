import { describe, expect, it } from 'vitest';

import { composerInputSchema, sfxArtistInputSchema } from './audio.js';

const style = {
  id: 'realistic',
  label: 'Realistico',
  description: 'Ripresa dal vero',
  hint: 'photorealistic live-action film still',
  enabled: true,
};

describe('composer', () => {
  it('accetta un cue con atmosfera e durata', () => {
    const input = {
      cue: { description: 'tema malinconico per il finale', mood: 'bittersweet', durationS: 30 },
      genre: 'drama',
      tone: 'moving',
      style,
    };
    expect(composerInputSchema.parse(input).cue.durationS).toBe(30);
  });
});

describe('sfx_artist', () => {
  it('accetta un cue con tre varianti', () => {
    const input = { cue: { description: 'passi sulla ghiaia', durationS: 1 }, variants: 3 };
    expect(sfxArtistInputSchema.parse(input).variants).toBe(3);
  });

  it('rifiuta una durata zero', () => {
    expect(
      sfxArtistInputSchema.safeParse({ cue: { description: 'x', durationS: 0 }, variants: 3 })
        .success,
    ).toBe(false);
  });
});

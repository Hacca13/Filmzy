import { describe, expect, it } from 'vitest';

import { exampleGenre, exampleStyle, exampleTone } from '../examples.fixtures.js';
import { composerInputSchema, sfxArtistInputSchema } from './audio.js';

describe('composer', () => {
  it('dà alle istruzioni genere, tono e stile come oggetti (`{{ genre.id }}`)', () => {
    const parsed = composerInputSchema.parse({
      cue: { description: 'tema malinconico per il finale', mood: 'bittersweet', durationS: 30 },
      genre: exampleGenre,
      tone: exampleTone,
      style: exampleStyle,
    });
    expect(parsed.genre.id).toBe('drama');
    expect(parsed.tone.id).toBe('moving');
    expect(parsed.style.id).toBe('realistic');
    expect(parsed.cue.durationS).toBe(30);
  });

  it('rifiuta un genere passato come stringa', () => {
    expect(
      composerInputSchema.safeParse({
        cue: { description: 'x', mood: 'x', durationS: 30 },
        genre: 'drama',
        tone: exampleTone,
        style: exampleStyle,
      }).success,
    ).toBe(false);
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

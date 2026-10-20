import { describe, expect, it } from 'vitest';

import { acceptedElementSchema, screenplaySceneSchema, screenplaySchema } from './screenplay.js';

describe('screenplaySceneSchema', () => {
  it('accetta una scena della bozza, con beats vuoti', () => {
    const scene = {
      number: 1,
      heading: 'La piazza, tramonto',
      timeOfDay: 'tramonto',
      characterIds: ['anna'],
      summary: 'Anna attraversa la piazza e incontra Tomás',
      beats: [],
      durationS: 20,
    };
    expect(screenplaySceneSchema.parse(scene)).toEqual(scene);
  });
});

describe('screenplaySchema', () => {
  it('accetta una bozza con proposte di personaggi e luoghi', () => {
    const draft = {
      title: 'Il corto di Anna',
      logline: 'Una donna torna nella sua città natale',
      characters: [{ id: 'anna', name: 'Anna', role: 'protagonist' }],
      locations: [
        {
          id: 'piazza',
          name: 'La piazza',
          description: 'Piazza centrale',
          prompt: 'a small town square at sunset',
        },
      ],
      scenes: [
        {
          number: 1,
          heading: 'La piazza, tramonto',
          timeOfDay: 'tramonto',
          characterIds: ['anna'],
          summary: 'Anna attraversa la piazza',
          beats: [],
          durationS: 20,
        },
      ],
    };
    expect(screenplaySchema.parse(draft).notes).toBeUndefined();
  });

  it('accetta una stesura finale con proposte vuote (architettura §5.3)', () => {
    const final = {
      title: 'Il corto di Anna',
      logline: 'Una donna torna nella sua città natale',
      characters: [],
      locations: [],
      scenes: [],
    };
    expect(screenplaySchema.parse(final).characters).toHaveLength(0);
  });
});

describe('acceptedElementSchema', () => {
  it('accetta un elemento tenuto come comparsa', () => {
    expect(acceptedElementSchema.parse({ kind: 'character', name: "l'oste" }).kind).toBe(
      'character',
    );
  });
});

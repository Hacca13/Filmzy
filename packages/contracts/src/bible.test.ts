import { describe, expect, it } from 'vitest';

import { characterSchema, locationSchema, storyBibleSchema } from './bible.js';

const exampleCharacter = {
  id: 'anna',
  name: 'Anna',
  tag: 'protagonist',
  role: 'protagonist',
  description: 'Una donna sui 35 anni che torna nella sua città natale',
  appearance: {
    apparentAge: '35',
    build: 'media',
    hair: 'riccia, rossa, raccolta',
    face: 'lentiggini, sorriso aperto',
    clothing: 'giacca di jeans chiara',
    prompt: 'a woman in her mid-30s, curly red hair, freckles, light denim jacket',
  },
  sheet: [{ assetId: 'asset-1' }, { assetId: 'asset-2' }, { assetId: 'asset-3' }],
};

describe('characterSchema', () => {
  it('accetta un personaggio senza i campi facoltativi del profilo (D22)', () => {
    expect(characterSchema.parse(exampleCharacter).id).toBe('anna');
  });

  it('accetta un personaggio con il profilo e il proposalId', () => {
    const character = {
      ...exampleCharacter,
      profile: { personality: 'curiosa', goal: 'ritrovare un vecchio amico' },
      proposalId: 'proposal-1',
    };
    expect(characterSchema.parse(character).profile?.personality).toBe('curiosa');
  });

  it('rifiuta un personaggio senza aspetto', () => {
    const invalid: Partial<typeof exampleCharacter> = { ...exampleCharacter };
    delete invalid.appearance;
    expect(characterSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('locationSchema', () => {
  it('accetta un luogo con il prompt in inglese', () => {
    const location = {
      id: 'piazza',
      name: 'La piazza del paese',
      description: 'Piazza centrale al tramonto',
      prompt: 'a small town square at sunset, warm light',
      references: [{ assetId: 'asset-4' }],
    };
    expect(locationSchema.parse(location).id).toBe('piazza');
  });
});

describe('storyBibleSchema', () => {
  it('accetta una Bibbia completa senza moodboard (D37)', () => {
    const bible = {
      project: {
        id: 'proj-1',
        title: 'Il corto di Anna',
        idea: 'Una donna torna nella sua città natale',
        genre: 'drama',
        tone: 'moving',
        language: 'it',
        durationS: 60,
      },
      style: {
        id: 'realistic',
        label: 'Realistico',
        description: 'Ripresa dal vero',
        hint: 'photorealistic live-action film still',
        enabled: true,
      },
      cinematography: {
        id: 'handheld_warm',
        label: 'Camera a mano, luce calda',
        description: 'Vicina ai personaggi',
        camera: 'handheld camera',
        lighting: 'warm practical lights',
        lens: '35mm',
        grade: 'warm tones',
        enabled: true,
      },
      characters: [exampleCharacter],
      locations: [],
      limits: { maxCharacters: 2 },
    };
    const parsed = storyBibleSchema.parse(bible);
    expect(parsed.moodboard).toBeUndefined();
  });
});

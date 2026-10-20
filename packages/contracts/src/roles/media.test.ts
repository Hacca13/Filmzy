import { describe, expect, it } from 'vitest';

import {
  cameraOperatorInputSchema,
  characterDesignerInputSchema,
  moodboardArtistInputSchema,
  retoucherInputSchema,
  setDesignerInputSchema,
  storyboardArtistInputSchema,
} from './media.js';

const style = {
  id: 'realistic',
  label: 'Realistico',
  description: 'Ripresa dal vero',
  hint: 'photorealistic live-action film still',
  enabled: true,
};

const character = {
  id: 'anna',
  name: 'Anna',
  tag: 'protagonist',
  role: 'protagonist',
  description: 'Una donna sui 35 anni',
  appearance: {
    apparentAge: '35',
    build: 'media',
    hair: 'riccia rossa',
    face: 'lentiggini',
    clothing: 'giacca di jeans',
    prompt: 'a woman in her mid-30s with curly red hair',
  },
  sheet: [],
};

describe('character_designer', () => {
  it("accetta un'angolazione con moodboard assente (§4.4)", () => {
    expect(
      characterDesignerInputSchema.parse({
        character,
        style,
        angle: 'three_quarter',
        moodboard: null,
      }).angle,
    ).toBe('three_quarter');
  });

  it("rifiuta un'angolazione inventata", () => {
    expect(
      characterDesignerInputSchema.safeParse({ character, style, angle: 'back', moodboard: null })
        .success,
    ).toBe(false);
  });
});

describe('set_designer', () => {
  it('accetta un luogo con tre varianti', () => {
    const location = {
      id: 'piazza',
      name: 'La piazza',
      description: 'Piazza centrale',
      prompt: 'a small town square at sunset',
      references: [],
    };
    expect(
      setDesignerInputSchema.parse({ location, style, variants: 3, moodboard: null }).variants,
    ).toBe(3);
  });
});

describe('moodboard_artist', () => {
  it('accetta un prompt in inglese dal moodboard designer', () => {
    expect(
      moodboardArtistInputSchema.parse({ prompt: 'a warm lit alley at dusk', style, variants: 2 })
        .variants,
    ).toBe(2);
  });
});

describe('retoucher', () => {
  it("accetta un'operazione di sostituzione con istruzione in italiano (D21)", () => {
    const input = {
      image: { assetId: 'asset-1' },
      mask: { assetId: 'asset-2' },
      operation: 'replace' as const,
      instruction: 'sostituisci la lampada con un lampione',
      style,
    };
    expect(retoucherInputSchema.parse(input).operation).toBe('replace');
  });

  it("rifiuta un'operazione inventata", () => {
    expect(
      retoucherInputSchema.safeParse({
        image: { assetId: 'asset-1' },
        mask: { assetId: 'asset-2' },
        operation: 'blur',
        style,
      }).success,
    ).toBe(false);
  });
});

describe('storyboard_artist', () => {
  it('accetta il modo storyboard con riferimenti', () => {
    const input = {
      mode: 'storyboard' as const,
      visualPrompt: { prompt: 'close up, woman smiles' },
      references: [{ assetId: 'asset-1' }],
      variants: 3,
      moodboard: null,
    };
    expect(storyboardArtistInputSchema.parse(input).mode).toBe('storyboard');
  });

  it('accetta il modo end_frame con il primo fotogramma (D20)', () => {
    const input = {
      mode: 'end_frame' as const,
      visualPrompt: { prompt: 'the camera has moved closer' },
      references: [],
      variants: 1,
      baseImage: { assetId: 'asset-1' },
      moodboard: null,
    };
    expect(storyboardArtistInputSchema.parse(input).baseImage?.assetId).toBe('asset-1');
  });
});

describe('camera_operator', () => {
  it('accetta prompt visivo, riferimenti e durata', () => {
    const input = {
      visualPrompt: { prompt: 'close up, woman smiles, golden hour light' },
      references: [{ assetId: 'asset-1' }],
      durationS: 5,
    };
    expect(cameraOperatorInputSchema.parse(input).durationS).toBe(5);
  });
});

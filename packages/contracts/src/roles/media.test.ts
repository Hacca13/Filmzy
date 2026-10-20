import { describe, expect, it } from 'vitest';

import { exampleCharacter, exampleLocation, exampleStyle } from '../examples.js';
import {
  cameraOperatorInputSchema,
  characterDesignerInputSchema,
  moodboardArtistInputSchema,
  retoucherInputSchema,
  setDesignerInputSchema,
  storyboardArtistInputSchema,
} from './media.js';

describe('character_designer', () => {
  it("accetta un'angolazione con moodboard a null (§4.4)", () => {
    expect(
      characterDesignerInputSchema.parse({
        character: exampleCharacter,
        style: exampleStyle,
        angle: 'three_quarter',
        moodboard: null,
      }).angle,
    ).toBe('three_quarter');
  });

  it("rifiuta un'angolazione inventata", () => {
    expect(
      characterDesignerInputSchema.safeParse({
        character: exampleCharacter,
        style: exampleStyle,
        angle: 'back',
        moodboard: null,
      }).success,
    ).toBe(false);
  });
});

describe('set_designer', () => {
  it('accetta un luogo con tre varianti', () => {
    const parsed = setDesignerInputSchema.parse({
      location: exampleLocation,
      style: exampleStyle,
      variants: 3,
      moodboard: null,
    });
    // Le istruzioni leggono location.prompt e style.hint.
    expect(parsed.location.prompt).toContain('sunset');
    expect(parsed.style.hint).toContain('photorealistic');
  });
});

describe('moodboard_artist', () => {
  it('accetta un prompt in inglese dal moodboard designer', () => {
    expect(
      moodboardArtistInputSchema.parse({
        prompt: 'a warm lit alley at dusk',
        style: exampleStyle,
        variants: 2,
      }).variants,
    ).toBe(2);
  });
});

describe('retoucher', () => {
  it('accetta una sostituzione con istruzione in italiano (D21)', () => {
    const parsed = retoucherInputSchema.parse({
      image: { assetId: 'asset-1' },
      mask: { assetId: 'asset-2' },
      operation: 'replace',
      instruction: 'sostituisci la lampada con un lampione',
      style: exampleStyle,
    });
    expect(parsed.operation).toBe('replace');
  });

  it("pretende instruction come null quando non c'è (§4.4)", () => {
    const base = {
      image: { assetId: 'asset-1' },
      mask: { assetId: 'asset-2' },
      operation: 'remove' as const,
      style: exampleStyle,
    };
    expect(retoucherInputSchema.parse({ ...base, instruction: null }).instruction).toBeNull();
    expect(retoucherInputSchema.safeParse(base).success).toBe(false);
  });

  it("rifiuta un'operazione inventata", () => {
    expect(
      retoucherInputSchema.safeParse({
        image: { assetId: 'asset-1' },
        mask: { assetId: 'asset-2' },
        operation: 'blur',
        instruction: null,
        style: exampleStyle,
      }).success,
    ).toBe(false);
  });
});

describe('storyboard_artist', () => {
  it('accetta il modo storyboard con riferimenti', () => {
    const parsed = storyboardArtistInputSchema.parse({
      mode: 'storyboard',
      visualPrompt: { prompt: 'close up, woman smiles' },
      references: [{ assetId: 'asset-1' }],
      variants: 3,
      baseImage: null,
      moodboard: null,
    });
    expect(parsed.mode).toBe('storyboard');
  });

  it('accetta il modo end_frame con il primo fotogramma (D20)', () => {
    const parsed = storyboardArtistInputSchema.parse({
      mode: 'end_frame',
      visualPrompt: { prompt: 'the camera has moved closer' },
      references: [],
      variants: 1,
      baseImage: { assetId: 'asset-1' },
      moodboard: null,
    });
    expect(parsed.baseImage?.assetId).toBe('asset-1');
  });
});

describe('camera_operator', () => {
  it('accetta prompt visivo, riferimenti e durata', () => {
    expect(
      cameraOperatorInputSchema.parse({
        visualPrompt: { prompt: 'close up, woman smiles, golden hour light' },
        references: [{ assetId: 'asset-1' }],
        durationS: 5,
      }).durationS,
    ).toBe(5);
  });
});

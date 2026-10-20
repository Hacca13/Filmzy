import { describe, expect, it } from 'vitest';

import { SHOT_SPEC_SCHEMA_VERSION } from './versions.js';
import { continuityStateSchema, shotImageSchema, shotSpecSchema, takeSchema } from './shot.js';

describe('shotImageSchema', () => {
  it('accetta un primo fotogramma caricato', () => {
    expect(
      shotImageSchema.parse({ use: 'first_frame', from: 'upload', assetId: 'asset-1' }).use,
    ).toBe('first_frame');
  });

  it('accetta un fotogramma estratto da un take', () => {
    expect(
      shotImageSchema.parse({ use: 'last_frame', from: 'take_frame', takeId: 'take-1', atS: 3.5 })
        .from,
    ).toBe('take_frame');
  });

  it('rifiuta un `use` inventato', () => {
    expect(shotImageSchema.safeParse({ use: 'thumbnail', from: 'upload' }).success).toBe(false);
  });
});

const exampleContinuity = {
  locationId: 'piazza',
  timeOfDay: 'tramonto',
  present: ['anna'],
  costumes: { anna: 'giacca di jeans chiara' },
  props: ['lettera'],
};

describe('continuityStateSchema', () => {
  it('accetta uno stato di continuità completo', () => {
    expect(continuityStateSchema.parse(exampleContinuity)).toEqual(exampleContinuity);
  });
});

describe('shotSpecSchema', () => {
  const exampleShot = {
    schema: SHOT_SPEC_SCHEMA_VERSION,
    id: 'shot-1',
    sceneId: 'scene-1',
    order: 0,
    intent: {
      action: 'Anna guarda in camera e sorride appena',
      emotion: 'speranzosa',
      framing: 'close_up',
      cameraMovement: 'static',
      lighting: 'luce calda del tramonto',
      durationS: 5,
    },
    characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara', references: [] }],
    location: { locationId: 'piazza', references: [] },
    images: [],
    dialogue: [],
    cinematography: 'inherit' as const,
    continuity: { entry: exampleContinuity, exit: exampleContinuity },
  };

  it("accetta una scheda inquadratura senza immagini scelte (decide l'aiuto regista)", () => {
    expect(shotSpecSchema.parse(exampleShot).schema).toBe('shot-spec/0.2');
  });

  it('accetta una sostituzione della fotografia per questa inquadratura', () => {
    const shot = { ...exampleShot, cinematography: { lighting: 'hard side light' } };
    expect(shotSpecSchema.parse(shot).cinematography).toEqual({ lighting: 'hard side light' });
  });

  it('rifiuta una versione dello schema diversa da 0.2', () => {
    expect(shotSpecSchema.safeParse({ ...exampleShot, schema: 'shot-spec/0.1' }).success).toBe(
      false,
    );
  });
});

describe('takeSchema', () => {
  it('accetta un take scelto', () => {
    const take = {
      id: 'take-1',
      shotId: 'shot-1',
      kind: 'final' as const,
      generationId: 'gen-1',
      assetId: 'asset-1',
      chosen: true,
      checks: [],
    };
    expect(takeSchema.parse(take)).toEqual(take);
  });

  it('rifiuta un kind inventato', () => {
    expect(
      takeSchema.safeParse({
        id: 'take-1',
        shotId: 'shot-1',
        kind: 'rough_cut',
        generationId: 'gen-1',
        assetId: 'asset-1',
        chosen: false,
        checks: [],
      }).success,
    ).toBe(false);
  });
});

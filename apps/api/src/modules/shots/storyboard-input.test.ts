import {
  ROLE_INPUT_EXAMPLES,
  STORYBOARD_PROMPT_MAX_CHARS,
  cinematographerInputSchema,
  shotPlannerInputSchema,
  shotSpecSchema,
  type ShotSpec,
  type StoryBible,
  type StoryboardMode,
} from '@filmzy/contracts';
import type { TroupeConfig } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  cinematographerInputFor,
  storyboardReferences,
  storyboardTarget,
} from './storyboard-input.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer);
const bible: StoryBible = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner).bible;

const spec: ShotSpec = shotSpecSchema.parse({
  ...example.shot,
  characters: [
    { characterId: 'anna', costume: 'giacca di jeans chiara', references: [{ assetId: 'x' }] },
  ],
  location: { locationId: 'piazza', references: [{ assetId: 'y' }] },
});

const config = { presets: { cameraMovements: [example.movement] } } as unknown as TroupeConfig;

const build = (
  overrides: {
    spec?: ShotSpec;
    bible?: StoryBible;
    config?: TroupeConfig;
    mode?: StoryboardMode;
  } = {},
) =>
  cinematographerInputFor({
    spec: overrides.spec ?? spec,
    bible: overrides.bible ?? bible,
    config: overrides.config ?? config,
    family: 'image_generic',
    target: storyboardTarget(overrides.mode ?? 'storyboard'),
  });

function failure(call: () => unknown): { status: number; field: unknown } {
  try {
    call();
  } catch (error) {
    if (error instanceof HttpException) {
      const body = error.getResponse() as { details?: { field?: unknown } };
      return { status: error.getStatus(), field: body.details?.field };
    }
    throw error;
  }
  throw new Error('doveva fallire');
}

describe('cinematographerInputFor', () => {
  it('dà un input valido per il direttore della fotografia, con la destinazione di un’immagine', () => {
    const input = build();

    expect(cinematographerInputSchema.parse(input)).toEqual(input);
    expect(input.target).toEqual({
      family: 'image_generic',
      kind: 'image',
      maxPromptChars: STORYBOARD_PROMPT_MAX_CHARS,
      frame: 'start',
      inputs: ['references'],
    });
    expect(input.characters).toEqual([
      { id: 'anna', name: 'Anna', costume: 'giacca di jeans chiara' },
    ]);
    expect(input.movement.id).toBe(spec.intent.cameraMovement);
  });

  it('per l’ultimo fotogramma la destinazione è la fine, con il primo e l’ultimo come ingressi', () => {
    expect(build({ mode: 'end_frame' }).target).toEqual({
      family: 'image_generic',
      kind: 'image',
      maxPromptChars: STORYBOARD_PROMPT_MAX_CHARS,
      frame: 'end',
      inputs: ['first_frame', 'last_frame'],
    });
  });

  it('non porta gli id delle immagini: i riferimenti li aggiunge il traduttore', () => {
    const input = build();

    expect(input.shot.characters.flatMap((entry) => entry.references)).toEqual([]);
    expect(input.shot.location.references).toEqual([]);
    expect(input.location.references).toEqual([]);
  });

  it('la fotografia è quella del film, con le sostituzioni dell’inquadratura sopra', () => {
    const inherited = build();
    expect(inherited.cinematography.lens).toBe(bible.cinematography.lens);

    const overridden = build({
      spec: { ...spec, cinematography: { lens: '85mm, ritratto stretto' } },
    });
    expect(overridden.cinematography).toEqual({
      camera: bible.cinematography.camera,
      lighting: bible.cinematography.lighting,
      lens: '85mm, ritratto stretto',
      grade: bible.cinematography.grade,
    });
  });

  it('un personaggio o un luogo che il film non ha più si dice, invece di inventare', () => {
    const withoutAnna = { ...bible, characters: [] };
    const withoutPlace = { ...bible, locations: [] };

    expect(failure(() => build({ bible: withoutAnna }))).toEqual({
      status: 409,
      field: 'characterId',
    });
    expect(failure(() => build({ bible: withoutPlace }))).toEqual({
      status: 409,
      field: 'locationId',
    });
  });

  it('un movimento di macchina che la configurazione non ha più è un errore di configurazione', () => {
    const noMovements = { presets: { cameraMovements: [] } } as unknown as TroupeConfig;

    expect(failure(() => build({ config: noMovements }))).toEqual({
      status: 422,
      field: 'cameraMovement',
    });
  });
});

describe('storyboardReferences', () => {
  it('un volto per personaggio, il primo della scheda, e il set scelto del luogo', () => {
    expect(storyboardReferences(spec, bible)).toEqual({
      characters: [{ characterId: 'anna', assetId: 'asset-1' }],
      locationAssetId: 'asset-4',
    });
  });

  it('parte dal film com’è adesso, non dai riferimenti salvati nella scheda inquadratura', () => {
    const changed: StoryBible = {
      ...bible,
      characters: bible.characters.map((character) => ({
        ...character,
        sheet: [{ assetId: 'volto-nuovo' }],
      })),
      locations: bible.locations.map((location) => ({
        ...location,
        references: [{ assetId: 'set-nuovo' }],
      })),
    };

    expect(storyboardReferences(spec, changed)).toEqual({
      characters: [{ characterId: 'anna', assetId: 'volto-nuovo' }],
      locationAssetId: 'set-nuovo',
    });
  });

  it('un personaggio senza volto bloccato e un luogo senza immagine scelta restano senza riferimento', () => {
    const bare: StoryBible = {
      ...bible,
      characters: bible.characters.map((character) => ({ ...character, sheet: [] })),
      locations: bible.locations.map((location) => ({ ...location, references: [] })),
    };

    expect(storyboardReferences(spec, bare)).toEqual({ characters: [] });
  });

  it('i personaggi stanno nell’ordine dell’inquadratura', () => {
    const second = bible.characters[0];
    if (second === undefined) throw new Error('l’esempio doveva avere un personaggio');
    const twoCharacters: StoryBible = {
      ...bible,
      characters: [
        { ...second, id: 'marco', sheet: [{ assetId: 'volto-marco' }] },
        ...bible.characters,
      ],
    };
    const crowded: ShotSpec = {
      ...spec,
      characters: [
        { characterId: 'anna', costume: 'giacca', references: [] },
        { characterId: 'marco', costume: 'cappotto', references: [] },
      ],
    };

    expect(
      storyboardReferences(crowded, twoCharacters).characters.map((entry) => entry.characterId),
    ).toEqual(['anna', 'marco']);
  });
});

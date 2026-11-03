import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  type ImageCandidate,
  type ShotSpec,
} from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { imageAssetId, imagesFromChoices, withLastFrame } from './shot-images.js';

const spec: ShotSpec = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;
const known = new Map<string, ImageCandidate>(
  ['a', 'b', 'c', 'd', 'e'].map((assetId) => [
    assetId,
    { assetId, mode: 'storyboard', attempt: 1 } as const,
  ]),
);

function refusal(call: () => unknown): { status: number; field: unknown } {
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

describe('imagesFromChoices', () => {
  it('le scelte diventano immagini generate per l’inquadratura, nell’ordine dato', () => {
    expect(
      imagesFromChoices(
        [
          { use: 'first_frame', assetId: 'a' },
          { use: 'last_frame', assetId: 'b' },
          { use: 'reference', assetId: 'c' },
        ],
        known,
      ),
    ).toEqual([
      { use: 'first_frame', from: 'generate', assetId: 'a' },
      { use: 'last_frame', from: 'generate', assetId: 'b' },
      { use: 'reference', from: 'generate', assetId: 'c' },
    ]);
    expect(imagesFromChoices([], known)).toEqual([]);
  });

  it('un’immagine che l’inquadratura non può usare si rifiuta', () => {
    expect(
      refusal(() => imagesFromChoices([{ use: 'reference', assetId: 'altra' }], known)),
    ).toEqual({ status: 409, field: 'assetId' });
  });

  it('due primi fotogrammi, due ultimi, troppa ispirazione o la stessa immagine due volte si rifiutano', () => {
    const twoFirst = [
      { use: 'first_frame' as const, assetId: 'a' },
      { use: 'first_frame' as const, assetId: 'b' },
    ];
    const twoLast = [
      { use: 'last_frame' as const, assetId: 'a' },
      { use: 'last_frame' as const, assetId: 'b' },
    ];
    const tooMany = ['a', 'b', 'c', 'd'].map((assetId) => ({ use: 'reference' as const, assetId }));
    const twice = [
      { use: 'first_frame' as const, assetId: 'a' },
      { use: 'reference' as const, assetId: 'a' },
    ];

    for (const choices of [twoFirst, twoLast, tooMany, twice]) {
      expect(refusal(() => imagesFromChoices(choices, known))).toEqual({
        status: 409,
        field: 'images',
      });
    }
  });
});

describe('imagesFromChoices e i fotogrammi dei take (T4.6)', () => {
  it('un fotogramma preso da un take resta legato al take e al momento; le altre sono generate', () => {
    const candidates = new Map<string, ImageCandidate>([
      ['frame', { assetId: 'frame', mode: 'take_frame', takeId: 'take-1', atS: 2.5 }],
      ['drawn', { assetId: 'drawn', mode: 'end_frame', attempt: 2 }],
    ]);

    expect(
      imagesFromChoices(
        [
          { use: 'first_frame', assetId: 'frame' },
          { use: 'last_frame', assetId: 'drawn' },
        ],
        candidates,
      ),
    ).toEqual([
      { use: 'first_frame', from: 'take_frame', assetId: 'frame', takeId: 'take-1', atS: 2.5 },
      { use: 'last_frame', from: 'generate', assetId: 'drawn' },
    ]);
  });
});

describe('imageAssetId e withLastFrame', () => {
  it('si legge l’immagine di un ruolo, e il nuovo ultimo fotogramma prende il posto del vecchio', () => {
    const first: ShotSpec = {
      ...spec,
      images: [
        { use: 'first_frame', from: 'generate', assetId: 'a' },
        { use: 'last_frame', from: 'generate', assetId: 'b' },
        { use: 'reference', from: 'generate', assetId: 'c' },
      ],
    };

    expect(imageAssetId(first, 'first_frame')).toBe('a');
    expect(imageAssetId(spec, 'first_frame')).toBeUndefined();

    const changed = withLastFrame(first, 'd');
    expect(imageAssetId(changed, 'last_frame')).toBe('d');
    expect(changed.images.map((image) => image.use).sort()).toEqual([
      'first_frame',
      'last_frame',
      'reference',
    ]);
    // La scheda di prima non cambia.
    expect(imageAssetId(first, 'last_frame')).toBe('b');
  });

  it('l’immagine scelta come ultimo fotogramma perde gli altri ruoli che aveva', () => {
    const first: ShotSpec = {
      ...spec,
      images: [
        { use: 'first_frame', from: 'generate', assetId: 'a' },
        { use: 'reference', from: 'generate', assetId: 'c' },
      ],
    };

    expect(withLastFrame(first, 'c').images).toEqual([
      { use: 'first_frame', from: 'generate', assetId: 'a' },
      { use: 'last_frame', from: 'generate', assetId: 'c' },
    ]);
  });
});

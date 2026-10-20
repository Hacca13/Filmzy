import { describe, expect, it } from 'vitest';

import {
  colorSchema,
  moodReferenceSchema,
  moodboardBriefSchema,
  moodboardSchema,
} from './moodboard.js';

describe('colorSchema', () => {
  it('accetta un colore con nome e uso', () => {
    expect(colorSchema.parse({ hex: '#1a2b3c', name: 'Blu notte', use: 'dominante' }).hex).toBe(
      '#1a2b3c',
    );
  });

  it('rifiuta un hex senza cancelletto', () => {
    expect(colorSchema.safeParse({ hex: '1a2b3c' }).success).toBe(false);
  });
});

describe('moodReferenceSchema', () => {
  it("accetta un'immagine generata", () => {
    expect(
      moodReferenceSchema.parse({
        assetId: 'asset-1',
        origin: 'generated',
        analysisOnly: false,
        description: 'Vicolo di notte con neon rosa',
        moodTags: ['notte', 'neon'],
        palette: [{ hex: '#ff00aa' }],
        generationId: 'gen-1',
      }).origin,
    ).toBe('generated');
  });

  it("accetta un'immagine caricata con persone, segnata solo per l'analisi (D38)", () => {
    const reference = moodReferenceSchema.parse({
      assetId: 'asset-2',
      origin: 'uploaded',
      analysisOnly: true,
      description: 'Due persone a un tavolo',
      moodTags: ['caldo'],
      palette: [],
    });
    expect(reference.analysisOnly).toBe(true);
  });
});

describe('moodboardSchema', () => {
  it('accetta un moodboard di film con una scena', () => {
    const moodboard = {
      projectId: 'proj-1',
      film: { palette: [{ hex: '#112233' }], notes: 'Luce calda', references: [] },
      scenes: [{ sceneId: 'scene-1', palette: [], notes: '', references: [] }],
    };
    expect(moodboardSchema.parse(moodboard)).toEqual(moodboard);
  });
});

describe('moodboardBriefSchema', () => {
  it('accetta la vista di solo testo letta dai ruoli', () => {
    expect(
      moodboardBriefSchema.parse({
        palette: [{ hex: '#112233' }],
        notes: 'Luce calda, camera ferma',
        referenceDescriptions: ['Vicolo di notte con neon rosa'],
      }).referenceDescriptions,
    ).toHaveLength(1);
  });

  it('accetta null (variabile facoltativa senza moodboard, §4.4)', () => {
    expect(moodboardBriefSchema.nullable().parse(null)).toBeNull();
  });
});

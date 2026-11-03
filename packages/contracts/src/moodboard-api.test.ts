import { describe, expect, it } from 'vitest';

import {
  MAX_PALETTE_COLORS,
  MOODBOARD_NOTES_MAX_CHARS,
  moodboardViewSchema,
  saveMoodboardPartBodySchema,
} from './moodboard-api.js';

describe('saveMoodboardPartBodySchema (T4.10)', () => {
  const color = { hex: '#c2813a', name: 'Ambra' };

  it('palette e consigli del film, o di una scena', () => {
    expect(saveMoodboardPartBodySchema.parse({ palette: [color], notes: 'Luce calda.' })).toEqual({
      palette: [color],
      notes: 'Luce calda.',
    });
    expect(
      saveMoodboardPartBodySchema.parse({ sceneId: 'scene-2', palette: [], notes: '' }).sceneId,
    ).toBe('scene-2');
  });

  it('una parte vuota è valida: toglie la parte', () => {
    expect(saveMoodboardPartBodySchema.safeParse({ palette: [], notes: '' }).success).toBe(true);
  });

  it('rifiuta un colore che non è esadecimale, troppi colori, consigli troppo lunghi o campi in più', () => {
    const many = Array.from({ length: MAX_PALETTE_COLORS + 1 }, () => color);

    expect(
      saveMoodboardPartBodySchema.safeParse({ palette: [{ hex: 'rosso' }], notes: '' }).success,
    ).toBe(false);
    expect(
      saveMoodboardPartBodySchema.safeParse({ palette: [{ hex: '#fff' }], notes: '' }).success,
    ).toBe(false);
    expect(saveMoodboardPartBodySchema.safeParse({ palette: many, notes: '' }).success).toBe(false);
    expect(
      saveMoodboardPartBodySchema.safeParse({
        palette: [],
        notes: 'a'.repeat(MOODBOARD_NOTES_MAX_CHARS + 1),
      }).success,
    ).toBe(false);
    expect(
      saveMoodboardPartBodySchema.safeParse({ palette: [], notes: '', altro: 1 }).success,
    ).toBe(false);
  });
});

describe('moodboardViewSchema', () => {
  it('porta la funzione, il moodboard e le scene tra cui scegliere', () => {
    const view = {
      enabled: true,
      moodboard: {
        projectId: 'film-1',
        film: { palette: [], notes: '', references: [] },
        scenes: [],
      },
      scenes: [{ sceneId: 'scene-1', number: 1, heading: 'INT. STAZIONE - SERA' }],
    };

    expect(moodboardViewSchema.parse(view)).toEqual(view);
  });
});

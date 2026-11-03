import type { Moodboard, MoodReference } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { moodboardBrief } from './brief.js';

const amber = { hex: '#c2813a' };
const blue = { hex: '#2a4d8f' };

const reference = (description: string, extra: Partial<MoodReference> = {}): MoodReference => ({
  assetId: 'a'.repeat(64),
  origin: 'uploaded',
  analysisOnly: false,
  description,
  moodTags: [],
  palette: [],
  ...extra,
});

const board = (extra: Partial<Moodboard> = {}): Moodboard => ({
  projectId: 'film-1',
  film: { palette: [], notes: '', references: [] },
  scenes: [],
  ...extra,
});

describe('moodboardBrief: il testo che leggono i ruoli (D37)', () => {
  it("senza niente il moodboard non c'è, e i ruoli lavorano come prima", () => {
    expect(moodboardBrief(board())).toBeUndefined();
    expect(moodboardBrief(board(), 'scene-1')).toBeUndefined();
  });

  it('palette, consigli e descrizioni delle immagini; le immagini no', () => {
    const brief = moodboardBrief(
      board({
        film: {
          palette: [amber],
          notes: 'Luce calda.',
          references: [reference('a quiet station at dusk')],
        },
      }),
    );

    expect(brief).toEqual({
      palette: [amber],
      notes: 'Luce calda.',
      referenceDescriptions: ['a quiet station at dusk'],
      scene: null,
    });
    expect(JSON.stringify(brief)).not.toContain('a'.repeat(64));
  });

  it("le immagini «solo per l'analisi» danno comunque la loro descrizione: è solo testo", () => {
    const brief = moodboardBrief(
      board({
        film: {
          palette: [],
          notes: '',
          references: [reference('a crowded platform', { analysisOnly: true })],
        },
      }),
    );

    expect(brief?.referenceDescriptions).toEqual(['a crowded platform']);
  });

  it('una scena con la sua parte la porta in più; le sue descrizioni si aggiungono', () => {
    const brief = moodboardBrief(
      board({
        film: { palette: [amber], notes: 'Film.', references: [reference('film ref')] },
        scenes: [
          {
            sceneId: 'scene-2',
            palette: [blue],
            notes: 'Notte.',
            references: [reference('night ref')],
          },
        ],
      }),
      'scene-2',
    );

    expect(brief).toEqual({
      palette: [amber],
      notes: 'Film.',
      referenceDescriptions: ['film ref', 'night ref'],
      scene: { palette: [blue], notes: 'Notte.' },
    });
  });

  it("una scena vuota non toglie niente: vale quello del film; un'altra scena non conta", () => {
    const film = { palette: [amber], notes: 'Film.', references: [] };
    const moodboard = board({
      film,
      scenes: [{ sceneId: 'scene-2', palette: [], notes: '', references: [] }],
    });

    expect(moodboardBrief(moodboard, 'scene-2')?.scene).toBeNull();
    expect(moodboardBrief(moodboard, 'scene-9')).toEqual({
      palette: [amber],
      notes: 'Film.',
      referenceDescriptions: [],
      scene: null,
    });
  });

  it("un film senza moodboard ma con una scena che ce l'ha dà il brief di quella scena", () => {
    const brief = moodboardBrief(
      board({
        scenes: [{ sceneId: 'scene-1', palette: [blue], notes: 'Solo qui.', references: [] }],
      }),
      'scene-1',
    );

    expect(brief).toEqual({
      palette: [],
      notes: '',
      referenceDescriptions: [],
      scene: { palette: [blue], notes: 'Solo qui.' },
    });
    expect(
      moodboardBrief(
        board({ scenes: [{ sceneId: 'scene-1', palette: [blue], notes: 'x', references: [] }] }),
      ),
    ).toBeUndefined();
  });
});

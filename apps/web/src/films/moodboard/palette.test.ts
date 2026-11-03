import { MAX_PALETTE_COLORS, type Moodboard } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  NEW_COLOR_HEX,
  addColor,
  canAddColor,
  changeColor,
  partOf,
  referencesOf,
  removeColor,
  runIsWorking,
  samePart,
} from './palette';

const amber = { hex: '#c2813a', name: 'Ambra' };
const blue = { hex: '#2a4d8f' };

describe('partOf', () => {
  const board: Moodboard = {
    projectId: 'film-1',
    film: { palette: [amber], notes: 'Film.', references: [] },
    scenes: [{ sceneId: 'scene-2', palette: [blue], notes: 'Notte.', references: [] }],
  };

  it('la parte del film, o quella di una scena', () => {
    expect(partOf(board, undefined)).toEqual({ palette: [amber], notes: 'Film.' });
    expect(partOf(board, 'scene-2')).toEqual({ palette: [blue], notes: 'Notte.' });
  });

  it('una scena senza parte sua è vuota: vale quella del film', () => {
    expect(partOf(board, 'scene-9')).toEqual({ palette: [], notes: '' });
  });
});

describe('la palette in modifica', () => {
  it('si aggiunge un colore di partenza, fino al massimo', () => {
    expect(addColor([])).toEqual([{ hex: NEW_COLOR_HEX }]);

    const full = Array.from({ length: MAX_PALETTE_COLORS }, () => amber);
    expect(canAddColor(full)).toBe(false);
    expect(addColor(full)).toHaveLength(MAX_PALETTE_COLORS);
    expect(canAddColor(full.slice(1))).toBe(true);
  });

  it('si cambia il colore o il nome di uno solo; un nome vuoto lo toglie', () => {
    const palette = [amber, blue];

    expect(changeColor(palette, 1, { hex: '#000000' })).toEqual([amber, { hex: '#000000' }]);
    expect(changeColor(palette, 0, { name: 'Oro' })).toEqual([
      { hex: '#c2813a', name: 'Oro' },
      blue,
    ]);
    expect(changeColor(palette, 0, { name: '   ' })).toEqual([{ hex: '#c2813a' }, blue]);
    expect(palette).toEqual([amber, blue]);
  });

  it('il ruolo del colore (dominante, accento…) non si perde cambiandolo', () => {
    const [changed] = changeColor([{ hex: '#111111', use: 'accento' }], 0, { hex: '#222222' });

    expect(changed).toEqual({ hex: '#222222', use: 'accento' });
  });

  it('un colore si toglie per posizione', () => {
    expect(removeColor([amber, blue], 0)).toEqual([blue]);
    expect(removeColor([amber], 5)).toEqual([amber]);
  });
});

describe('samePart', () => {
  it('uguali a meno di maiuscole nei colori e spazi nei consigli', () => {
    expect(
      samePart(
        { palette: [{ hex: '#C2813A', name: 'Ambra' }], notes: ' Luce. ' },
        { palette: [amber], notes: 'Luce.' },
      ),
    ).toBe(true);
  });

  it("diverse se cambia un colore, un nome, l'ordine o i consigli", () => {
    const base = { palette: [amber, blue], notes: 'x' };

    expect(samePart(base, { ...base, notes: 'y' })).toBe(false);
    expect(samePart(base, { ...base, palette: [blue, amber] })).toBe(false);
    expect(samePart(base, { ...base, palette: [{ hex: amber.hex }, blue] })).toBe(false);
    expect(samePart(base, { ...base, palette: [amber] })).toBe(false);
  });
});

describe('le immagini e il lavoro in corso (T4.10)', () => {
  const reference = {
    assetId: 'a'.repeat(64),
    origin: 'generated' as const,
    analysisOnly: false,
    description: 'x',
    moodTags: [],
    palette: [],
  };
  const board: Moodboard = {
    projectId: 'film-1',
    film: { palette: [], notes: '', references: [reference] },
    scenes: [
      {
        sceneId: 'scene-2',
        palette: [],
        notes: '',
        references: [{ ...reference, assetId: 'b'.repeat(64) }],
      },
    ],
  };

  it('le immagini sono quelle della parte: del film, o della scena', () => {
    expect(referencesOf(board, undefined)).toHaveLength(1);
    expect(referencesOf(board, 'scene-2')[0]?.assetId).toBe('b'.repeat(64));
    expect(referencesOf(board, 'scene-9')).toEqual([]);
  });

  it('un lavoro è in corso se è in coda o lavora; finito, riuscito o no, no', () => {
    const run = (status: 'queued' | 'running' | 'succeeded' | 'failed') => ({
      run: { id: 'r', status, images: 0, createdAt: '2026-11-03T10:00:00.000Z' },
    });

    expect(runIsWorking(run('queued'))).toBe(true);
    expect(runIsWorking(run('running'))).toBe(true);
    expect(runIsWorking(run('succeeded'))).toBe(false);
    expect(runIsWorking(run('failed'))).toBe(false);
    expect(runIsWorking({})).toBe(false);
  });
});

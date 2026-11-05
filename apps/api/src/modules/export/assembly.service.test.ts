import type { ScenePlan, ShotSpec } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { gapsOf, joinNames } from './assembly.service.js';

const shot = (id: string): ShotSpec => ({ id }) as unknown as ShotSpec;
const take = { takeId: 't', assetId: 'a', nativeAudio: false };

const scene = (sceneNumber: number, patch: Partial<ScenePlan> = {}): ScenePlan =>
  ({
    sceneNumber,
    planned: true,
    stale: false,
    shots: [shot('a')],
    ...patch,
  }) as unknown as ScenePlan;

describe('cosa manca per montare', () => {
  it('niente, se ogni inquadratura di ogni scena ha il suo video', () => {
    expect(gapsOf([scene(1)], { a: take })).toEqual([]);
  });

  it('una scena da pensare, una da rifare, una con inquadrature senza video', () => {
    expect(
      gapsOf(
        [
          scene(1, { planned: false, shots: [] }),
          scene(2, { stale: true }),
          scene(3, { shots: [shot('b'), shot('c'), shot('a')] }),
        ],
        { a: take },
      ),
    ).toEqual([
      { sceneNumber: 1, kind: 'not_planned' },
      { sceneNumber: 2, kind: 'stale' },
      { sceneNumber: 3, kind: 'no_take', missing: 2 },
    ]);
  });
});

describe('i nomi nei titoli', () => {
  it('si leggono in italiano', () => {
    expect(joinNames(['Anna'])).toBe('Anna');
    expect(joinNames(['Anna', 'Marco'])).toBe('Anna e Marco');
    expect(joinNames(['Anna', 'Marco', 'Lia'])).toBe('Anna, Marco e Lia');
    expect(joinNames([])).toBe('');
  });
});

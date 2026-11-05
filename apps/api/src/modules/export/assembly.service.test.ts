import type { ScenePlan, ShotSpec } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { scenesOnLanes, tickedScenes } from '../audio/timeline.js';
import { castOf, joinNames, sceneRows } from './assembly.service.js';

const shot = (id: string): ShotSpec => ({ id, intent: { durationS: 4 } }) as unknown as ShotSpec;
const take = { takeId: 't', assetId: 'a', nativeAudio: false };

const scene = (sceneNumber: number, patch: Partial<ScenePlan> = {}): ScenePlan =>
  ({
    sceneNumber,
    heading: `Scena numero ${String(sceneNumber)}`,
    durationS: 10,
    planned: true,
    stale: false,
    shots: [shot('a')],
    ...patch,
  }) as unknown as ScenePlan;

describe('le scene del film', () => {
  const none = new Set<number>();
  const complete = scene(1);
  const notPlanned = scene(2, { planned: false, shots: [] });
  const stale = scene(3, { stale: true });
  const missingVideos = scene(4, { shots: [shot('b'), shot('c'), shot('a')] });
  const all = [complete, notPlanned, stale, missingVideos];
  const kept = { a: take };

  it('entra chi ha tutto e non è stata tolta, e le altre non bloccano', () => {
    expect(tickedScenes(all, kept, none)).toEqual([complete]);
    expect(tickedScenes(all, kept, new Set([1]))).toEqual([]);
  });

  it('l’elenco dice cosa manca a ogni scena, e tiene l’ordine della storia', () => {
    const rows = sceneRows(all, kept, [complete]);

    expect(rows.map(({ sceneNumber }) => sceneNumber)).toEqual([1, 2, 3, 4]);
    expect(rows.map(({ gap }) => gap)).toEqual([
      undefined,
      { kind: 'not_planned' },
      { kind: 'stale' },
      { kind: 'no_take', missing: 2 },
    ]);
    expect(rows.map(({ included }) => included)).toEqual([true, false, false, false]);
    expect(rows[0]).toMatchObject({ previewAssetId: 'a', durationS: 4 });
    // Una scena da pensare dura il tempo scritto nella stesura.
    expect(rows[1]).toMatchObject({ durationS: 10 });
    expect(rows[1]?.previewAssetId).toBeUndefined();
  });

  it('una scena tolta non ha niente da dire: resta senza spunta, e senza motivo', () => {
    expect(sceneRows([complete], kept, [])[0]).toMatchObject({ included: false });
    expect(sceneRows([complete], kept, [])[0]?.gap).toBeUndefined();
  });

  it('sulle tracce stanno solo le scene del film', () => {
    expect(scenesOnLanes(all, kept, none)).toEqual([complete]);
  });

  it('finché nessuna è pronta si vedono tutte tranne quelle tolte: il suono si prepara prima', () => {
    expect(scenesOnLanes(all, {}, none)).toEqual(all);
    expect(scenesOnLanes(all, {}, new Set([2]))).toEqual([complete, stale, missingVideos]);
  });
});

describe('chi si nomina nei titoli', () => {
  const inScene = (...ids: string[]) =>
    scene(1, {
      shots: [
        {
          id: 'a',
          intent: { durationS: 4 },
          characters: ids.map((characterId) => ({ characterId })),
        } as unknown as ShotSpec,
      ],
    });
  const names = { anna: 'Anna', luca: 'Luca' };

  it('chi si vede nel film, non chi sta solo in una scena tolta', () => {
    expect(castOf([inScene('anna')], names)).toEqual(['Anna']);
    expect(castOf([inScene('luca', 'anna')], names)).toEqual(['Anna', 'Luca']);
  });

  it('finché nessuna scena è nel film ci sono tutti', () => {
    expect(castOf([], names)).toEqual(['Anna', 'Luca']);
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

import type { AudioClip, ScenePlan, ShotSpec } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { buildTimeline } from './timeline.js';

const shot = (id: string, durationS: number, sceneId = 'scene-1'): ShotSpec =>
  ({ id, sceneId, intent: { action: `Azione ${id}`, durationS } }) as unknown as ShotSpec;

const plan = (sceneNumber: number, shots: ShotSpec[], patch: Partial<ScenePlan> = {}): ScenePlan =>
  ({
    sceneNumber,
    heading: `SCENA ${String(sceneNumber)}`,
    durationS: 10,
    stale: false,
    shots,
    ...patch,
  }) as unknown as ScenePlan;

const clip = (patch: Partial<AudioClip>): AudioClip =>
  ({
    id: 'c-1',
    kind: 'music',
    sceneId: 'scene-1',
    startS: 0,
    durationS: 5,
    ...patch,
  }) as unknown as AudioClip;

describe('la linea del tempo', () => {
  it('scene e inquadrature si mettono in fila, e una scena pensata dura quanto le sue inquadrature', () => {
    const timeline = buildTimeline(
      [plan(1, [shot('a', 4), shot('b', 3)]), plan(2, [shot('c', 5, 'scene-2')])],
      {},
      [],
    );

    expect(timeline.durationS).toBe(12);
    expect(timeline.scenes.map(({ startS, durationS }) => [startS, durationS])).toEqual([
      [0, 7],
      [7, 5],
    ]);
    expect(timeline.shots.map(({ shotId, startS }) => [shotId, startS])).toEqual([
      ['a', 0],
      ['b', 4],
      ['c', 7],
    ]);
  });

  it('una scena non ancora pensata occupa il tempo scritto nella stesura', () => {
    const timeline = buildTimeline(
      [plan(1, [], { durationS: 9 }), plan(2, [shot('a', 2)])],
      {},
      [],
    );

    expect(timeline.durationS).toBe(11);
    expect(timeline.shots[0]?.startS).toBe(9);
  });

  it('ogni inquadratura porta il take che finirà nel film, e il suo audio originale', () => {
    const timeline = buildTimeline(
      [plan(1, [shot('a', 4), shot('b', 3)])],
      { a: { takeId: 't-1', assetId: 'clip', nativeAudio: true } },
      [],
    );

    expect(timeline.shots[0]).toMatchObject({ takeId: 't-1', assetId: 'clip', nativeAudio: true });
    expect(timeline.shots[1]?.takeId).toBeUndefined();
    expect(timeline.shots[1]?.nativeAudio).toBe(false);
  });
});

describe('dove cade un suono', () => {
  const plans = [plan(1, [shot('a', 4), shot('b', 3)]), plan(2, [shot('c', 5, 'scene-2')])];

  it('la musica parte con la scena e si ferma con lei, anche se il file è più lungo', () => {
    const { placements } = buildTimeline(plans, {}, [
      clip({ id: 'corta', durationS: 2 }),
      clip({ id: 'lunga', sceneId: 'scene-2', durationS: 60 }),
    ]);

    expect(placements).toEqual({
      corta: { startS: 0, durationS: 2 },
      lunga: { startS: 7, durationS: 5 },
    });
  });

  it('un effetto conta dall’inizio della sua inquadratura e può sforare in quella dopo', () => {
    const { placements } = buildTimeline(plans, {}, [
      clip({ id: 'e', kind: 'sfx', shotId: 'b', startS: 1, durationS: 4 }),
    ]);

    expect(placements).toEqual({ e: { startS: 5, durationS: 4 } });
  });

  it('non oltre la fine del film', () => {
    const { placements } = buildTimeline(plans, {}, [
      clip({ id: 'e', kind: 'sfx', sceneId: 'scene-2', shotId: 'c', startS: 4, durationS: 30 }),
    ]);

    expect(placements).toEqual({ e: { startS: 11, durationS: 1 } });
  });

  it('una voce senza inquadratura conta dall’inizio della scena', () => {
    const { placements } = buildTimeline(plans, {}, [
      clip({ id: 'v', kind: 'dialogue', sceneId: 'scene-2', startS: 2 }),
    ]);

    expect(placements['v']?.startS).toBe(9);
  });

  it('una clip che ha perso il suo posto non ha posizione', () => {
    const { placements } = buildTimeline(plans, {}, [
      clip({ id: 'senza-scena', sceneId: 'scene-9' }),
      clip({ id: 'senza-inquadratura', kind: 'sfx', shotId: 'sparita' }),
      clip({ id: 'altra-scena', kind: 'sfx', sceneId: 'scene-2', shotId: 'a' }),
    ]);

    expect(placements).toEqual({});
  });
});

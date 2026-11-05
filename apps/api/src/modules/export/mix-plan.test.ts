import type { AudioClip, AudioTimeline, AudioTrack } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { planMix, type MixPlanInput } from './mix-plan.js';

const timeline = (placements: AudioTimeline['placements']): AudioTimeline => ({
  durationS: 20,
  scenes: [
    { sceneId: 'scene-1', sceneNumber: 1, heading: 'UNO', startS: 0, durationS: 10, stale: false },
    { sceneId: 'scene-2', sceneNumber: 2, heading: 'DUE', startS: 10, durationS: 10, stale: false },
  ],
  shots: [],
  placements,
});

const tracks = (
  patch: Partial<Record<AudioTrack['kind'], Partial<AudioTrack>>> = {},
): AudioTrack[] =>
  (['native', 'dialogue', 'music', 'sfx'] as const).map((kind) => ({
    id: kind,
    kind,
    muted: false,
    volume: 1,
    ...patch[kind],
  }));

const clip = (id: string, patch: Partial<AudioClip> = {}): AudioClip => ({
  id,
  trackId: 'music',
  kind: 'music',
  sceneId: 'scene-1',
  startS: 0,
  durationS: 10,
  volume: 1,
  fadeInS: 0,
  fadeOutS: 0,
  description: 'x',
  source: 'generated',
  variants: [],
  ...patch,
});

const input = (patch: Partial<MixPlanInput> = {}): MixPlanInput => ({
  timeline: timeline({ m1: { startS: 0, durationS: 10 } }),
  clips: [clip('m1')],
  tracks: tracks(),
  files: { m1: { file: 'm1.wav', durationS: 30 } },
  offsetS: 3,
  ...patch,
});

describe('cosa entra nel mix', () => {
  it('un suono parte dal suo posto, dopo i titoli', () => {
    expect(planMix(input())[0]).toMatchObject({ file: 'm1.wav', startS: 3, durationS: 10 });
  });

  it('una traccia muta non si sente, e nemmeno una a volume zero', () => {
    expect(planMix(input({ tracks: tracks({ music: { muted: true } }) }))).toEqual([]);
    expect(planMix(input({ tracks: tracks({ music: { volume: 0 } }) }))).toEqual([]);
  });

  it('il volume è quello della traccia per quello della clip', () => {
    const [sound] = planMix(
      input({ tracks: tracks({ music: { volume: 0.5 } }), clips: [clip('m1', { volume: 0.5 })] }),
    );

    expect(sound?.volume).toBe(0.25);
  });

  it('senza file in uso o senza posto non entra', () => {
    expect(planMix(input({ files: {} }))).toEqual([]);
    expect(planMix(input({ timeline: timeline({}) }))).toEqual([]);
  });

  it('un file più corto del suo posto dura quanto il file', () => {
    const [sound] = planMix(input({ files: { m1: { file: 'm1.wav', durationS: 4 } } }));

    expect(sound?.durationS).toBe(4);
  });
});

describe('le dissolvenze della musica', () => {
  const two = {
    timeline: timeline({
      m1: { startS: 0, durationS: 10 },
      m2: { startS: 10, durationS: 10 },
    }),
    clips: [clip('m1'), clip('m2', { sceneId: 'scene-2' })],
    files: { m1: { file: 'm1.wav', durationS: 30 }, m2: { file: 'm2.wav', durationS: 30 } },
  };

  it('due scene vicine con la musica si incrociano: la prima continua sotto la seconda', () => {
    const [first, second] = planMix(input(two));

    expect(first).toMatchObject({ durationS: 11, fadeInS: 0.5, fadeOutS: 1 });
    expect(second).toMatchObject({ startS: 13, durationS: 10, fadeInS: 1, fadeOutS: 0.5 });
  });

  it('se il file finisce prima non si inventa niente', () => {
    const [first] = planMix(
      input({ ...two, files: { ...two.files, m1: { file: 'm1.wav', durationS: 10 } } }),
    );

    expect(first).toMatchObject({ durationS: 10, fadeOutS: 0.5 });
  });

  it('una musica sola entra ed esce morbida', () => {
    expect(planMix(input())[0]).toMatchObject({ fadeInS: 0.5, fadeOutS: 0.5 });
  });

  it('un suono cortissimo non ha dissolvenze più lunghe di lui', () => {
    const [sound] = planMix(input({ files: { m1: { file: 'm1.wav', durationS: 0.4 } } }));

    expect(sound?.fadeInS).toBeCloseTo(0.2);
    expect(sound?.fadeOutS).toBeCloseTo(0.2);
  });
});

describe('effetti e voci', () => {
  it('non hanno dissolvenze, salvo quelle della clip', () => {
    const [plain, faded] = planMix(
      input({
        timeline: timeline({ a: { startS: 2, durationS: 2 }, b: { startS: 4, durationS: 2 } }),
        clips: [
          clip('a', { kind: 'sfx' }),
          clip('b', { kind: 'dialogue', fadeInS: 0.2, fadeOutS: 0.3 }),
        ],
        files: { a: { file: 'a.wav', durationS: 2 }, b: { file: 'b.wav', durationS: 2 } },
      }),
    );

    expect(plain).toMatchObject({ startS: 5, fadeInS: 0, fadeOutS: 0 });
    expect(faded).toMatchObject({ fadeInS: 0.2, fadeOutS: 0.3 });
  });
});

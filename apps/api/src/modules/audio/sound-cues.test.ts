import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  type ScenePlan,
  type ShotSpec,
  type SoundCue,
} from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { settleCues } from './sound-cues.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;
const shot = (id: string, durationS = 5): ShotSpec => ({
  ...example,
  id,
  sceneId: 'scene-1',
  intent: { ...example.intent, durationS },
});

const scene = (patch: Partial<ScenePlan> = {}): ScenePlan => ({
  sceneNumber: 1,
  heading: 'SCENA 1',
  summary: 'Anna parte.',
  durationS: 20,
  planned: true,
  stale: false,
  shots: [shot('s1')],
  chosenStoryboards: {},
  clips: {},
  working: {},
  flags: {},
  sceneFlags: [],
  hasWork: false,
  ...patch,
});

const music: SoundCue = {
  kind: 'music',
  sceneId: 'scene-1',
  durationS: 20,
  mood: 'bittersweet',
  description: 'Un piano.',
};
const effect: SoundCue = {
  kind: 'sfx',
  sceneId: 'scene-1',
  shotId: 's1',
  atS: 1,
  durationS: 2,
  description: 'Passi.',
};
const all = { music: true, sfx: true };

describe('cosa si tiene delle proposte', () => {
  it('una musica e un effetto validi diventano clip da creare', () => {
    expect(settleCues([music, effect], [scene()], all)).toEqual([
      {
        kind: 'music',
        sceneId: 'scene-1',
        durationS: 20,
        description: 'Un piano.',
        mood: 'bittersweet',
      },
      {
        kind: 'sfx',
        sceneId: 'scene-1',
        shotId: 's1',
        startS: 1,
        durationS: 2,
        description: 'Passi.',
      },
    ]);
  });

  it('una scena o un’inquadratura che non c’è si scarta', () => {
    const cues: SoundCue[] = [
      { ...music, sceneId: 'scene-9' },
      { ...effect, shotId: 'inventata' },
      { kind: 'sfx', sceneId: 'scene-1', durationS: 2, description: 'Passi senza un posto.' },
    ];

    expect(settleCues(cues, [scene()], all)).toEqual([]);
  });

  it('una descrizione vuota si scarta', () => {
    expect(settleCues([{ ...music, description: '   ' }], [scene()], all)).toEqual([]);
  });

  it('un solo blocco di musica per scena, non più lungo della scena', () => {
    const settled = settleCues([{ ...music, durationS: 90 }, music], [scene()], all);

    expect(settled).toHaveLength(1);
    expect(settled[0]?.durationS).toBe(20);
  });

  it('non propone musica dove c’è già', () => {
    expect(settleCues([music, effect], [scene()], all, ['scene-1']).map((c) => c.kind)).toEqual([
      'sfx',
    ]);
  });

  it('al massimo tre effetti per scena', () => {
    expect(settleCues([effect, effect, effect, effect], [scene()], all)).toHaveLength(3);
  });

  it('un secondo oltre la fine dell’inquadratura torna all’inizio', () => {
    const [settled] = settleCues([{ ...effect, atS: 99 }], [scene()], all);

    expect(settled?.startS).toBe(0);
  });

  it('una scena da rifare tiene la musica, ma non gli effetti: le sue inquadrature spariranno', () => {
    const settled = settleCues([music, effect], [scene({ stale: true })], all);

    expect(settled.map((cue) => cue.kind)).toEqual(['music']);
  });

  it('una funzione spenta non propone niente', () => {
    expect(settleCues([music, effect], [scene()], { music: false, sfx: true })).toHaveLength(1);
    expect(settleCues([music, effect], [scene()], { music: true, sfx: false })).toHaveLength(1);
  });
});

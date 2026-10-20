import { describe, expect, it } from 'vitest';

import { benchPlanSchema } from './bench.js';

describe('benchPlanSchema', () => {
  it('accetta il piano week1.yaml del test di coerenza (T1.7)', () => {
    const plan = {
      name: 'coerenza-personaggi-v1',
      budget_usd: 50,
      style: 'realistic',
      cinematography: 'handheld_warm',
      characters: [
        { id: 'anna', name: 'Anna', brief: 'donna sui 35 anni, capelli ricci rossi raccolti' },
        { id: 'tomas', name: 'Tomás', brief: 'uomo sui 60 anni, barba grigia corta' },
      ],
      sheet: { model: 'nano-banana-2', angles: ['front', 'profile', 'three_quarter'], attempts_per_angle: 5 },
      shots: [
        { id: 'close_front', action: 'Anna guarda in camera e sorride appena', framing: 'close_up', characters: ['anna'] },
        {
          id: 'night_neon',
          action: 'Tomás sotto un\'insegna al neon, di notte, sotto la pioggia',
          framing: 'medium_close_up',
          lighting: 'night, neon, rain',
          characters: ['tomas'],
        },
      ],
      models: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash'],
      takes_per_shot: 3,
      duration_s: 5,
      voting: { voters: 3, blind: true, criteria: ['face', 'clothing', 'style'], scale: [1, 5], usable_threshold: 4 },
      success: { usable_takes_per_shot: 2 },
    };
    expect(benchPlanSchema.parse(plan).name).toBe('coerenza-personaggi-v1');
  });

  it('rifiuta un\'angolazione inventata nella scheda', () => {
    expect(
      benchPlanSchema.safeParse({
        name: 'x',
        budget_usd: 10,
        style: 'realistic',
        cinematography: 'handheld_warm',
        characters: [{ id: 'anna', name: 'Anna', brief: 'x' }],
        sheet: { model: 'nano-banana-2', angles: ['back'], attempts_per_angle: 1 },
        shots: [{ id: 's1', action: 'x', framing: 'close_up', characters: ['anna'] }],
        models: ['nano-banana-2'],
        takes_per_shot: 1,
        duration_s: 5,
        voting: { voters: 1, blind: true, criteria: ['face'], scale: [1, 5], usable_threshold: 4 },
        success: { usable_takes_per_shot: 1 },
      }).success,
    ).toBe(false);
  });
});

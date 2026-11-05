import { describe, expect, it } from 'vitest';

import {
  assemblyJobPayloadSchema,
  assemblyViewSchema,
  setAssemblySceneBodySchema,
} from './assembly-api.js';

describe('il montaggio', () => {
  const titles = { title: 'L’ultima corsa', aiNotice: 'Contiene contenuti generati con AI' };

  it('una vista con cosa manca e senza tentativi è valida', () => {
    const view = assemblyViewSchema.parse({
      scenes: [
        {
          sceneNumber: 1,
          heading: 'Stazione, notte',
          durationS: 12,
          included: false,
          gap: { kind: 'no_take', missing: 2 },
        },
      ],
      filmDurationS: 0,
      plannedDurationS: 60,
      earlier: [],
      upToDate: false,
      exportWorking: false,
      titles,
    });

    expect(view.scenes[0]?.gap?.missing).toBe(2);
    expect(view.latest).toBeUndefined();
  });

  it('un motivo che non esiste, o senza titoli, si rifiuta', () => {
    expect(
      assemblyViewSchema.safeParse({
        scenes: [
          { sceneNumber: 1, heading: 'x', durationS: 1, included: false, gap: { kind: 'boh' } },
        ],
        filmDurationS: 0,
        plannedDurationS: 60,
        earlier: [],
        upToDate: false,
        exportWorking: false,
        titles,
      }).success,
    ).toBe(false);
    expect(
      assemblyViewSchema.safeParse({
        scenes: [],
        filmDurationS: 0,
        plannedDurationS: 60,
        earlier: [],
        upToDate: false,
        exportWorking: false,
      }).success,
    ).toBe(false);
  });

  it('la spunta di una scena vuole sì o no, e nient’altro', () => {
    expect(setAssemblySceneBodySchema.safeParse({ included: false }).success).toBe(true);
    expect(setAssemblySceneBodySchema.safeParse({ included: 'no' }).success).toBe(false);
    expect(setAssemblySceneBodySchema.safeParse({ included: true, x: 1 }).success).toBe(false);
  });

  it('il lavoro in coda porta il film e il tentativo', () => {
    expect(assemblyJobPayloadSchema.safeParse({ projectId: 'f', assemblyId: 'a' }).success).toBe(
      true,
    );
    expect(assemblyJobPayloadSchema.safeParse({ projectId: 'f' }).success).toBe(false);
  });
});

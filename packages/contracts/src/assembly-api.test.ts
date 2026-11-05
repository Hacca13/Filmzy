import { describe, expect, it } from 'vitest';

import { assemblyJobPayloadSchema, assemblyViewSchema } from './assembly-api.js';

describe('il montaggio', () => {
  const titles = { title: 'L’ultima corsa', aiNotice: 'Contiene contenuti generati con AI' };

  it('una vista con cosa manca e senza tentativi è valida', () => {
    const view = assemblyViewSchema.parse({
      gaps: [{ sceneNumber: 1, kind: 'no_take', missing: 2 }],
      upToDate: false,
      exportWorking: false,
      titles,
    });

    expect(view.gaps[0]?.missing).toBe(2);
    expect(view.latest).toBeUndefined();
  });

  it('un motivo che non esiste, o senza titoli, si rifiuta', () => {
    expect(
      assemblyViewSchema.safeParse({
        gaps: [{ sceneNumber: 1, kind: 'boh' }],
        upToDate: false,
        exportWorking: false,
        titles,
      }).success,
    ).toBe(false);
    expect(
      assemblyViewSchema.safeParse({ gaps: [], upToDate: false, exportWorking: false }).success,
    ).toBe(false);
  });

  it('il lavoro in coda porta il film e il tentativo', () => {
    expect(assemblyJobPayloadSchema.safeParse({ projectId: 'f', assemblyId: 'a' }).success).toBe(
      true,
    );
    expect(assemblyJobPayloadSchema.safeParse({ projectId: 'f' }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { exportJobPayloadSchema, exportViewSchema, startExportBodySchema } from './export-api.js';

describe('l’esportazione', () => {
  it('una vista senza film montato e senza tentativi è valida', () => {
    expect(exportViewSchema.parse({})).toEqual({});
  });

  it('un film da esportare deve avere almeno una qualità', () => {
    const source = { width: 1280, height: 720, qualities: [720, 480] };

    expect(exportViewSchema.safeParse({ source }).success).toBe(true);
    expect(exportViewSchema.safeParse({ source: { ...source, qualities: [] } }).success).toBe(
      false,
    );
  });

  it('il file porta dov’è e se viene dall’ultimo film', () => {
    const file = { id: 'e-1', shortSide: 720, path: 'C:\\film.mp4', current: true };

    expect(exportViewSchema.parse({ file }).file).toEqual(file);
    expect(exportViewSchema.safeParse({ file: { ...file, path: '' } }).success).toBe(false);
  });

  it('la richiesta vuole una qualità vera, e nient’altro', () => {
    expect(startExportBodySchema.safeParse({ shortSide: 720 }).success).toBe(true);
    expect(startExportBodySchema.safeParse({ shortSide: 0 }).success).toBe(false);
    expect(startExportBodySchema.safeParse({ shortSide: 720.5 }).success).toBe(false);
    expect(startExportBodySchema.safeParse({}).success).toBe(false);
    expect(startExportBodySchema.safeParse({ shortSide: 720, cartella: 'C:\\' }).success).toBe(
      false,
    );
  });

  it('il lavoro in coda porta il film e il tentativo', () => {
    expect(exportJobPayloadSchema.safeParse({ projectId: 'f', exportId: 'e' }).success).toBe(true);
    expect(exportJobPayloadSchema.safeParse({ projectId: 'f' }).success).toBe(false);
  });
});

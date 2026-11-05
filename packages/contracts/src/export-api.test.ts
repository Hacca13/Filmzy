import { describe, expect, it } from 'vitest';

import {
  EXPORT_ASPECTS,
  aspectParts,
  exportJobPayloadSchema,
  exportViewSchema,
  hasAspect,
  startExportBodySchema,
} from './export-api.js';

describe('l’esportazione', () => {
  it('una vista senza film montato e senza tentativi è valida', () => {
    expect(exportViewSchema.parse({})).toEqual({});
  });

  it('un film da esportare deve avere almeno una qualità', () => {
    const source = { width: 1280, height: 720, qualities: [720, 480], aspects: ['9:16'] };

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

  it('il tipo di file è MP4 se non si dice, e formato e tipo devono esistere', () => {
    expect(startExportBodySchema.parse({ shortSide: 720 })).toEqual({
      shortSide: 720,
      container: 'mp4',
    });
    expect(
      startExportBodySchema.parse({ shortSide: 720, aspect: '9:16', container: 'webm' }),
    ).toEqual({ shortSide: 720, aspect: '9:16', container: 'webm' });
    expect(startExportBodySchema.safeParse({ shortSide: 720, aspect: '2:1' }).success).toBe(false);
    expect(startExportBodySchema.safeParse({ shortSide: 720, container: 'avi' }).success).toBe(
      false,
    );
  });

  it('ogni formato ha le sue due parti, e riconosce le misure arrotondate', () => {
    for (const aspect of EXPORT_ASPECTS) {
      const parts = aspectParts(aspect);
      expect(parts.width).toBeGreaterThan(0);
      expect(parts.height).toBeGreaterThan(0);
    }
    expect(aspectParts('9:16')).toEqual({ width: 9, height: 16 });
    expect(hasAspect({ width: 852, height: 480 }, aspectParts('16:9'))).toBe(true);
    expect(hasAspect({ width: 1080, height: 1920 }, aspectParts('16:9'))).toBe(false);
  });

  it('il lavoro in coda porta il film e il tentativo', () => {
    expect(exportJobPayloadSchema.safeParse({ projectId: 'f', exportId: 'e' }).success).toBe(true);
    expect(exportJobPayloadSchema.safeParse({ projectId: 'f' }).success).toBe(false);
  });
});

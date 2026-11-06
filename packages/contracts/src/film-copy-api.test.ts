import { describe, expect, it } from 'vitest';

import { filmCopyManifestSchema } from './film-copy-api.js';

const manifest = {
  format: 'filmzy-film',
  formatVersion: 1,
  schemaVersion: 32,
  appVersion: '0.4.0',
  exportedAt: '2026-11-06T10:00:00.000Z',
  projectId: 'film-1',
  tables: { projects: [{ id: 'film-1', title: 'L’ultima corsa' }] },
};

describe('l’indice della copia di un film', () => {
  it('si riconosce, con la versione dello schema e le righe', () => {
    expect(filmCopyManifestSchema.parse(manifest)).toEqual(manifest);
  });

  it('un altro file, o una forma che non conosce, si rifiuta', () => {
    expect(filmCopyManifestSchema.safeParse({ ...manifest, format: 'zip' }).success).toBe(false);
    expect(filmCopyManifestSchema.safeParse({ ...manifest, formatVersion: 2 }).success).toBe(false);
    expect(
      filmCopyManifestSchema.safeParse({ ...manifest, tables: { projects: 'x' } }).success,
    ).toBe(false);
  });
});

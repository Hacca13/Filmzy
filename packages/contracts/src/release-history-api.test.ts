import { describe, expect, it } from 'vitest';

import {
  configChangeSchema,
  configDiffSchema,
  releaseListSchema,
  restoreBodySchema,
} from './release-history-api.js';

describe('configChangeSchema', () => {
  it('una voce modificata dice quali campi', () => {
    const change = {
      section: 'models',
      key: 'kling-o3-standard',
      label: 'Kling Standard',
      kind: 'changed',
      fields: ['pricing'],
    };
    expect(configChangeSchema.parse(change)).toEqual(change);
  });

  it.each([
    { section: 'istruzioni', key: 'a', label: 'a', kind: 'added', fields: [] },
    { section: 'roles', key: 'a', label: 'a', kind: 'spostata', fields: [] },
    { section: 'roles', key: '', label: 'a', kind: 'added', fields: [] },
  ])('rifiuta %j', (invalid) => {
    expect(configChangeSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('configDiffSchema', () => {
  it('nessuna differenza è un elenco vuoto', () => {
    expect(configDiffSchema.parse({ changes: [] })).toEqual({ changes: [] });
  });
});

describe('releaseListSchema', () => {
  it('ogni versione dice se è quella attiva', () => {
    const list = {
      releases: [
        {
          id: 'b',
          number: 2,
          hash: 'h2',
          note: 'Ripristino della versione 1',
          createdAt: '2026-10-27T10:00:00.000Z',
          isActive: true,
        },
        { id: 'a', number: 1, hash: 'h1', createdAt: '2026-10-26T10:00:00.000Z', isActive: false },
      ],
    };
    expect(releaseListSchema.parse(list)).toEqual(list);
  });
});

describe('restoreBodySchema', () => {
  it('la nota è obbligatoria, come in ogni pubblicazione', () => {
    expect(restoreBodySchema.parse({ note: ' Ripristino della versione 6 ' })).toEqual({
      note: 'Ripristino della versione 6',
    });
    expect(restoreBodySchema.safeParse({ note: '  ' }).success).toBe(false);
    expect(restoreBodySchema.safeParse({}).success).toBe(false);
  });
});

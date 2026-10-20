import { describe, expect, it } from 'vitest';

import { environmentFileSchema } from './environments.js';

describe('environmentFileSchema', () => {
  it('accetta la sovrapposizione test.yaml/offline.yaml: tutto col fornitore finto', () => {
    const file = {
      connections: {
        '*': { adapter: 'fake', fixtures: 'packages/troupe/test/fixtures' },
      },
    };
    expect(environmentFileSchema.parse(file).connections?.['*']?.adapter).toBe('fake');
  });

  it('accetta la sovrapposizione development.yaml: solo la policy del router', () => {
    const file = {
      roles: {
        camera_operator: { routing: { policy: 'cheap' as const } },
      },
    };
    expect(environmentFileSchema.parse(file).roles?.camera_operator?.routing?.policy).toBe('cheap');
  });

  it('accetta un file senza nessuna sezione', () => {
    expect(environmentFileSchema.parse({})).toEqual({});
  });

  it('rifiuta un campo sconosciuto in una connessione sovrapposta', () => {
    expect(
      environmentFileSchema.safeParse({ connections: { fal: { deliver: 'polling' } } }).success,
    ).toBe(false);
  });
});

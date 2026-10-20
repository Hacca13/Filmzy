import { beforeAll, describe, expect, it } from 'vitest';

import { codeForbiddenTerms } from './forbidden-terms.js';
import type { TroupeConfig } from './load-files.js';
import { loadSeedConfig } from './seed.fixtures.js';

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

describe('codeForbiddenTerms sul catalogo del seme', () => {
  it('vieta gli id dei servizi', () => {
    const terms = codeForbiddenTerms(seed).map((entry) => entry.term);
    expect(terms).toContain('claude-sonnet');
    expect(terms).toContain('nano-banana-2');
    expect(terms).toContain('kling-o3-standard');
  });

  it('vieta gli id presso il fornitore e gli indirizzi delle connessioni', () => {
    const terms = codeForbiddenTerms(seed).map((entry) => entry.term);
    expect(terms).toContain('claude-sonnet-5-5');
    expect(terms).toContain('fal-ai/nano-banana-2');
    expect(terms).toContain('http://localhost:11434/v1');
  });

  it('non vieta un id segnaposto: non è ancora un id', () => {
    const placeholders = codeForbiddenTerms(seed).filter((entry) => entry.term.startsWith('<'));
    expect(placeholders).toEqual([]);
  });

  it('dice perché un termine è vietato, per il messaggio del controllo', () => {
    const term = codeForbiddenTerms(seed).find((entry) => entry.term === 'fal-ai/nano-banana-2');
    expect(term?.why).toBe('è l\'id di "nano-banana-2" presso il fornitore');
  });

  it('cresce da sé quando il catalogo cresce: l\'elenco è il catalogo', () => {
    const before = codeForbiddenTerms(seed).length;
    const after = codeForbiddenTerms({
      ...seed,
      models: {
        ...seed.models,
        'modello-nuovo': { ...seed.models['claude-sonnet'], provider_model: 'fornitore/modello-nuovo' },
      },
    } as TroupeConfig).length;

    expect(after).toBe(before + 2);
  });
});

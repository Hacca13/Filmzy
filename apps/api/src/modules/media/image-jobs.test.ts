import type { TroupeConfig } from '@filmzy/troupe';
import { describe, expect, it } from 'vitest';

import { variantsOf } from './image-jobs.js';

const configWith = (params: Record<string, unknown> | undefined) =>
  ({ roles: { set_designer: params === undefined ? {} : { params } } }) as unknown as TroupeConfig;

describe('variantsOf', () => {
  it('prende il numero scritto nella configurazione del ruolo', () => {
    expect(variantsOf(configWith({ variants: 4 }), 'set_designer', 3)).toBe(4);
  });

  it('senza numero, o per un ruolo che non c’è, usa quello di ripiego', () => {
    expect(variantsOf(configWith(undefined), 'set_designer', 3)).toBe(3);
    expect(variantsOf(configWith({ variants: 4 }), 'altro_ruolo', 3)).toBe(3);
  });

  it('un valore strano non arriva al servizio: zero, negativo, con la virgola, testo', () => {
    for (const variants of [0, -2, 2.5, '3', Number.NaN]) {
      expect(variantsOf(configWith({ variants }), 'set_designer', 3), String(variants)).toBe(3);
    }
  });
});

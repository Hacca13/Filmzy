import { describe, expect, it } from 'vitest';

import { servicePolicyFileSchema } from './policy.js';

describe('servicePolicyFileSchema', () => {
  const rule = { match: ['servizio'], notice: 'I suoi termini vanno letti.' };

  it('accetta una regola con o senza tipi di servizio', () => {
    const file = { version: 1, restricted_services: [rule, { ...rule, kinds: ['music'] }] };

    expect(servicePolicyFileSchema.parse(file).restricted_services).toHaveLength(2);
  });

  it('rifiuta una regola senza scritta, o che non troverebbe niente', () => {
    const noNotice = { version: 1, restricted_services: [{ match: ['servizio'] }] };
    const noMatch = { version: 1, restricted_services: [{ ...rule, match: [] }] };

    expect(servicePolicyFileSchema.safeParse(noNotice).success).toBe(false);
    expect(servicePolicyFileSchema.safeParse(noMatch).success).toBe(false);
  });

  it('rifiuta un tipo di servizio che non esiste', () => {
    const file = { version: 1, restricted_services: [{ ...rule, kinds: ['audio'] }] };

    expect(servicePolicyFileSchema.safeParse(file).success).toBe(false);
  });
});

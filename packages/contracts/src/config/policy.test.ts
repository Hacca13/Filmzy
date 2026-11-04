import { describe, expect, it } from 'vitest';

import { servicePolicyFileSchema } from './policy.js';

describe('servicePolicyFileSchema', () => {
  const rule = { match: ['servizio'], reason: 'I suoi termini non lo permettono.' };

  it('accetta una regola con o senza tipi di servizio', () => {
    const file = { version: 1, blocked_services: [rule, { ...rule, kinds: ['music'] }] };

    expect(servicePolicyFileSchema.parse(file).blocked_services).toHaveLength(2);
  });

  it('rifiuta una regola che non direbbe perché, o che non fermerebbe niente', () => {
    const noReason = { version: 1, blocked_services: [{ match: ['servizio'] }] };
    const noMatch = { version: 1, blocked_services: [{ ...rule, match: [] }] };

    expect(servicePolicyFileSchema.safeParse(noReason).success).toBe(false);
    expect(servicePolicyFileSchema.safeParse(noMatch).success).toBe(false);
  });

  it('rifiuta un tipo di servizio che non esiste', () => {
    const file = { version: 1, blocked_services: [{ ...rule, kinds: ['audio'] }] };

    expect(servicePolicyFileSchema.safeParse(file).success).toBe(false);
  });
});

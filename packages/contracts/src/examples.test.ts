import { describe, expect, it } from 'vitest';

import { ROLE_INPUT_EXAMPLES, ROLE_OUTPUT_EXAMPLES } from './examples.js';
import { ROLE_IDS, ROLE_IO } from './roles.js';

describe('ROLE_INPUT_EXAMPLES', () => {
  it('ha un esempio per ogni ruolo', () => {
    expect(Object.keys(ROLE_INPUT_EXAMPLES).sort()).toEqual([...ROLE_IDS].sort());
  });

  it.each(ROLE_IDS)("l'esempio di %s è valido per il suo schema di input", (role) => {
    const result = ROLE_IO[role].input.safeParse(ROLE_INPUT_EXAMPLES[role]);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });
});

describe('ROLE_OUTPUT_EXAMPLES', () => {
  const llmRoles = ROLE_IDS.filter((role) => ROLE_IO[role].kind === 'llm');

  it('ha una risposta di esempio per ogni ruolo LLM, e solo per quelli', () => {
    expect(Object.keys(ROLE_OUTPUT_EXAMPLES).sort()).toEqual([...llmRoles].sort());
  });

  it.each(llmRoles)('la risposta di esempio di %s è valida per il suo schema', (role) => {
    const schema = ROLE_IO[role].output;
    if (schema === undefined) throw new Error(`il ruolo ${role} non ha uno schema di output`);

    const result = schema.safeParse(ROLE_OUTPUT_EXAMPLES[role]);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { ROLE_INPUT_EXAMPLES } from './examples.js';
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

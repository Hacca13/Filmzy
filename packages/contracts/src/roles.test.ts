import { describe, expect, it } from 'vitest';

import { MODEL_KINDS } from './model-kind.js';
import { ROLE_IDS, ROLE_IO, roleIdSchema } from './roles.js';

describe('roleIdSchema', () => {
  it.each(ROLE_IDS)('accetta %j', (id) => {
    expect(roleIdSchema.parse(id)).toBe(id);
  });

  it("rifiuta un ruolo di Fase 2 non ancora nell'MVP", () => {
    expect(roleIdSchema.safeParse('voice_actor').success).toBe(false);
  });
});

describe('ROLE_IO', () => {
  it('ha una voce per ogni ruolo, con un tipo di modello valido', () => {
    for (const id of ROLE_IDS) {
      const entry = ROLE_IO[id];
      expect(entry).toBeDefined();
      expect(MODEL_KINDS).toContain(entry.kind);
    }
  });

  it('ha un output solo per i ruoli LLM: i ruoli immagine, video e audio restituiscono un file', () => {
    for (const id of ROLE_IDS) {
      const entry = ROLE_IO[id];
      if (entry.kind === 'llm') {
        expect(entry.output).toBeDefined();
      } else {
        expect('output' in entry).toBe(false);
      }
    }
  });
});

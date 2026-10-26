import { describe, expect, it } from 'vitest';

import {
  chooseInstructionVersionBodySchema,
  createInstructionVersionBodySchema,
  instructionsOverviewSchema,
  previewInstructionsBodySchema,
  previewInstructionsResponseSchema,
} from './instructions-api.js';

describe('previewInstructionsBodySchema', () => {
  it('accetta un testo', () => {
    expect(previewInstructionsBodySchema.parse({ text: '---\n---' })).toEqual({ text: '---\n---' });
  });

  it.each([{}, { text: '' }, { text: 'a'.repeat(200_001) }, { text: 3 }])('rifiuta %j', (body) => {
    expect(previewInstructionsBodySchema.safeParse(body).success).toBe(false);
  });
});

describe('createInstructionVersionBodySchema', () => {
  it('la versione di partenza è facoltativa ma deve essere un numero intero positivo', () => {
    expect(createInstructionVersionBodySchema.safeParse({ text: 'x' }).success).toBe(true);
    expect(createInstructionVersionBodySchema.safeParse({ text: 'x', basedOn: 2 }).success).toBe(
      true,
    );
    expect(createInstructionVersionBodySchema.safeParse({ text: 'x', basedOn: 0 }).success).toBe(
      false,
    );
    expect(createInstructionVersionBodySchema.safeParse({ text: 'x', basedOn: 1.5 }).success).toBe(
      false,
    );
  });
});

describe('chooseInstructionVersionBodySchema', () => {
  it('una versione, oppure null per tornare alla consigliata', () => {
    expect(chooseInstructionVersionBodySchema.parse({ version: 3 })).toEqual({ version: 3 });
    expect(chooseInstructionVersionBodySchema.parse({ version: null })).toEqual({ version: null });
  });

  it.each([{}, { version: 0 }, { version: '2' }])('rifiuta %j', (body) => {
    expect(chooseInstructionVersionBodySchema.safeParse(body).success).toBe(false);
  });
});

describe('previewInstructionsResponseSchema', () => {
  it("con errori non c'è l'anteprima", () => {
    const response = {
      issues: [{ severity: 'error', code: 'instruction_variable_unknown', message: 'm' }],
    };
    expect(previewInstructionsResponseSchema.parse(response)).toEqual(response);
  });
});

describe('instructionsOverviewSchema', () => {
  it("una versione del programma e una dell'utente", () => {
    const overview = {
      roles: [
        {
          roleId: 'moderator',
          instructionsId: 'moderator',
          label: 'Moderatore',
          recommended: 1,
          chosen: 'moderator@101',
          inUse: 101,
          availableVariables: ['text', 'context'],
          versions: [
            {
              version: 1,
              origin: 'bundled',
              label: 'Versione 1',
              description: 'Controlla i testi.',
              changelog: ['1: prima versione'],
              variables: ['text'],
              variants: [],
            },
            {
              version: 101,
              origin: 'user',
              label: 'Le mie istruzioni 1',
              description: '',
              changelog: [],
              variables: ['text'],
              variants: [],
              createdAt: '2026-10-26T10:00:00.000Z',
            },
          ],
        },
      ],
    };
    expect(instructionsOverviewSchema.parse(overview)).toEqual(overview);
  });
});

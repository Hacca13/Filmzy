import { ROLE_INPUT_EXAMPLES } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { checkInstructionText, unknownVariables } from './check.js';

const example = ROLE_INPUT_EXAMPLES.moderator;
const options = { roleId: 'moderator', example };

function file(parts: { header?: string; body?: string } = {}): string {
  return `---
id: moderator
version: 1
description: Controlla i testi dell'utente.
variables: [text]
changelog:
  - "1: prima versione"
${parts.header ?? ''}---

${parts.body ?? '## system\nSei il moderatore.\n\n## user\nTesto: {{ text }}\n'}`;
}

describe('checkInstructionText', () => {
  it("un file giusto non ha problemi e mostra il risultato con l'esempio", async () => {
    const check = await checkInstructionText(file(), options);

    expect(check.issues).toEqual([]);
    expect(check.rendered?.system).toBe('Sei il moderatore.');
    expect(check.rendered?.user).toContain('Testo: ');
  });

  it('una parola che non esiste nel testo è un errore che la nomina', async () => {
    const check = await checkInstructionText(
      file({ body: '## system\nCiao.\n\n## user\nTesto: {{ nome }}\n' }),
      options,
    );

    expect(check.rendered).toBeUndefined();
    expect(check.issues).toHaveLength(1);
    expect(check.issues[0]).toMatchObject({
      severity: 'error',
      code: 'instruction_variable_unknown',
      message: 'Nel file c\'è una parola che non esiste: "nome".',
      field: 'nome',
      role: 'moderator',
    });
  });

  it("una parola dichiarata nell'intestazione che il ruolo non ha è un errore che la nomina", async () => {
    const check = await checkInstructionText(
      file().replace('variables: [text]', 'variables: [text, nome]'),
      options,
    );

    expect(check.issues.map((issue) => issue.field)).toEqual(['nome']);
  });

  it("un campo dell'input che il testo non usa non è un problema", async () => {
    const check = await checkInstructionText(
      file({ body: '## system\nCiao.\n\n## user\nSolo questo.\n' }),
      options,
    );

    expect(check.issues).toEqual([]);
  });

  it('un testo senza intestazione dice cosa manca', async () => {
    const check = await checkInstructionText('## system\nCiao.\n', options);

    expect(check.instruction).toBeUndefined();
    expect(check.issues[0]?.code).toBe('instruction_header_missing');
  });

  it('una sezione non ammessa è un errore', async () => {
    const check = await checkInstructionText(
      file({ body: '## system\nCiao.\n\n## inventata\nx\n' }),
      options,
    );

    expect(check.issues.map((issue) => issue.code)).toContain('instruction_section_unknown');
  });

  it('un file per un altro ruolo è rifiutato', async () => {
    const check = await checkInstructionText(file(), { roleId: 'screenwriter', example });

    expect(check.issues[0]?.code).toBe('instruction_id_mismatch');
  });

  it('un file di variante non è un file base', async () => {
    const check = await checkInstructionText(
      file({ header: 'variant: seedance\nmode: append\n' }),
      options,
    );

    expect(check.issues[0]?.code).toBe('instruction_variant_not_allowed');
  });

  it("un template rotto è un errore, non un'eccezione", async () => {
    const check = await checkInstructionText(
      file({ body: '## system\n{% if %}\n\n## user\nx\n' }),
      options,
    );

    expect(check.issues[0]?.code).toBe('instruction_render_failed');
  });
});

describe('unknownVariables', () => {
  it('elenca solo quelle che mancano', () => {
    expect(unknownVariables(['a', 'b'], { a: 1 })).toEqual(['b']);
  });

  it('senza un esempio da confrontare non dice niente', () => {
    expect(unknownVariables(['a'], undefined)).toEqual([]);
  });
});

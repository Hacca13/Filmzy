import { describe, expect, it } from 'vitest';

import { checkSections, parseInstructionFile } from './parse.js';

const valid = `---
id: moderator
version: 1
description: Controlla i testi dell'utente.
variables: [text, context, language]
changelog:
  - "1 (2026-10-19): prima versione"
---

## system
Sei il moderatore.

## user
Testo: {{ text }}
`;

describe('parseInstructionFile', () => {
  it('legge intestazione e sezioni', () => {
    const { instruction, errors } = parseInstructionFile(valid);

    expect(errors).toBeUndefined();
    expect(instruction?.header.id).toBe('moderator');
    expect(Object.keys(instruction?.sections ?? {})).toEqual(['system', 'user']);
    expect(instruction?.sections.user).toContain('{{ text }}');
  });

  it("dice quando manca l'intestazione", () => {
    const { instruction, errors } = parseInstructionFile('## system\nSei il moderatore.');

    expect(instruction).toBeUndefined();
    expect(errors?.[0]?.code).toBe('instruction_header_missing');
  });

  it("nomina il campo quando l'intestazione è incompleta", () => {
    const { errors } = parseInstructionFile(
      '---\nid: moderator\nversion: 1\n---\n\n## system\nx\n',
    );

    expect(errors?.[0]?.code).toBe('instruction_header_invalid');
    expect(errors?.map((error) => error.field)).toContain('description');
  });
});

describe('checkSections', () => {
  it('accetta system e user per un ruolo di testo', () => {
    const { instruction } = parseInstructionFile(valid);
    if (instruction === undefined) throw new Error('il file di prova non si è letto');

    expect(checkSections(instruction)).toEqual([]);
  });

  it('pretende "## prompt" in un template di immagine, e nient\'altro', () => {
    const raw = `---
id: character_designer
version: 1
kind: image_prompt
description: Prompt della scheda personaggio.
variables: [character, style, angle]
changelog: ["1 (2026-10-19): prima versione"]
---

## system
Sei il character designer.
`;
    const { instruction } = parseInstructionFile(raw);
    if (instruction === undefined) throw new Error('il file di prova non si è letto');

    const codes = checkSections(instruction).map((error) => error.code);
    expect(codes).toContain('instruction_section_unknown');
    expect(codes).toContain('instruction_section_missing');
  });
});

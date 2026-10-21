import { instructionHeaderSchema, type InstructionHeader } from '@filmzy/contracts';
import { parse as parseYaml } from 'yaml';

/** Le sezioni ammesse nel corpo di un file di istruzioni (architettura §4.4). */
export const SECTIONS_BY_KIND = {
  llm: ['system', 'user'],
  image_prompt: ['prompt'],
  audio_prompt: ['prompt'],
} as const;

export interface InstructionFile {
  header: InstructionHeader;
  sections: Record<string, string>;
}

export class InstructionParseError extends Error {
  constructor(
    readonly code:
      | 'instruction_header_missing'
      | 'instruction_header_invalid'
      | 'instruction_section_missing'
      | 'instruction_section_unknown',
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = 'InstructionParseError';
  }
}

/**
 * Legge un file di istruzioni: intestazione YAML tra `---` e corpo diviso in sezioni `## nome`
 * (architettura §4.4). I testi stanno in file di testo e non in JSON perché un prompt lungo con
 * gli a capo scritti `\n` è illeggibile (D38).
 *
 * Non lancia: restituisce gli errori, così il validatore può elencarli tutti e la troupe può
 * trasformare il primo in un errore del dominio.
 */
export function parseInstructionFile(
  raw: string,
):
  | { instruction: InstructionFile; errors?: undefined }
  | { instruction?: undefined; errors: InstructionParseError[] } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (match?.[1] === undefined || match[2] === undefined) {
    return {
      errors: [
        new InstructionParseError(
          'instruction_header_missing',
          'manca l’intestazione tra "---" all’inizio del file',
        ),
      ],
    };
  }

  let header: unknown;
  try {
    header = parseYaml(match[1]);
  } catch (error) {
    return {
      errors: [
        new InstructionParseError(
          'instruction_header_invalid',
          `l’intestazione non è YAML valido (${error instanceof Error ? error.message : String(error)})`,
        ),
      ],
    };
  }

  const parsed = instructionHeaderSchema.safeParse(header);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map(
        (issue) =>
          new InstructionParseError(
            'instruction_header_invalid',
            `intestazione non valida, ${issue.path.join('.')} — ${issue.message}`,
            issue.path.join('.'),
          ),
      ),
    };
  }

  return { instruction: { header: parsed.data, sections: splitSections(match[2]) } };
}

function splitSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let current: string | undefined;

  for (const line of body.split(/\r?\n/)) {
    const heading = /^##\s+(\S+)\s*$/.exec(line);
    if (heading?.[1] !== undefined) {
      current = heading[1];
      sections[current] = '';
      continue;
    }
    if (current !== undefined) sections[current] = `${sections[current] ?? ''}${line}\n`;
  }

  return sections;
}

/** Le sezioni che quel tipo di istruzioni deve avere, e nessun'altra (architettura §4.4). */
export function checkSections(instruction: InstructionFile): InstructionParseError[] {
  const { header, sections } = instruction;
  const allowed = SECTIONS_BY_KIND[header.kind ?? 'llm'];
  const errors: InstructionParseError[] = [];

  for (const name of Object.keys(sections)) {
    if (!(allowed as readonly string[]).includes(name)) {
      errors.push(
        new InstructionParseError(
          'instruction_section_unknown',
          `la sezione "## ${name}" non è ammessa; qui vanno ${allowed.map((s) => `## ${s}`).join(' e ')}`,
        ),
      );
    }
  }

  const required = header.kind === undefined ? 'system' : 'prompt';
  if (!(required in sections)) {
    errors.push(
      new InstructionParseError(
        'instruction_section_missing',
        `manca la sezione "## ${required}"`,
        required,
      ),
    );
  }

  return errors;
}

import type { ConfigIssue } from '../config/issues.js';
import { checkSections, parseInstructionFile, type InstructionFile } from './parse.js';
import { InstructionRenderError, renderSections } from './render.js';

/**
 * Il controllo di un testo di istruzioni scritto o caricato dall'utente (architettura §4.4, D38):
 * stessa struttura dei file del programma, stesso rendering in modalità rigorosa con l'input di
 * esempio del ruolo (D39). Chi sbaglia una variabile ne vede il nome, non un prompt con un buco.
 *
 * Non lancia: restituisce i problemi, così l'interfaccia li mostra tutti insieme.
 */
export interface CheckInstructionOptions {
  roleId: string;
  /** L'input di esempio del ruolo: ciò che il template può leggere. */
  example: unknown;
}

export interface InstructionCheck {
  /** Il file letto, se la struttura è a posto. */
  instruction?: InstructionFile;
  /** L'anteprima: le sezioni rese con l'input di esempio. Solo se non ci sono errori. */
  rendered?: Record<string, string>;
  issues: ConfigIssue[];
}

/** Le variabili che il template dichiara e l'input del ruolo non ha. Il contrario è normale. */
export function unknownVariables(declared: readonly string[], example: unknown): string[] {
  if (typeof example !== 'object' || example === null) return [];
  const available = new Set(Object.keys(example));
  return declared.filter((variable) => !available.has(variable));
}

export function unknownVariableMessage(variable: string): string {
  return `Nel file c'è una parola che non esiste: "${variable}".`;
}

export async function checkInstructionText(
  raw: string,
  { roleId, example }: CheckInstructionOptions,
): Promise<InstructionCheck> {
  const parsed = parseInstructionFile(raw);
  if (parsed.instruction === undefined) {
    return {
      issues: parsed.errors.map((error) => problem(roleId, error.code, error.message, error.field)),
    };
  }

  const { instruction } = parsed;
  const issues = [...structureIssues(roleId, instruction)];
  for (const variable of unknownVariables(instruction.header.variables, example)) {
    issues.push(
      problem(roleId, 'instruction_variable_unknown', unknownVariableMessage(variable), variable),
    );
  }
  if (issues.length > 0) return { instruction, issues };

  try {
    return { instruction, rendered: await renderSections(instruction.sections, example), issues };
  } catch (error) {
    return { instruction, issues: [renderIssue(roleId, error)] };
  }
}

function structureIssues(roleId: string, instruction: InstructionFile): ConfigIssue[] {
  const { header } = instruction;
  const issues = checkSections(instruction).map((error) =>
    problem(roleId, error.code, `Nel file ${error.message}.`, error.field),
  );

  if (header.id !== roleId) {
    issues.push(
      problem(
        roleId,
        'instruction_id_mismatch',
        `Questo file è per "${header.id}", ma lo stai usando per "${roleId}".`,
        'id',
      ),
    );
  }
  if (header.variant !== undefined) {
    issues.push(
      problem(
        roleId,
        'instruction_variant_not_allowed',
        'Questo file è una variante per una famiglia di servizi: qui serve il file base. Le varianti si copiano dalla versione di partenza.',
        'variant',
      ),
    );
  }
  return issues;
}

/** LiquidJS dice `undefined variable: nome, line:3, col:5`: il nome è quello che serve all'utente. */
function renderIssue(roleId: string, error: unknown): ConfigIssue {
  if (!(error instanceof InstructionRenderError)) {
    return problem(roleId, 'instruction_render_failed', 'Le istruzioni non si riescono a leggere.');
  }

  const name = /undefined variable: ([^\s,]+)/.exec(error.reason)?.[1];
  if (name !== undefined) {
    return problem(roleId, 'instruction_variable_unknown', unknownVariableMessage(name), name);
  }
  return problem(roleId, 'instruction_render_failed', `Nel file ${error.message}.`);
}

function problem(roleId: string, code: string, message: string, field?: string): ConfigIssue {
  return {
    severity: 'error',
    code,
    message,
    section: 'instructions',
    role: roleId,
    key: roleId,
    ...(field === undefined ? {} : { field }),
  };
}

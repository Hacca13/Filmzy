import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  instructionHeaderSchema,
  instructionsManifestSchema,
  ROLE_INPUT_EXAMPLES,
  type InstructionHeader,
  type InstructionsManifest,
} from '@filmzy/contracts';
import { Liquid } from 'liquidjs';
import { parse as parseYaml } from 'yaml';

import { messageOf, type ConfigIssue } from './issues.js';
import type { TroupeConfig } from './load-files.js';

/** Le sezioni ammesse nel corpo di un file di istruzioni (architettura §4.4). */
const SECTIONS_BY_KIND = {
  llm: ['system', 'user'],
  image_prompt: ['prompt'],
  audio_prompt: ['prompt'],
} as const;

export interface InstructionFile {
  header: InstructionHeader;
  sections: Record<string, string>;
}

/**
 * Legge un file di istruzioni: intestazione YAML tra `---` e corpo diviso in sezioni `## nome`
 * (architettura §4.4). I testi stanno in file di testo e non in JSON perché un prompt lungo con
 * gli a capo scritti `\n` è illeggibile (D38).
 */
export function parseInstructionFile(
  file: string,
  raw: string,
): { instruction?: InstructionFile; issues: ConfigIssue[] } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (match?.[1] === undefined || match[2] === undefined) {
    return {
      issues: [
        issue(
          `${file}: manca l'intestazione tra "---" all'inizio del file.`,
          'instruction_header_missing',
          file,
        ),
      ],
    };
  }

  let header: unknown;
  try {
    header = parseYaml(match[1]);
  } catch (error) {
    return {
      issues: [
        issue(
          `${file}: l'intestazione non è YAML valido (${messageOf(error)}).`,
          'instruction_header_invalid',
          file,
        ),
      ],
    };
  }

  const parsed = instructionHeaderSchema.safeParse(header);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((problem) =>
        issue(
          `${file}: intestazione non valida, ${problem.path.join('.')} — ${problem.message}.`,
          'instruction_header_invalid',
          file,
          problem.path.join('.'),
        ),
      ),
    };
  }

  return { instruction: { header: parsed.data, sections: splitSections(match[2]) }, issues: [] };
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

export interface ValidateInstructionsOptions {
  /** Gli input di esempio con cui provare il rendering (architettura §4.6 punto 4). */
  examples?: Record<string, unknown>;
}

/**
 * Controllo 4 di §4.6: per ogni ruolo con istruzioni, la versione esiste nel manifesto,
 * l'intestazione combacia e un rendering di prova in **modalità rigorosa** non trova variabili
 * inesistenti. È il controllo che impedisce di pubblicare un prompt con un buco.
 */
export async function validateInstructions(
  config: TroupeConfig,
  instructionsDir: string,
  options: ValidateInstructionsOptions = {},
): Promise<ConfigIssue[]> {
  const examples: Record<string, unknown> = options.examples ?? ROLE_INPUT_EXAMPLES;
  const issues: ConfigIssue[] = [];

  for (const [roleId, role] of Object.entries(config.roles)) {
    if (role?.instructions === undefined) continue;

    const [id, version] = splitRef(role.instructions);
    if (id === undefined || version === undefined) {
      issues.push(
        roleIssue(
          `Il ruolo "${roleId}" cita le istruzioni "${role.instructions}": serve la forma id@versione.`,
          'instructions_ref_invalid',
          roleId,
        ),
      );
      continue;
    }

    const manifest = await readManifest(instructionsDir, id, roleId, issues);
    if (manifest === undefined) continue;

    const entry = manifest.versions.find((candidate) => candidate.version === version);
    if (entry === undefined) {
      issues.push(
        roleIssue(
          `Il ruolo "${roleId}" usa le istruzioni "${role.instructions}", ma il manifesto di "${id}" non ha quella versione.`,
          'instructions_version_missing',
          roleId,
        ),
      );
      continue;
    }

    const files = [
      { file: entry.file, variant: undefined },
      ...(entry.variants ?? []).map((variant) => ({ file: variant.file, variant: variant.family })),
    ];

    for (const { file, variant } of files) {
      await checkInstructionFile({
        dir: path.join(instructionsDir, id),
        file,
        variant,
        id,
        version,
        roleId,
        example: examples[roleId],
        issues,
      });
    }
  }

  return issues;
}

async function readManifest(
  instructionsDir: string,
  id: string,
  roleId: string,
  issues: ConfigIssue[],
): Promise<InstructionsManifest | undefined> {
  const file = path.join(id, 'manifest.json');
  let raw: string;
  try {
    raw = await readFile(path.join(instructionsDir, file), 'utf8');
  } catch {
    issues.push(
      roleIssue(
        `Le istruzioni "${id}" del ruolo "${roleId}" non hanno un manifest.json.`,
        'instructions_manifest_missing',
        roleId,
        file,
      ),
    );
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    issues.push(
      roleIssue(
        `${file}: non è JSON valido (${messageOf(error)}).`,
        'instructions_manifest_invalid',
        roleId,
        file,
      ),
    );
    return undefined;
  }

  const manifest = instructionsManifestSchema.safeParse(parsed);
  if (!manifest.success) {
    issues.push(
      ...manifest.error.issues.map((problem) =>
        roleIssue(
          `${file}: ${problem.path.join('.')} — ${problem.message}.`,
          'instructions_manifest_invalid',
          roleId,
          file,
        ),
      ),
    );
    return undefined;
  }

  if (manifest.data.id !== id) {
    issues.push(
      roleIssue(
        `${file}: l'id "${manifest.data.id}" non combacia con la cartella "${id}".`,
        'instructions_manifest_invalid',
        roleId,
        file,
      ),
    );
    return undefined;
  }

  return manifest.data;
}

interface CheckFileArgs {
  dir: string;
  file: string;
  variant: string | undefined;
  id: string;
  version: number;
  roleId: string;
  example: unknown;
  issues: ConfigIssue[];
}

async function checkInstructionFile(args: CheckFileArgs): Promise<void> {
  const { dir, file, variant, id, version, roleId, example, issues } = args;
  const shown = path.join(id, file);

  let raw: string;
  try {
    raw = await readFile(path.join(dir, file), 'utf8');
  } catch {
    issues.push(
      roleIssue(`Il file di istruzioni "${shown}" non esiste.`, 'instruction_file_missing', roleId, shown),
    );
    return;
  }

  const parsed = parseInstructionFile(shown, raw);
  issues.push(...parsed.issues.map((problem) => ({ ...problem, role: roleId })));
  const instruction = parsed.instruction;
  if (instruction === undefined) return;

  const { header, sections } = instruction;
  if (header.id !== id || header.version !== version) {
    issues.push(
      roleIssue(
        `${shown}: l'intestazione dice ${header.id}@${String(header.version)}, ma il file sta in "${id}" come versione ${String(version)}.`,
        'instruction_header_mismatch',
        roleId,
        shown,
      ),
    );
  }

  if (variant !== undefined && header.variant !== variant) {
    issues.push(
      roleIssue(
        `${shown}: il manifesto lo dà come variante "${variant}", l'intestazione dice "${header.variant ?? 'nessuna'}".`,
        'instruction_variant_mismatch',
        roleId,
        shown,
      ),
    );
  }

  checkSections(sections, header, shown, roleId, issues);
  checkDeclaredVariables(header, example, shown, roleId, issues);
  await renderSections(sections, example, shown, roleId, issues);
}

function checkSections(
  sections: Record<string, string>,
  header: InstructionHeader,
  shown: string,
  roleId: string,
  issues: ConfigIssue[],
): void {
  const allowed = SECTIONS_BY_KIND[header.kind ?? 'llm'];
  const found = Object.keys(sections);

  for (const name of found) {
    if (!(allowed as readonly string[]).includes(name)) {
      issues.push(
        roleIssue(
          `${shown}: la sezione "## ${name}" non è ammessa; qui vanno ${allowed.map((s) => `## ${s}`).join(' e ')}.`,
          'instruction_section_unknown',
          roleId,
          shown,
        ),
      );
    }
  }

  const required = header.kind === undefined ? 'system' : 'prompt';
  if (!found.includes(required)) {
    issues.push(
      roleIssue(
        `${shown}: manca la sezione "## ${required}".`,
        'instruction_section_missing',
        roleId,
        shown,
      ),
    );
  }
}

/**
 * Le variabili dichiarate devono esistere nell'input del ruolo. Il contrario è normale: un campo
 * dell'input che il template non usa ancora non è un problema (per esempio `moodboard`, che arriva
 * ai ruoli ma le istruzioni v1 non leggono).
 */
function checkDeclaredVariables(
  header: InstructionHeader,
  example: unknown,
  shown: string,
  roleId: string,
  issues: ConfigIssue[],
): void {
  if (typeof example !== 'object' || example === null) return;
  const available = new Set(Object.keys(example));

  for (const variable of header.variables) {
    if (!available.has(variable)) {
      issues.push(
        roleIssue(
          `${shown}: dichiara la variabile "${variable}", che l'input del ruolo "${roleId}" non ha.`,
          'instruction_variable_unknown',
          roleId,
          shown,
          variable,
        ),
      );
    }
  }
}

async function renderSections(
  sections: Record<string, string>,
  example: unknown,
  shown: string,
  roleId: string,
  issues: ConfigIssue[],
): Promise<void> {
  if (example === undefined) {
    issues.push(
      roleIssue(
        `Il ruolo "${roleId}" non ha un input di esempio: senza, non si può provare il rendering delle istruzioni.`,
        'instruction_example_missing',
        roleId,
        shown,
      ),
    );
    return;
  }

  // Modalità rigorosa: una variabile che non esiste è un errore, non un prompt con un buco.
  const engine = new Liquid({ strictVariables: true, strictFilters: true });

  for (const [name, template] of Object.entries(sections)) {
    try {
      await engine.parseAndRender(template, example as Record<string, unknown>);
    } catch (error) {
      issues.push(
        roleIssue(
          `${shown}: la sezione "## ${name}" non si rende con l'input di esempio — ${messageOf(error)}.`,
          'instruction_render_failed',
          roleId,
          shown,
          name,
        ),
      );
    }
  }
}

function splitRef(ref: string): [string | undefined, number | undefined] {
  const match = /^([a-z0-9_-]+)@([0-9]+)$/.exec(ref);
  if (match?.[1] === undefined || match[2] === undefined) return [undefined, undefined];
  return [match[1], Number(match[2])];
}

function issue(
  message: string,
  code: string,
  file: string,
  field?: string,
): ConfigIssue {
  return { severity: 'error', code, message, section: 'instructions', file, field };
}

function roleIssue(
  message: string,
  code: string,
  roleId: string,
  file?: string,
  field?: string,
): ConfigIssue {
  return { severity: 'error', code, message, section: 'instructions', role: roleId, key: roleId, file, field };
}

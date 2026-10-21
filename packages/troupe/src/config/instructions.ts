import { ROLE_INPUT_EXAMPLES } from '@filmzy/contracts';

import { renderSections } from '../instructions/render.js';
import {
  FileInstructionsSource,
  InstructionResolveError,
  resolveInstructions,
  type InstructionsSource,
  type ResolvedInstructions,
} from '../instructions/resolve.js';
import type { ConfigIssue } from './issues.js';
import type { TroupeConfig } from './load-files.js';

export interface ValidateInstructionsOptions {
  /** Gli input di esempio con cui provare il rendering (architettura §4.6 punto 4, D39). */
  examples?: Record<string, unknown>;
}

/**
 * Controllo 4 di §4.6: per ogni ruolo con istruzioni, la versione esiste nel manifesto,
 * l'intestazione combacia e un rendering di prova in **modalità rigorosa** non trova variabili
 * inesistenti — varianti per famiglia comprese. È il controllo che impedisce di pubblicare un
 * prompt con un buco.
 *
 * Usa gli stessi moduli con cui la troupe compone le istruzioni a tempo di esecuzione: così ciò
 * che passa il controllo è esattamente ciò che poi gira.
 */
export async function validateInstructions(
  config: TroupeConfig,
  instructionsDir: string,
  options: ValidateInstructionsOptions = {},
): Promise<ConfigIssue[]> {
  const examples: Record<string, unknown> = options.examples ?? ROLE_INPUT_EXAMPLES;
  const source = new FileInstructionsSource(instructionsDir);
  const issues: ConfigIssue[] = [];

  for (const [roleId, role] of Object.entries(config.roles)) {
    if (role?.instructions === undefined) continue;
    issues.push(...(await checkRoleInstructions(source, roleId, role.instructions, examples[roleId])));
  }

  return issues;
}

async function checkRoleInstructions(
  source: InstructionsSource,
  roleId: string,
  releaseRef: string,
  example: unknown,
): Promise<ConfigIssue[]> {
  if (example === undefined) {
    return [
      issue(
        roleId,
        'instruction_example_missing',
        `Il ruolo "${roleId}" non ha un input di esempio: senza, non si può provare il rendering delle sue istruzioni.`,
      ),
    ];
  }

  // Le famiglie da provare: la base, più ogni variante dichiarata dal manifesto.
  let families: (string | undefined)[];
  try {
    const base = await resolveInstructions(source, { fallbackId: roleId, releaseRef });
    const manifest = await source.manifest(base.id);
    const entry = manifest.versions.find((candidate) => candidate.version === base.version);
    families = [undefined, ...(entry?.variants ?? []).map((variant) => variant.family)];
  } catch (error) {
    return [resolveIssue(roleId, error)];
  }

  const issues: ConfigIssue[] = [];
  for (const family of families) {
    try {
      const resolved = await resolveInstructions(source, { fallbackId: roleId, releaseRef, family });
      issues.push(...declaredVariableIssues(roleId, resolved, example));
      await renderSections(resolved.sections, example);
    } catch (error) {
      issues.push(resolveIssue(roleId, error, family));
    }
  }

  return issues;
}

/**
 * Le variabili dichiarate nell'intestazione devono esistere nell'input del ruolo. Il contrario è
 * normale: un campo dell'input che il template non usa ancora non è un problema (per esempio
 * `moodboard`, che arriva ai ruoli ma le istruzioni v1 non leggono).
 */
function declaredVariableIssues(
  roleId: string,
  resolved: ResolvedInstructions,
  example: unknown,
): ConfigIssue[] {
  if (typeof example !== 'object' || example === null) return [];
  const available = new Set(Object.keys(example));

  return resolved.variables
    .filter((variable) => !available.has(variable))
    .map((variable) =>
      issue(
        roleId,
        'instruction_variable_unknown',
        `Le istruzioni "${resolved.id}@${String(resolved.version)}" dichiarano la variabile "${variable}", che l'input del ruolo "${roleId}" non ha.`,
        variable,
      ),
    );
}

function resolveIssue(roleId: string, error: unknown, family?: string): ConfigIssue {
  if (error instanceof InstructionResolveError) {
    return issue(
      roleId,
      error.code,
      `Le istruzioni del ruolo "${roleId}"${family === undefined ? '' : ` (variante ${family})`}: ${error.message}.`,
      error.details.field,
    );
  }
  return issue(
    roleId,
    'instruction_render_failed',
    `Le istruzioni del ruolo "${roleId}"${family === undefined ? '' : ` (variante ${family})`}: ${error instanceof Error ? error.message : String(error)}.`,
  );
}

function issue(roleId: string, code: string, message: string, field?: string): ConfigIssue {
  return { severity: 'error', code, message, section: 'instructions', role: roleId, key: roleId, field };
}

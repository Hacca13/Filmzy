import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { instructionsManifestSchema, type InstructionsManifest } from '@filmzy/contracts';

import { checkSections, parseInstructionFile, type InstructionFile } from './parse.js';

/**
 * Da dove arrivano i file delle istruzioni: dalla cartella del seme oggi, dalla tabella
 * `instruction_versions` in M2, quando l'utente potrà caricarne di sue (D38). La troupe non legge
 * il database da sé (§3), quindi passa da qui.
 */
export interface InstructionsSource {
  manifest(id: string): Promise<InstructionsManifest>;
  file(id: string, file: string): Promise<string>;
}

export class InstructionResolveError extends Error {
  constructor(
    readonly code:
      | 'instructions_ref_invalid'
      | 'instructions_manifest_missing'
      | 'instructions_manifest_invalid'
      | 'instructions_version_missing'
      | 'instruction_file_missing'
      | 'instruction_invalid',
    message: string,
    readonly details: { id?: string; version?: number; file?: string; field?: string } = {},
  ) {
    super(message);
    this.name = 'InstructionResolveError';
  }
}

/** Le istruzioni della cartella di un seme (`config/ai/instructions`). */
export class FileInstructionsSource implements InstructionsSource {
  constructor(private readonly dir: string) {}

  async manifest(id: string): Promise<InstructionsManifest> {
    const file = path.join(id, 'manifest.json');
    let raw: string;
    try {
      raw = await readFile(path.join(this.dir, file), 'utf8');
    } catch {
      throw new InstructionResolveError(
        'instructions_manifest_missing',
        `le istruzioni "${id}" non hanno un manifest.json`,
        { id, file },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new InstructionResolveError(
        'instructions_manifest_invalid',
        `${file}: non è JSON valido (${error instanceof Error ? error.message : String(error)})`,
        { id, file },
      );
    }

    const manifest = instructionsManifestSchema.safeParse(parsed);
    if (!manifest.success) {
      throw new InstructionResolveError(
        'instructions_manifest_invalid',
        `${file}: ${manifest.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; ')}`,
        { id, file },
      );
    }
    if (manifest.data.id !== id) {
      throw new InstructionResolveError(
        'instructions_manifest_invalid',
        `${file}: l'id "${manifest.data.id}" non combacia con la cartella "${id}"`,
        { id, file },
      );
    }

    return manifest.data;
  }

  async file(id: string, file: string): Promise<string> {
    try {
      return await readFile(path.join(this.dir, id, file), 'utf8');
    } catch {
      throw new InstructionResolveError(
        'instruction_file_missing',
        `il file di istruzioni "${path.join(id, file)}" non esiste`,
        { id, file },
      );
    }
  }
}

export interface ResolveInstructionsOptions {
  /** L'id delle istruzioni quando nessun riferimento lo dice: di norma il ruolo stesso. */
  fallbackId: string;
  /** Il riferimento `id@versione` della release (`instructions:` del ruolo). */
  releaseRef?: string;
  /** La versione scelta dall'utente in «Chi fa cosa» (`roleSettings.instructions`, D38). */
  userRef?: string;
  /** La famiglia del modello che lavorerà: decide la variante (§4.4). */
  family?: string;
}

export interface ResolvedInstructions {
  id: string;
  version: number;
  /** La famiglia della variante applicata, se ce n'era una. */
  variant?: string;
  /** Le sezioni già composte (base più variante), ancora da rendere. */
  sections: Record<string, string>;
  /** Le variabili dichiarate dalle intestazioni: le usa il validatore (§4.6 punto 4). */
  variables: string[];
}

/**
 * Scegli la versione e componi la variante (architettura §4.4, D38). L'ordine è: quella scelta
 * dall'utente, poi quella citata dalla release, poi la consigliata dal manifesto — **un
 * aggiornamento non cambia la scelta dell'utente**.
 */
export async function resolveInstructions(
  source: InstructionsSource,
  options: ResolveInstructionsOptions,
): Promise<ResolvedInstructions> {
  const chosen = options.userRef ?? options.releaseRef;
  const ref = chosen === undefined ? undefined : parseInstructionsRef(chosen);
  const id = ref?.id ?? options.fallbackId;

  const manifest = await source.manifest(id);
  const version = ref?.version ?? manifest.recommended;

  const entry = manifest.versions.find((candidate) => candidate.version === version);
  if (entry === undefined) {
    throw new InstructionResolveError(
      'instructions_version_missing',
      `le istruzioni "${id}" non hanno la versione ${String(version)}`,
      { id, version },
    );
  }

  const base = await load(source, id, entry.file, version);
  const variant = options.family
    ? entry.variants?.find((candidate) => candidate.family === options.family)
    : undefined;

  if (variant === undefined) {
    return { id, version, sections: base.sections, variables: base.header.variables };
  }

  const extra = await load(source, id, variant.file, version, variant.family);
  return {
    id,
    version,
    variant: variant.family,
    sections:
      variant.mode === 'replace' ? extra.sections : appendSections(base.sections, extra.sections),
    variables: [...new Set([...base.header.variables, ...extra.header.variables])],
  };
}

/** `append` attacca alla base, sezione per sezione; `replace` la sostituisce del tutto (§4.4). */
function appendSections(
  base: Record<string, string>,
  extra: Record<string, string>,
): Record<string, string> {
  const composed: Record<string, string> = { ...base };
  for (const [name, text] of Object.entries(extra)) {
    const current = composed[name];
    composed[name] = current === undefined ? text : `${current.trimEnd()}\n\n${text}`;
  }
  return composed;
}

async function load(
  source: InstructionsSource,
  id: string,
  file: string,
  version: number,
  variant?: string,
): Promise<InstructionFile> {
  const raw = await source.file(id, file);
  const parsed = parseInstructionFile(raw);
  if (parsed.instruction === undefined) {
    throw new InstructionResolveError(
      'instruction_invalid',
      `${path.join(id, file)}: ${parsed.errors.map((error) => error.message).join('; ')}`,
      { id, version, file, field: parsed.errors[0]?.field },
    );
  }

  const { header } = parsed.instruction;
  if (header.id !== id || header.version !== version) {
    throw new InstructionResolveError(
      'instruction_invalid',
      `${path.join(id, file)}: l'intestazione dice ${header.id}@${String(header.version)}, ma il file sta in "${id}" come versione ${String(version)}`,
      { id, version, file },
    );
  }
  if (header.variant !== variant) {
    throw new InstructionResolveError(
      'instruction_invalid',
      `${path.join(id, file)}: il manifesto lo dà come variante "${variant ?? 'nessuna'}", l'intestazione dice "${header.variant ?? 'nessuna'}"`,
      { id, version, file },
    );
  }

  const sectionErrors = checkSections(parsed.instruction);
  if (sectionErrors.length > 0) {
    throw new InstructionResolveError(
      'instruction_invalid',
      `${path.join(id, file)}: ${sectionErrors.map((error) => error.message).join('; ')}`,
      { id, version, file, field: sectionErrors[0]?.field },
    );
  }

  return parsed.instruction;
}

/** Legge `id@versione`; lancia `instructions_ref_invalid` se la forma è un'altra. */
export function parseInstructionsRef(ref: string): { id: string; version: number } {
  const match = /^([a-z0-9_-]+)@([0-9]+)$/.exec(ref);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new InstructionResolveError(
      'instructions_ref_invalid',
      `"${ref}" non è un riferimento alle istruzioni: serve la forma id@versione`,
    );
  }
  return { id: match[1], version: Number(match[2]) };
}

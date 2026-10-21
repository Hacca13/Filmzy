import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createTroupe,
  FileConfigSource,
  FileInstructionsSource,
  MemoryReceiptSink,
  type ConfigEnvironment,
} from '@filmzy/troupe';
import { z } from 'zod';

/**
 * Le valutazioni dei ruoli di testo (architettura §4.13): esempi fissi in `config/evals/<ruolo>/`,
 * il ruolo gira su ognuno e si controlla che la risposta rispetti lo schema e poche regole
 * semplici. Con il fornitore finto non costa niente e serve a vedere che la catena funziona; con un
 * modello vero misura la qualità delle istruzioni, e per questo si lancia a mano.
 */

const exampleSchema = z.object({
  name: z.string().min(1),
  input: z.unknown(),
  /**
   * Regole semplici: niente giudizi di gusto, solo cose verificabili. Si applicano al `prompt`
   * della risposta se c'è (così `maxChars` è confrontabile con `target.maxPromptChars`),
   * altrimenti a tutta la risposta scritta in JSON.
   */
  expect: z
    .object({
      maxChars: z.number().int().positive().optional(),
      contains: z.array(z.string().min(1)).optional(),
      notContains: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

export interface EvalCase {
  name: string;
  passed: boolean;
  problems: string[];
  costUsd: number | undefined;
  output?: unknown;
}

export interface EvalResult {
  role: string;
  cases: EvalCase[];
  totalCostUsd: number;
}

export interface EvalOptions {
  role: string;
  configDir: string;
  evalsDir: string;
  environment?: ConfigEnvironment;
  outputDir?: string;
  /** Per provare le stesse istruzioni su un altro servizio (D36): è un dato, non una scelta nostra. */
  modelId?: string;
}

export async function runEval(options: EvalOptions): Promise<EvalResult> {
  const dir = path.join(options.evalsDir, options.role);
  let names: string[];
  try {
    names = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
  } catch {
    throw new Error(`Non ci sono esempi per il ruolo "${options.role}" in ${dir}.`);
  }
  if (names.length === 0) throw new Error(`La cartella ${dir} non ha esempi.`);

  const configSource = new FileConfigSource(options.configDir, options.environment);
  const instructions = new FileInstructionsSource(
    path.join(options.configDir, 'ai', 'instructions'),
  );
  const receipts = new MemoryReceiptSink();
  const troupe = createTroupe({ configSource, instructions, receiptSink: receipts });

  const cases: EvalCase[] = [];
  for (const name of names) {
    const example = exampleSchema.parse(
      JSON.parse(await readFile(path.join(dir, name), 'utf8')) as unknown,
    );

    try {
      // `run` valida già input e risposta con lo schema del ruolo: qui restano le regole semplici.
      const result = await troupe.run(options.role as never, example.input as never, {
        purpose: 'eval',
        ...(options.modelId === undefined ? {} : { modelId: options.modelId }),
      });
      const problems = check(result.data, example.expect);

      cases.push({
        name: example.name,
        passed: problems.length === 0,
        problems,
        costUsd: result.receipt.actualCostUsd,
        output: result.data,
      });
    } catch (error) {
      cases.push({
        name: example.name,
        passed: false,
        problems: [error instanceof Error ? error.message : String(error)],
        costUsd: undefined,
      });
    }
  }

  const result: EvalResult = {
    role: options.role,
    cases,
    totalCostUsd: receipts
      .all()
      .reduce((total, receipt) => total + (receipt.actualCostUsd ?? 0), 0),
  };

  if (options.outputDir !== undefined) {
    await writeFile(
      path.join(options.outputDir, `eval-${options.role}.json`),
      `${JSON.stringify({ ...result, receipts: receipts.all() }, null, 2)}\n`,
      'utf8',
    );
  }

  return result;
}

function check(output: unknown, expect: z.infer<typeof exampleSchema>['expect']): string[] {
  const problems: string[] = [];
  if (expect === undefined) return problems;

  const text = checkedText(output);
  if (expect.maxChars !== undefined && text.length > expect.maxChars) {
    problems.push(
      `la risposta è lunga ${String(text.length)} caratteri, il massimo è ${String(expect.maxChars)}`,
    );
  }
  for (const needle of expect.contains ?? []) {
    if (!text.includes(needle)) problems.push(`manca "${needle}"`);
  }
  for (const needle of expect.notContains ?? []) {
    if (text.includes(needle)) problems.push(`non dovrebbe contenere "${needle}"`);
  }
  return problems;
}

/** Il testo su cui valgono le regole: il prompt dei ruoli che ne scrivono uno, altrimenti tutto. */
function checkedText(output: unknown): string {
  if (typeof output === 'object' && output !== null && 'prompt' in output) {
    const { prompt } = output;
    if (typeof prompt === 'string') return prompt;
  }
  return JSON.stringify(output);
}

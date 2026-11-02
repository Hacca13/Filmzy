import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { modelIdSchema } from '@filmzy/contracts';
import {
  createTroupe,
  FileConfigSource,
  FileInstructionsSource,
  MemoryReceiptSink,
  type ConfigEnvironment,
  type Troupe,
} from '@filmzy/troupe';
import { z } from 'zod';

import { checkRules, rulesSchema } from './eval-rules.js';

/**
 * Le valutazioni dei ruoli di testo (architettura §4.13): esempi fissi in `config/evals/<ruolo>/`,
 * il ruolo gira su ognuno e si controlla che la risposta rispetti lo schema e poche regole
 * semplici. Con il fornitore finto non costa niente e serve a vedere che la catena funziona; con un
 * modello vero misura la qualità delle istruzioni, e per questo si lancia a mano.
 */

const exampleSchema = z.strictObject({
  name: z.string().min(1),
  input: z.unknown(),
  /** Regole semplici (vedi `eval-rules.ts`): niente giudizi di gusto, solo cose verificabili. */
  expect: rulesSchema.optional(),
});

type Example = z.infer<typeof exampleSchema>;

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
  /** Dove è stato salvato il rapporto, se è stato chiesto e ci si è riusciti. */
  reportFile?: string;
  /** Perché il rapporto non è stato salvato: la valutazione è fatta lo stesso e il risultato resta. */
  reportProblem?: string;
}

export interface EvalOptions {
  role: string;
  configDir: string;
  evalsDir: string;
  environment?: ConfigEnvironment;
  outputDir?: string;
  /** Per provare le stesse istruzioni su un altro servizio (D36): è un dato, non una scelta nostra. */
  modelId?: string;
  /**
   * Prima di spendere: riceve la stima e quante chiamate si faranno, e dice se proseguire. Con il
   * fornitore finto non serve; con i fornitori veri la valutazione costa, quindi si chiede sempre.
   */
  confirm?: (estimateUsd: number, calls: number) => Promise<boolean>;
}

export async function runEval(options: EvalOptions): Promise<EvalResult> {
  // Il servizio finisce nel nome del rapporto: deve essere un id di configurazione, non un percorso.
  const modelId = options.modelId === undefined ? undefined : modelIdSchema.parse(options.modelId);
  const examples = await loadExamples(options.evalsDir, options.role);

  const configSource = new FileConfigSource(options.configDir, options.environment);
  const instructions = new FileInstructionsSource(
    path.join(options.configDir, 'ai', 'instructions'),
  );
  const receipts = new MemoryReceiptSink();
  const troupe = createTroupe({ configSource, instructions, receiptSink: receipts });
  const context = { purpose: 'eval', ...(modelId === undefined ? {} : { modelId }) } as const;

  if (options.confirm !== undefined) {
    const estimate = await estimateAll(troupe, options.role, examples);
    if (!(await options.confirm(estimate, examples.length))) {
      throw new Error('Valutazione annullata: non è stato speso niente.');
    }
  }

  const cases: EvalCase[] = [];
  for (const example of examples) {
    try {
      // `run` valida già input e risposta con lo schema del ruolo: qui restano le regole semplici.
      const result = await troupe.run(options.role as never, example.input as never, context);
      const problems = checkRules(result.data, example.input, example.expect);

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
    try {
      result.reportFile = await saveReport(options, modelId, {
        ...result,
        receipts: receipts.all(),
      });
    } catch (error) {
      // Le chiamate sono già pagate: se il rapporto non si salva (disco pieno, cartella bloccata) si
      // dice, ma il risultato resta e si vede.
      result.reportProblem = error instanceof Error ? error.message : String(error);
    }
  }

  return result;
}

/**
 * Tutti gli esempi del ruolo, letti e controllati **prima** di spendere: un esempio scritto male
 * non deve fermare la valutazione dopo che qualche chiamata è già stata pagata. L'errore dice quale file.
 */
async function loadExamples(evalsDir: string, role: string): Promise<Example[]> {
  const dir = path.join(evalsDir, role);
  let names: string[];
  try {
    names = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
  } catch {
    throw new Error(`Non ci sono esempi per il ruolo "${role}" in ${dir}.`);
  }
  if (names.length === 0) throw new Error(`La cartella ${dir} non ha esempi.`);

  return Promise.all(
    names.map(async (name) => {
      try {
        return exampleSchema.parse(
          JSON.parse(await readFile(path.join(dir, name), 'utf8')) as unknown,
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`L'esempio ${path.join(dir, name)} non è valido: ${reason}`, {
          cause: error,
        });
      }
    }),
  );
}

/**
 * Quanto costerebbe in tutto, sommando la stima di ogni esempio. La stima è quella del servizio
 * predefinito del ruolo: con `--model` è un'indicazione, perché il prezzo del servizio provato può
 * essere diverso.
 */
async function estimateAll(
  troupe: Troupe,
  role: string,
  examples: readonly Example[],
): Promise<number> {
  const estimates = await Promise.all(
    examples.map((example) => troupe.estimate(role as never, example.input as never)),
  );
  return estimates.reduce((total, estimate) => total + estimate.estimatedCostUsd, 0);
}

/** Il rapporto ha data, ambiente e servizio nel nome: una valutazione non ne cancella un'altra. */
async function saveReport(
  options: EvalOptions,
  modelId: string | undefined,
  report: unknown,
): Promise<string> {
  const outputDir = options.outputDir ?? '';
  await mkdir(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  const parts = [
    'eval',
    options.role,
    ...(modelId === undefined ? [] : [modelId]),
    options.environment ?? 'reale',
    stamp,
  ];
  const file = path.join(outputDir, `${parts.join('-')}.json`);
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return file;
}

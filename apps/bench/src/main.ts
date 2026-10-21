import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

import {
  CONFIG_ENVIRONMENTS,
  configEnvironmentFromEnv,
  type ConfigEnvironment,
} from '@filmzy/troupe';

import { runEval } from './eval.js';
import { runBench } from './run.js';
import { scoreBench } from './score.js';

const USAGE = `Uso:
  pnpm bench run <piano> [--env <ambiente>]     esegue la prova e scrive in bench-output/
  pnpm bench score <cartella> [--piano <file>]  calcola i punteggi dai voti
  pnpm eval <ruolo> [--model <voce>]            valuta un ruolo di testo sugli esempi fissi

  --env     ${CONFIG_ENVIRONMENTS.join(' | ')}; con "offline" rispondono i fornitori finti e non
            si spende niente. Senza, vale TROUPE_ENV.
  --model   la voce del catalogo da usare per questa valutazione, invece di quella del ruolo.`;

export async function main(argv: readonly string[]): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv],
      options: {
        env: { type: 'string' },
        piano: { type: 'string' },
        model: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`\n${USAGE}`);
    return 2;
  }

  if (parsed.values.help === true) {
    console.log(USAGE);
    return 0;
  }

  let environment: ConfigEnvironment | undefined;
  try {
    environment =
      parsed.values.env === undefined
        ? configEnvironmentFromEnv()
        : configEnvironmentFromEnv({ TROUPE_ENV: parsed.values.env });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }

  const [command, argument] = parsed.positionals;
  const configDir = path.resolve('config');

  try {
    if (command === 'run') return await commandRun(argument, configDir, environment);
    if (command === 'score') return await commandScore(argument, parsed.values.piano);
    if (command === 'eval')
      return await commandEval(argument, configDir, environment, parsed.values.model);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  console.error(`Comando "${command ?? '(nessuno)'}" non riconosciuto.\n\n${USAGE}`);
  return 2;
}

async function commandRun(
  planPath: string | undefined,
  configDir: string,
  environment: ConfigEnvironment | undefined,
): Promise<number> {
  if (planPath === undefined) {
    console.error(`Manca il piano.\n\n${USAGE}`);
    return 2;
  }

  console.log(
    `Prova dei modelli con il piano ${planPath}${environment === undefined ? ' (con i fornitori veri: costa)' : ` (ambiente: ${environment})`}`,
  );

  const result = await runBench({
    planPath: path.resolve(planPath),
    configDir,
    ...(environment === undefined ? {} : { environment }),
    outputDir: path.resolve('bench-output'),
    // Col fornitore finto non si chiede niente: non costa. Con i fornitori veri sì, sempre.
    ...(environment === 'offline' ? {} : { confirm: askConfirmation }),
  });

  const fatti = result.takes.filter((take) => take.state === 'succeeded').length;
  const schede = result.sheets.filter((image) => image.state === 'succeeded').length;
  const spesa = result.receipts.reduce((total, receipt) => total + (receipt.actualCostUsd ?? 0), 0);

  console.log(`\nTake: ${String(fatti)} su ${String(result.takes.length)} generati.`);
  console.log(`Schede: ${String(schede)} immagini su ${String(result.sheets.length)}.`);
  // Col fornitore finto il costo è finto: lo si dice, per non spaventare e per non illudere.
  console.log(
    `${environment === 'offline' ? 'Costo simulato (niente di speso)' : 'Spesa'}: ` +
      `${spesa.toFixed(4)} $ · stima prima di partire ${result.estimatedCostUsd.toFixed(2)} $`,
  );
  console.log(`Cartella: ${path.relative(process.cwd(), result.dir)}`);
  console.log('Apri report.html, vota alla cieca e salva i voti in voti.json.');
  return 0;
}

/** Prima di spendere si chiede, sempre: una matrice sbagliata costa quanto un mese di spesa. */
async function askConfirmation(estimateUsd: number): Promise<boolean> {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await readline.question(
      `La prova costerà circa ${estimateUsd.toFixed(2)} $ con i fornitori veri. Procedo? [s/N] `,
    );
    return /^(s|si|sì)$/i.test(answer.trim());
  } finally {
    readline.close();
  }
}

async function commandScore(
  runDir: string | undefined,
  planPath: string | undefined,
): Promise<number> {
  if (runDir === undefined) {
    console.error(`Manca la cartella della prova.\n\n${USAGE}`);
    return 2;
  }

  const result = await scoreBench(
    path.resolve(runDir),
    path.resolve(planPath ?? 'config/bench/week1.yaml'),
  );

  console.log(`Punteggi di "${result.plan.name}" · ${String(result.voters)} votanti\n`);
  for (const model of result.models) {
    const perSecondo =
      model.costPerUsableSecondUsd === undefined
        ? 'nessun take usabile'
        : `${model.costPerUsableSecondUsd.toFixed(4)} $ per secondo usabile`;

    console.log(
      `${model.modelLabel}: ${String(model.usable)}/${String(model.takes)} take usabili · ` +
        `voto medio ${model.averageScore === undefined ? '—' : model.averageScore.toFixed(2)} · ` +
        `${model.costUsd.toFixed(4)} $ spesi · ${perSecondo} · ` +
        (model.meetsSuccess ? 'basta per il piano' : 'non basta per il piano'),
    );
  }

  if (result.voters === 0) {
    console.log('\nNessun file di voti: apri report.html, vota e salva voti.json nella cartella.');
  }
  return 0;
}

async function commandEval(
  role: string | undefined,
  configDir: string,
  environment: ConfigEnvironment | undefined,
  modelId: string | undefined,
): Promise<number> {
  if (role === undefined) {
    console.error(`Manca il ruolo.\n\n${USAGE}`);
    return 2;
  }

  const result = await runEval({
    role,
    configDir,
    evalsDir: path.resolve('config/evals'),
    ...(environment === undefined ? {} : { environment }),
    ...(modelId === undefined ? {} : { modelId }),
  });

  const passati = result.cases.filter((esito) => esito.passed).length;
  console.log(
    `Valutazione di "${role}": ${String(passati)}/${String(result.cases.length)} esempi a posto\n`,
  );

  for (const esito of result.cases) {
    console.log(`${esito.passed ? 'ok  ' : 'no  '} ${esito.name}`);
    for (const problem of esito.problems) console.log(`      • ${problem}`);
  }

  console.log(
    `\n${environment === 'offline' ? 'Costo simulato (niente di speso)' : 'Spesa'}: ${result.totalCostUsd.toFixed(4)} $`,
  );
  return passati === result.cases.length ? 0 : 1;
}

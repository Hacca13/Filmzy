import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

import { createTroupeStore, openFilmzyDatabase, resolveDataDir } from '@filmzy/db';
import {
  CONFIG_ENVIRONMENTS,
  configEnvironmentFromEnv,
  hasErrors,
  runCheckCli,
  type ConfigEnvironment,
  type ConfigIssue,
} from '@filmzy/troupe';

import { TroupeConfigService } from '../modules/troupe/troupe-config.service.js';

/**
 * La riga di comando della troupe. Sta nell'app e non in `packages/troupe` perché `import` ed
 * `export` hanno bisogno del database, e la troupe non lo conosce (architettura §3). `check`
 * lavora sui file e lo fa la troupe stessa: qui si passa la mano.
 *
 * Non avvia NestJS: apre il database, fa il suo lavoro e chiude. Un comando non deve tirarsi
 * dietro un server.
 */

const USAGE = `Uso:
  pnpm troupe check [cartella] [--env <ambiente>]    valida la configurazione sui file
  pnpm troupe import [cartella] [--pubblica]         crea la bozza dai file di seme
  pnpm troupe export [cartella] [--sovrascrivi]      scrive la release attiva su file

  cartella     la cartella con ai/, presets/ e features.yaml (per difetto: config)
  --pubblica      dopo l'importazione pubblica la bozza, se non ha errori
  --sovrascrivi   esporta anche se nella cartella ci sono già dei file (i commenti si perdono)
  --env        ${CONFIG_ENVIRONMENTS.join(' | ')}; senza, vale TROUPE_ENV

I dati stanno nella cartella dati dell'utente; FILMZY_DATA_DIR la cambia (architettura §6.1).`;

export async function main(argv: readonly string[]): Promise<number> {
  const [command] = argv;
  if (command === 'check') return runCheckCli(argv.slice(1));

  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv.slice(1)],
      options: {
        env: { type: 'string' },
        pubblica: { type: 'boolean' },
        sovrascrivi: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`\n${USAGE}`);
    return 2;
  }

  if (parsed.values.help === true || command === undefined) {
    console.log(USAGE);
    return command === undefined ? 2 : 0;
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

  const configDir = path.resolve(parsed.positionals[0] ?? 'config');

  if (command !== 'import' && command !== 'export') {
    console.error(`Comando "${command}" non riconosciuto.\n\n${USAGE}`);
    return 2;
  }

  const opened = await openFilmzyDatabase({
    dataDir: resolveDataDir(),
    appVersion: process.env.FILMZY_APP_VERSION ?? '0.0.0-sviluppo',
  });

  try {
    const service = new TroupeConfigService(createTroupeStore(opened.db), configDir, environment);

    return command === 'import'
      ? await commandImport(service, configDir, parsed.values.pubblica === true)
      : await commandExport(service, configDir, parsed.values.sovrascrivi === true);
  } finally {
    opened.close();
  }
}

async function commandImport(
  service: TroupeConfigService,
  configDir: string,
  publish: boolean,
): Promise<number> {
  const result = await service.importFromFiles(configDir, {
    publish,
    note: `importata da ${configDir}`,
    author: 'riga di comando',
  });

  print(result.issues);

  if (result.draft === undefined) {
    console.error('\nNon ho potuto leggere i file: la bozza non è stata creata.');
    return 1;
  }

  console.log(`\nBozza creata dai file di ${configDir}.`);
  if (publish && result.release === undefined) {
    console.error('Non pubblicata: prima vanno risolti gli errori.');
    return 1;
  }
  if (result.release !== undefined) {
    console.log(`Release ${result.release.id} pubblicata e attiva.`);
  }
  return hasErrors(result.issues) ? 1 : 0;
}

async function commandExport(
  service: TroupeConfigService,
  configDir: string,
  overwrite: boolean,
): Promise<number> {
  const result = await service.exportToFiles(configDir, { overwrite });
  print(result.issues);

  if (result.files.length === 0) return 1;

  console.log(`\nRelease attiva scritta in ${configDir}:`);
  for (const file of result.files) console.log(`  • ${file}`);
  return 0;
}

function print(issues: readonly ConfigIssue[]): void {
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  for (const [title, list] of [
    ['Errori', errors],
    ['Avvisi', warnings],
  ] as const) {
    if (list.length === 0) continue;
    console.log(`\n${title} (${String(list.length)})`);
    for (const issue of list) console.log(`  • ${issue.message}`);
  }
}

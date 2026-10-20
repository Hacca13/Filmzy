import path from 'node:path';
import { parseArgs } from 'node:util';

import {
  applyEnvironmentOverlay,
  CONFIG_ENVIRONMENTS,
  configEnvironmentFromEnv,
  loadEnvironmentOverlay,
  type ConfigEnvironment,
} from '../config/environments.js';
import { validateInstructions } from '../config/instructions.js';
import { hasErrors, type ConfigIssue } from '../config/issues.js';
import { loadConfigFiles } from '../config/load-files.js';
import { validateConfig } from '../config/validate.js';

const USAGE = `Uso: pnpm troupe check [cartella] [--env <ambiente>]

  cartella   la cartella che contiene ai/, presets/ e features.yaml (per difetto: config)
  --env      ${CONFIG_ENVIRONMENTS.join(' | ')}; senza, vale TROUPE_ENV, e senza quello
             nessun adattamento d'ambiente

Con il fornitore finto (--env offline) non serve nessuna chiave.`;

export async function runCheck(
  configDir: string,
  environment: ConfigEnvironment | undefined,
): Promise<ConfigIssue[]> {
  const { config, issues } = await loadConfigFiles(configDir);
  if (config === undefined) return issues;

  const all = [...issues];

  let effective = config;
  if (environment !== undefined) {
    const { overlay, issues: overlayIssues } = await loadEnvironmentOverlay(configDir, environment);
    all.push(...overlayIssues);
    if (overlay !== undefined) {
      const applied = applyEnvironmentOverlay(config, overlay);
      effective = applied.config;
      all.push(...applied.issues);
    }
  }

  all.push(...validateConfig(effective, { environment, secrets: { env: process.env } }));
  all.push(...(await validateInstructions(effective, path.join(configDir, 'ai', 'instructions'))));

  return all;
}

function place(issue: ConfigIssue): string {
  return [issue.section, issue.key ?? issue.file].filter(Boolean).join('/') || 'configurazione';
}

function print(issues: readonly ConfigIssue[], title: string): void {
  if (issues.length === 0) return;
  console.log(`\n${title} (${String(issues.length)})`);
  for (const issue of issues) console.log(`  • ${place(issue)} — ${issue.message}`);
}

export async function main(argv: readonly string[]): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv],
      options: { env: { type: 'string' }, help: { type: 'boolean', short: 'h' } },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`\n${USAGE}`);
    return 2;
  }

  const [command = 'check', dir] = parsed.positionals;
  if (parsed.values.help === true) {
    console.log(USAGE);
    return 0;
  }
  if (command !== 'check') {
    console.error(
      `Comando "${command}" non riconosciuto. Per ora c'è solo "check" (import ed export arrivano con T2.2).\n\n${USAGE}`,
    );
    return 2;
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

  const configDir = path.resolve(dir ?? 'config');
  console.log(
    `Controllo la configurazione in ${path.relative(process.cwd(), configDir) || '.'}${
      environment === undefined ? '' : ` (ambiente: ${environment})`
    }`,
  );

  const issues = await runCheck(configDir, environment);
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  print(errors, 'Errori');
  print(warnings, 'Avvisi');

  if (errors.some((issue) => issue.code === 'secret_missing')) {
    console.log('\nPer controllare senza chiavi: pnpm troupe check --env offline');
  }

  if (hasErrors(issues)) {
    console.log(
      `\nLa configurazione non è valida: ${String(errors.length)} errori, ${String(warnings.length)} avvisi.`,
    );
    return 1;
  }

  console.log(
    warnings.length === 0
      ? '\nTutto in ordine.'
      : `\nTutto in ordine, con ${String(warnings.length)} avvisi da guardare.`,
  );
  return 0;
}

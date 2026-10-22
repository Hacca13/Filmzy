// Nel codice non compaiono identificativi di modelli né URL di fornitori (architettura §3,
// CLAUDE.md regola d'oro 2): quelli stanno nella configurazione. L'elenco dei termini vietati è il
// catalogo stesso (`codeForbiddenTerms`), così aggiungere un modello aggiorna anche il controllo.
//
// I test sono esclusi: lì un id serve per dire *quale* caso si sta provando. Nel resto del codice
// il divieto vale anche nei commenti: i nomi dei modelli stanno nei documenti e nella
// configurazione, dove si aggiornano, non in una frase che invecchia dentro un file di codice.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SCAN_DIRS = ['apps', 'packages'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', 'coverage']);
const CODE_FILE = /\.(ts|tsx|mts|cts)$/;
const TEST_FILE = /\.(test|fixtures)\.(ts|tsx|mts|cts)$/;

async function loadTroupe() {
  try {
    return await import('@filmzy/troupe');
  } catch {
    console.error(
      'Non riesco a leggere il catalogo: compila prima i pacchetti con `pnpm build`, poi riprova.',
    );
    process.exit(2);
  }
}

function codeFiles({ includeTests = false } = {}) {
  const files = [];
  for (const dir of SCAN_DIRS) {
    for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const file = path.join(entry.parentPath, entry.name);
      if (file.split(path.sep).some((part) => SKIP_DIRS.has(part))) continue;
      if (!CODE_FILE.test(entry.name)) continue;
      if (!includeTests && TEST_FILE.test(entry.name)) continue;
      files.push(file);
    }
  }
  return files;
}

/**
 * Ogni pacchetto dichiara le dipendenze che usa davvero. Senza questo controllo un import di un
 * pacchetto del monorepo funziona comunque — pnpm lo trova passando dalla radice — ma Turbo non sa
 * che deve costruirlo prima, e la CI fallisce a caso: è già capitato con `@filmzy/troupe` dentro
 * `apps/api` (T2.2). I test contano: anche loro hanno bisogno che quel pacchetto esista.
 */
function undeclaredWorkspaceImports() {
  const manifests = new Map();
  const readManifest = (dir) => {
    if (!manifests.has(dir)) {
      const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
      manifests.set(dir, {
        name: manifest.name,
        declared: new Set([
          ...Object.keys(manifest.dependencies ?? {}),
          ...Object.keys(manifest.devDependencies ?? {}),
        ]),
      });
    }
    return manifests.get(dir);
  };

  const violations = [];
  for (const file of codeFiles({ includeTests: true })) {
    const [area, name] = file.split(path.sep);
    if (area === undefined || name === undefined) continue;
    const manifest = readManifest(path.join(area, name));

    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, index) => {
        const match = /from '(@filmzy\/[a-z-]+)'/.exec(line);
        const imported = match?.[1];
        if (imported === undefined) return;
        if (imported === manifest.name || manifest.declared.has(imported)) return;

        violations.push({ file, line: index + 1, imported, owner: manifest.name });
      });
  }
  return violations;
}

function findViolations(files, terms) {
  const violations = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const { term, why } of terms) {
        if (line.includes(term)) violations.push({ file, line: index + 1, term, why });
      }
    });
  }
  return violations;
}

const { codeForbiddenTerms, loadConfigFiles } = await loadTroupe();
const { config, issues } = await loadConfigFiles('config');

if (config === undefined) {
  console.error('La configurazione non si è caricata:');
  for (const issue of issues) console.error(`  • ${issue.message}`);
  process.exit(2);
}

const violations = findViolations(codeFiles(), codeForbiddenTerms(config));

if (violations.length > 0) {
  console.error(`Trovati ${violations.length} riferimenti che devono stare nella configurazione:`);
  for (const { file, line, term, why } of violations) {
    console.error(`  • ${file}:${line} — "${term}" ${why}.`);
  }
  console.error(
    '\nIl codice chiama ruoli, mai modelli: il servizio arriva dalla configurazione o dal `ctx`' +
      ' della richiesta (architettura §3, §4.1).',
  );
  process.exit(1);
}

const undeclared = undeclaredWorkspaceImports();

if (undeclared.length > 0) {
  console.error(`Trovate ${undeclared.length} dipendenze usate ma non dichiarate:`);
  for (const { file, line, imported, owner } of undeclared) {
    console.error(
      `  • ${file}:${line} — "${owner}" importa "${imported}" senza averlo in package.json.`,
    );
  }
  console.error(
    '\nAggiungilo alle dipendenze del pacchetto: senza, Turbo non sa in che ordine costruire e la' +
      ' CI fallisce quando capita.',
  );
  process.exit(1);
}

console.log(
  'Confini del codice in ordine: nessun id di modello né indirizzo di fornitore, nessuna dipendenza non dichiarata.',
);

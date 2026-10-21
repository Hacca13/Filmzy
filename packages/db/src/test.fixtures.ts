import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { MIGRATIONS_DIR } from './open.js';

/** Una cartella dati vuota, in una cartella temporanea: ogni test ha il suo database. */
export async function tempDataDir(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'filmzy-db-'));
}

/** La prima migrazione vera del pacchetto: la base su cui i test ne aggiungono altre. */
export async function firstMigrationSql(): Promise<string> {
  return readFile(path.join(MIGRATIONS_DIR, '0000_coda-e-meta.sql'), 'utf8');
}

/**
 * Scrive una cartella di migrazioni finta, nella forma che si aspetta il migratore di Drizzle:
 * un file SQL per voce più il giornale. Serve a provare che una migrazione in più fa la copia di
 * sicurezza e che una migrazione rotta non lascia i dati a metà (D44).
 */
export async function writeMigrations(dir: string, statements: readonly string[]): Promise<string> {
  await mkdir(path.join(dir, 'meta'), { recursive: true });

  const entries = statements.map((sql, index) => ({
    idx: index,
    version: '6',
    when: 1_792_600_000_000 + index,
    tag: `${String(index).padStart(4, '0')}_prova`,
    breakpoints: true,
  }));

  await Promise.all([
    ...statements.map((sql, index) =>
      writeFile(path.join(dir, `${entries[index]?.tag ?? ''}.sql`), sql, 'utf8'),
    ),
    writeFile(
      path.join(dir, 'meta', '_journal.json'),
      `${JSON.stringify({ version: '7', dialect: 'sqlite', entries }, null, 2)}\n`,
      'utf8',
    ),
  ]);

  return dir;
}

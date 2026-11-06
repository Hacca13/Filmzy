import type Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { readMigrationFiles } from 'drizzle-orm/migrator';

import { openSqlite, type FilmzyDb, type OpenedDatabase } from './open.js';
import * as schema from './schema.js';

/** Una riga così come sta nel database: i nomi delle colonne sono quelli di SQLite. */
export type FilmRow = Record<string, unknown>;

/**
 * Le tabelle di un film (T6.3, D92). Quelle col film dentro, e quelle che stanno sotto una di loro. Mancano di
 * proposito quelle di `FILM_TABLES_LEFT_OUT`, e le scelte e la configurazione dell'utente, che non sono del
 * film. Le chiavi non stanno nemmeno nel database (D45).
 */
type FilmTable =
  | { table: string; key: 'id' | 'project_id' }
  | { table: string; parent: { column: string; table: string } };

const FILM_TABLES: readonly FilmTable[] = [
  { table: 'projects', key: 'id' },
  { table: 'screenplays', key: 'project_id' },
  { table: 'characters', key: 'project_id' },
  { table: 'character_sheet_images', parent: { column: 'character_id', table: 'characters' } },
  { table: 'locations', key: 'project_id' },
  { table: 'location_attempts', parent: { column: 'location_id', table: 'locations' } },
  { table: 'assets', key: 'project_id' },
  { table: 'uploads', key: 'project_id' },
  { table: 'moodboards', key: 'project_id' },
  { table: 'moodboard_scenes', key: 'project_id' },
  { table: 'moodboard_references', key: 'project_id' },
  { table: 'moodboard_runs', key: 'project_id' },
  { table: 'shot_plans', key: 'project_id' },
  { table: 'shots', key: 'project_id' },
  { table: 'storyboard_attempts', parent: { column: 'shot_id', table: 'shots' } },
  { table: 'takes', parent: { column: 'shot_id', table: 'shots' } },
  { table: 'take_frames', parent: { column: 'shot_id', table: 'shots' } },
  { table: 'ignored_flags', key: 'project_id' },
  { table: 'script_checks', key: 'project_id' },
  { table: 'script_issues', parent: { column: 'check_id', table: 'script_checks' } },
  { table: 'audio_tracks', key: 'project_id' },
  { table: 'audio_clips', key: 'project_id' },
  { table: 'audio_variants', parent: { column: 'clip_id', table: 'audio_clips' } },
  { table: 'film_scene_exclusions', key: 'project_id' },
  // Gli scontrini: la storia di quanto è costato il film.
  { table: 'generations', key: 'project_id' },
];

export const FILM_TABLE_NAMES: readonly string[] = FILM_TABLES.map(({ table }) => table);

/**
 * Le tabelle col film dentro che restano fuori dalla copia: il film montato e i file esportati si rifanno
 * gratis, e i lavori in coda appartengono al computer che li fa. Una tabella nuova deve stare o qui o sopra:
 * un test lo controlla, così non si dimentica.
 */
export const FILM_TABLES_LEFT_OUT: readonly string[] = ['jobs', 'film_assemblies', 'film_exports'];

/** Le righe col contenuto come nome: due film possono avere la stessa, e la si tiene una volta sola. */
const CONTENT_ADDRESSED = new Set(['assets']);

const id = (name: string) => sql.identifier(name);

function rowsOf(db: FilmzyDb, entry: FilmTable, projectId: string): FilmRow[] {
  if ('key' in entry) {
    return db.all<FilmRow>(
      sql`select * from ${id(entry.table)} where ${id(entry.key)} = ${projectId}`,
    );
  }
  const { column, table } = entry.parent;
  return db.all<FilmRow>(
    sql`select * from ${id(entry.table)} where ${id(column)} in (select id from ${id(table)} where project_id = ${projectId})`,
  );
}

/** Tutte le righe del film, tabella per tabella. */
export function readFilmRows(db: FilmzyDb, projectId: string): Record<string, FilmRow[]> {
  return Object.fromEntries(
    FILM_TABLES.map((entry) => [entry.table, rowsOf(db, entry, projectId)]),
  );
}

/** Le righe dei file con questi id, di qualunque film: servono quando due film hanno lo stesso file. */
export function assetRowsByIds(db: FilmzyDb, ids: readonly string[]): FilmRow[] {
  if (ids.length === 0) return [];
  return db.all<FilmRow>(
    sql`select * from assets where id in (${sql.join(
      ids.map((one) => sql`${one}`),
      sql`, `,
    )})`,
  );
}

const isPlainValue = (value: unknown) =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

/**
 * Cosa non torna in righe arrivate da fuori: ogni riga deve essere di **questo** film, con valori semplici, e i
 * file devono stare nella sua cartella. Una copia rovinata, o fatta apposta, non deve poter scrivere nelle righe
 * di un altro film né far leggere un file qualunque della cartella dei dati.
 */
export function foreignRowProblem(
  tables: Readonly<Record<string, readonly FilmRow[]>>,
  projectId: string,
): string | undefined {
  const known = new Set(FILM_TABLE_NAMES);
  const unknown = Object.keys(tables).find((name) => !known.has(name));
  if (unknown !== undefined) return `tabella sconosciuta «${unknown}»`;
  if (tables.projects?.length !== 1 || tables.projects[0]?.id !== projectId) {
    return 'il film non corrisponde';
  }
  for (const [table, rows] of Object.entries(tables)) {
    if (
      rows.some((row) => Object.keys(row).length === 0 || !Object.values(row).every(isPlainValue))
    ) {
      return `righe vuote o strane in «${table}»`;
    }
  }
  for (const entry of FILM_TABLES) {
    const rows = tables[entry.table] ?? [];
    if ('key' in entry) {
      if (rows.some((row) => row[entry.key] !== projectId)) {
        return `righe di un altro film in «${entry.table}»`;
      }
      continue;
    }
    const parents = new Set(
      (tables[entry.parent.table] ?? []).flatMap((row) =>
        typeof row.id === 'string' ? [row.id] : [],
      ),
    );
    if (rows.some((row) => !parents.has(row[entry.parent.column] as string))) {
      return `righe senza il loro film in «${entry.table}»`;
    }
  }
  const folder = `progetti/${projectId}/`;
  const outside = (tables.assets ?? []).find(
    (row) =>
      typeof row.path !== 'string' || !row.path.startsWith(folder) || row.path.includes('..'),
  );
  return outside === undefined ? undefined : 'un file fuori dalla cartella del film';
}

export function filmExists(db: FilmzyDb, projectId: string): boolean {
  return db.all(sql`select 1 from projects where id = ${projectId}`).length > 0;
}

/** Ci sono lavori aperti su questo film: una copia adesso porterebbe con sé lavori a metà. */
export function filmHasOpenJobs(db: FilmzyDb, projectId: string): boolean {
  return (
    db.all(
      sql`select 1 from jobs where project_id = ${projectId} and status in ('queued', 'running')`,
    ).length > 0
  );
}

function columnsOf(db: Pick<FilmzyDb, 'all'>, table: string): Set<string> {
  return new Set(
    db
      .all<{ name: string }>(sql`select name from pragma_table_info(${table})`)
      .map(({ name }) => name),
  );
}

/**
 * Scrive le righe di un film nuovo su questo computer. Tutto o niente: una riga che non entra annulla il resto.
 * Le colonne che il programma non conosce si lasciano fuori; quelle che mancano prendono il valore di partenza
 * della tabella. Un file che questo computer ha già (lo stesso contenuto, in un altro film) tiene la sua riga.
 */
export function writeFilmRows(
  db: FilmzyDb,
  tables: Readonly<Record<string, readonly FilmRow[]>>,
): void {
  db.transaction((tx) => {
    for (const entry of FILM_TABLES) {
      const rows = tables[entry.table] ?? [];
      // Una tabella che nello schema di una versione vecchia non c'era ancora: niente da scrivere.
      if (rows.length === 0) continue;
      const columns = columnsOf(tx, entry.table);
      const verb = CONTENT_ADDRESSED.has(entry.table) ? sql`insert or ignore` : sql`insert`;
      for (const row of rows) {
        const names = Object.keys(row).filter((name) => columns.has(name));
        if (names.length === 0)
          throw new Error(`Una riga di «${entry.table}» non ha colonne note.`);
        tx.run(
          sql`${verb} into ${id(entry.table)} (${sql.join(names.map(id), sql`, `)}) values (${sql.join(
            names.map((name) => sql`${row[name] as string | number | null}`),
            sql`, `,
          )})`,
        );
      }
    }
  });
}

/** Quello che serve per rifare le migrazioni su una copia: dove sono, fin dove arrivano, e SQLite. */
export type MigrationSource = Pick<
  OpenedDatabase,
  'migrationsDir' | 'nativeBinding' | 'schemaVersion'
>;

/**
 * Un database vuoto, in memoria, con lo schema di una versione passata: le sue prime `version` migrazioni. Le
 * altre si applicano con `upgrade`. Nessun file: sparisce con `close`.
 */
export interface PastDatabase {
  sqlite: Database.Database;
  db: FilmzyDb;
  upgrade: () => void;
  close: () => void;
}

export function databaseAtVersion(source: MigrationSource, version: number): PastDatabase {
  const migrations = readMigrationFiles({ migrationsFolder: source.migrationsDir });
  const sqlite = openSqlite(':memory:', source.nativeBinding);
  try {
    runMigrations(sqlite, migrations.slice(0, version));
  } catch (error) {
    sqlite.close();
    throw error;
  }
  return {
    sqlite,
    db: drizzle(sqlite, { schema }),
    upgrade: () => {
      runMigrations(sqlite, migrations.slice(version));
    },
    close: () => {
      sqlite.close();
    },
  };
}

function runMigrations(
  sqlite: Database.Database,
  migrations: ReturnType<typeof readMigrationFiles>,
) {
  sqlite.transaction(() => {
    for (const statement of migrations.flatMap((migration) => migration.sql)) {
      if (statement.trim() !== '') sqlite.exec(statement);
    }
  })();
}

/**
 * Le righe di una copia salvata con una versione vecchia, portate alla versione di adesso (D94). Si scrivono in
 * un database con lo schema di allora, e su quello si fanno le stesse migrazioni che hanno aggiornato i dati
 * veri, comprese quelle che cambiano i dati e non solo le colonne. Una copia della stessa versione passa così
 * com'è.
 */
export function upgradeFilmRows(
  source: MigrationSource,
  copy: {
    projectId: string;
    schemaVersion: number;
    tables: Readonly<Record<string, readonly FilmRow[]>>;
  },
): Readonly<Record<string, readonly FilmRow[]>> {
  if (copy.schemaVersion === source.schemaVersion) return copy.tables;
  const then = databaseAtVersion(source, copy.schemaVersion);
  try {
    writeFilmRows(then.db, copy.tables);
    then.upgrade();
    return readFilmRows(then.db, copy.projectId);
  } finally {
    then.close();
  }
}

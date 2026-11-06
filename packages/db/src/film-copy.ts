import { sql } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';

/** Una riga così come sta nel database: i nomi delle colonne sono quelli di SQLite. */
export type FilmRow = Record<string, unknown>;

/**
 * Le tabelle di un film (T6.3, D92). Quelle col film dentro, e quelle che stanno sotto una di loro. Mancano di
 * proposito: il film montato e i file esportati (si rifanno gratis), i lavori in coda, le scelte e le chiavi
 * dell'utente, la configurazione della troupe. Le chiavi non stanno nemmeno nel database (D45).
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

/** Le righe che sostituendo un film vanno tolte anche se non entrano nella copia. */
const DERIVED_TABLES = ['film_assemblies', 'film_exports'] as const;

export const FILM_TABLE_NAMES: readonly string[] = FILM_TABLES.map(({ table }) => table);

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

/**
 * Cosa non torna in righe arrivate da fuori: ogni riga deve essere di **questo** film. Una copia rovinata, o
 * fatta apposta, non deve poter scrivere nelle righe di un altro film.
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
  for (const entry of FILM_TABLES) {
    const rows = tables[entry.table] ?? [];
    if ('key' in entry) {
      if (rows.some((row) => row[entry.key] !== projectId))
        return `righe di un altro film in «${entry.table}»`;
      continue;
    }
    const parents = new Set((tables[entry.parent.table] ?? []).map((row) => row.id));
    if (rows.some((row) => !parents.has(row[entry.parent.column]))) {
      return `righe senza il loro film in «${entry.table}»`;
    }
  }
  return undefined;
}

export function filmExists(db: FilmzyDb, projectId: string): boolean {
  return db.all(sql`select 1 from projects where id = ${projectId}`).length > 0;
}

/** Ci sono lavori aperti su questo film: sostituirlo li lascerebbe senza le loro righe. */
export function filmHasOpenJobs(db: FilmzyDb, projectId: string): boolean {
  return (
    db.all(
      sql`select 1 from jobs where project_id = ${projectId} and status in ('queued', 'running')`,
    ).length > 0
  );
}

function columnsOf(db: FilmzyDb, table: string): Set<string> {
  return new Set(
    db
      .all<{ name: string }>(sql`select name from pragma_table_info(${table})`)
      .map(({ name }) => name),
  );
}

/**
 * Scrive le righe del film, sostituendo quelle che c'erano se `replace`. Tutto o niente: una riga che non entra
 * annulla il resto. Le colonne che il programma non conosce si lasciano fuori; quelle che mancano prendono il
 * valore di partenza della tabella.
 */
export function writeFilmRows(
  db: FilmzyDb,
  projectId: string,
  tables: Readonly<Record<string, readonly FilmRow[]>>,
  { replace }: { replace: boolean },
): void {
  db.transaction((tx) => {
    if (replace) {
      // Prima le tabelle che stanno sotto: poi non si saprebbe più quali righe erano del film.
      for (const entry of [...FILM_TABLES].reverse()) {
        if ('key' in entry) {
          tx.run(sql`delete from ${id(entry.table)} where ${id(entry.key)} = ${projectId}`);
        } else {
          const { column, table } = entry.parent;
          tx.run(
            sql`delete from ${id(entry.table)} where ${id(column)} in (select id from ${id(table)} where project_id = ${projectId})`,
          );
        }
      }
      for (const table of DERIVED_TABLES) {
        tx.run(sql`delete from ${id(table)} where project_id = ${projectId}`);
      }
    }
    for (const entry of FILM_TABLES) {
      const columns = columnsOf(tx, entry.table);
      for (const row of tables[entry.table] ?? []) {
        const names = Object.keys(row).filter((name) => columns.has(name));
        tx.run(
          sql`insert into ${id(entry.table)} (${sql.join(names.map(id), sql`, `)}) values (${sql.join(
            names.map((name) => sql`${row[name] as never}`),
            sql`, `,
          )})`,
        );
      }
    }
  });
}

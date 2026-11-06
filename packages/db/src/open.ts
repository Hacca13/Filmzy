import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { z } from 'zod';

import { DatabaseError } from './errors.js';
import { databaseFile } from './paths.js';
import * as schema from './schema.js';

/**
 * L'apertura del database locale (architettura §6.2, D44). All'avvio, in quest'ordine:
 *
 * 1. se il database è stato scritto da una versione **più nuova** del programma, non lo si apre;
 * 2. se ci sono migrazioni da applicare, prima si **copia** il file;
 * 3. le migrazioni si applicano; se qualcosa va storto si torna alla copia;
 * 4. si scrive nel database quale versione dello schema e quale versione del programma c'è ora.
 *
 * La versione dello schema è il numero di migrazioni che il programma porta con sé: cresce di uno
 * a ogni migrazione nuova, senza che nessuno debba ricordarsi di aggiornare un numero a mano.
 */

export type FilmzyDb = BetterSQLite3Database<typeof schema>;

export interface OpenDatabaseOptions {
  /** La cartella dati dell'utente (§6.1). In Electron la dà il sistema operativo. */
  dataDir: string;
  /** La versione del programma: finisce nel database e nel nome della copia di sicurezza. */
  appVersion: string;
  /** Le migrazioni da applicare, se non sono quelle del pacchetto: i test, e il programma installato. */
  migrationsDir?: string;
  /**
   * Il modulo nativo di SQLite, se non sta accanto al pacchetto: il programma installato lo porta fra le sue
   * risorse, perché il resto del server viaggia in un file solo (T6.4).
   */
  nativeBinding?: string;
}

export interface OpenedDatabase {
  db: FilmzyDb;
  file: string;
  schemaVersion: number;
  /** Da dove vengono le migrazioni, e il modulo di SQLite: servono anche ad aggiornare le copie vecchie (D94). */
  migrationsDir: string;
  nativeBinding?: string;
  /** Il file della copia, se una migrazione l'ha richiesta. */
  backupFile?: string;
  close: () => void;
}

/** Le migrazioni che il pacchetto porta con sé: `migrations/` accanto a `dist/`. */
export const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations', import.meta.url));

export const openSqlite = (file: string, nativeBinding: string | undefined): Database.Database =>
  new Database(file, nativeBinding === undefined ? {} : { nativeBinding });

const journalSchema = z.object({
  entries: z.array(z.object({ idx: z.number().int(), tag: z.string().min(1) })),
});

const META_SCHEMA_VERSION = 'schema_version';
const META_APP_VERSION = 'app_version';

export async function openFilmzyDatabase(options: OpenDatabaseOptions): Promise<OpenedDatabase> {
  const migrationsDir = options.migrationsDir ?? MIGRATIONS_DIR;
  const shipped = await countMigrations(migrationsDir);

  const file = databaseFile(options.dataDir);
  /** Non si riesce nemmeno a leggere: file rovinato, disco pieno, cartella protetta. Non si è cambiato niente. */
  const unreadable = (cause: unknown, backupFile?: string): DatabaseError =>
    new DatabaseError(
      'database_unreadable',
      'Non riesco ad aprire i dati dei tuoi film.',
      { file, ...(backupFile === undefined ? {} : { backupFile }) },
      { cause },
    );

  let sqlite: Database.Database;
  let found: StoredMeta;
  try {
    await mkdir(options.dataDir, { recursive: true });
    sqlite = openSqlite(file, options.nativeBinding);
    try {
      prepareConnection(sqlite);
      found = readMeta(sqlite);
    } catch (cause) {
      // Lasciata aperta, su Windows il file resta bloccato: l'utente non potrebbe nemmeno sostituirlo.
      sqlite.close();
      throw cause;
    }
  } catch (cause) {
    throw unreadable(cause);
  }

  if (found.schemaVersion !== undefined && found.schemaVersion > shipped) {
    sqlite.close();
    throw new DatabaseError(
      'database_too_new',
      `Questi dati sono stati scritti da una versione più nuova di Filmzy${
        found.appVersion === undefined ? '' : ` (${found.appVersion})`
      }. Aggiorna il programma per aprirli.`,
      { file, found: found.schemaVersion, expected: shipped },
    );
  }

  // La copia serve solo se c'è davvero qualcosa da migrare: un database nuovo non ha niente da
  // salvare, e una copia a ogni avvio riempirebbe il disco dell'utente.
  const backupFile =
    found.schemaVersion !== undefined && found.schemaVersion < shipped
      ? path.join(
          options.dataDir,
          `filmzy.db.backup-${found.appVersion ?? String(found.schemaVersion)}`,
        )
      : undefined;

  if (backupFile !== undefined) {
    // `backup` di SQLite, non una copia qualunque: tiene conto di quello che sta nel file WAL.
    try {
      await sqlite.backup(backupFile);
    } catch (cause) {
      sqlite.close();
      throw unreadable(cause);
    }
  }

  try {
    migrate(drizzle(sqlite), { migrationsFolder: migrationsDir });
  } catch (cause) {
    sqlite.close();
    if (backupFile !== undefined) {
      try {
        await restore(backupFile, file);
      } catch (restoreCause) {
        // Non si può dire «ho rimesso la copia»: si dice dov'è, e l'utente non la perde.
        throw unreadable(restoreCause, backupFile);
      }
    }

    throw new DatabaseError(
      'migration_failed',
      backupFile === undefined
        ? 'Non riesco a preparare il database dei tuoi film. Il file non è stato modificato.'
        : `L'aggiornamento del database non è riuscito: i tuoi film sono quelli di prima, ripresi dalla copia ${path.basename(backupFile)}.`,
      { file, ...(backupFile === undefined ? {} : { backupFile }) },
      { cause },
    );
  }

  // Dopo una migrazione la connessione ha davanti uno schema nuovo: si riapre pulita, così le
  // istruzioni preparate e la cache dello schema non si portano dietro il prima.
  sqlite.close();
  sqlite = openSqlite(file, options.nativeBinding);
  prepareConnection(sqlite);

  const db = drizzle(sqlite, { schema });
  writeMeta(db, shipped, options.appVersion);

  return {
    db,
    file,
    schemaVersion: shipped,
    migrationsDir,
    ...(options.nativeBinding === undefined ? {} : { nativeBinding: options.nativeBinding }),
    ...(backupFile === undefined ? {} : { backupFile }),
    close: () => {
      sqlite.close();
    },
  };
}

function prepareConnection(sqlite: Database.Database): void {
  // WAL: letture e scritture non si bloccano a vicenda, e la coda scrive spesso.
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  // Se un'altra operazione sta scrivendo, si aspetta invece di dare errore subito.
  sqlite.pragma('busy_timeout = 5000');
}

/** Quante migrazioni porta il programma: è la versione dello schema che sa gestire. */
async function countMigrations(migrationsDir: string): Promise<number> {
  const journalFile = path.join(migrationsDir, 'meta', '_journal.json');

  try {
    const journal = journalSchema.parse(JSON.parse(await readFile(journalFile, 'utf8')) as unknown);
    return journal.entries.length;
  } catch (cause) {
    throw new DatabaseError(
      'config_invalid',
      `Le migrazioni del database non si leggono (${journalFile}): l'installazione è incompleta.`,
      { file: journalFile },
      { cause },
    );
  }
}

interface StoredMeta {
  schemaVersion?: number;
  appVersion?: string;
}

/** Legge `meta` senza dare per scontato che esista: un database nuovo non ha ancora tabelle. */
function readMeta(sqlite: Database.Database): StoredMeta {
  const table = sqlite
    .prepare("select 1 as presente from sqlite_master where type = 'table' and name = 'meta'")
    .get();
  if (table === undefined) return {};

  const rows = sqlite.prepare('select key, value from meta').all() as {
    key: string;
    value: string;
  }[];
  const stored = new Map(rows.map((row) => [row.key, row.value]));

  const version = Number(stored.get(META_SCHEMA_VERSION));
  return {
    ...(Number.isInteger(version) ? { schemaVersion: version } : {}),
    ...(stored.has(META_APP_VERSION) ? { appVersion: stored.get(META_APP_VERSION) } : {}),
  };
}

function writeMeta(db: FilmzyDb, schemaVersion: number, appVersion: string): void {
  const values = [
    { key: META_SCHEMA_VERSION, value: String(schemaVersion) },
    { key: META_APP_VERSION, value: appVersion },
  ];

  db.insert(schema.meta)
    .values(values)
    .onConflictDoUpdate({ target: schema.meta.key, set: { value: sql`excluded.value` } })
    .run();
}

/**
 * Rimette al suo posto la copia di sicurezza. I file di servizio di SQLite (`-wal`, `-shm`) si
 * cancellano: appartengono al file di prima e, lasciati lì, rovinerebbero quello ripristinato.
 */
async function restore(backupFile: string, file: string): Promise<void> {
  await Promise.all([rm(`${file}-wal`, { force: true }), rm(`${file}-shm`, { force: true })]);
  await copyFile(backupFile, file);
}

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  FILM_TABLES_LEFT_OUT,
  FILM_TABLE_NAMES,
  databaseAtVersion,
  foreignRowProblem,
  readFilmRows,
  upgradeFilmRows,
  writeFilmRows,
  type FilmRow,
} from './film-copy.js';
import { openFilmzyDatabase, type FilmzyDb, type OpenedDatabase } from './open.js';
import { createProjectStore } from './project-store.js';
import { tempDataDir } from './test.fixtures.js';

let opened: OpenedDatabase;
let db: FilmzyDb;

const freshDatabase = async () =>
  openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });

beforeEach(async () => {
  opened = await freshDatabase();
  ({ db } = opened);
});

const newFilm = (title: string) =>
  createProjectStore(db).create({
    title,
    idea: 'Una storia',
    genre: 'drama',
    tone: 'moving',
    style: 'realistic',
    cinematography: 'noir',
    language: 'it',
    durationS: 60,
    kind: 'short',
    phase: 'draft',
  });

describe('le tabelle di un film', () => {
  it('ogni tabella col film dentro sta nella copia, o è lasciata fuori apposta', () => {
    const tables = db
      .all<{ name: string }>(
        sql`select m.name from sqlite_master m where m.type = 'table' and exists (select 1 from pragma_table_info(m.name) where name = 'project_id')`,
      )
      .map(({ name }) => name);

    const forgotten = tables.filter(
      (name) => !FILM_TABLE_NAMES.includes(name) && !FILM_TABLES_LEFT_OUT.includes(name),
    );
    expect(forgotten).toEqual([]);
  });
});

describe('le righe di un film', () => {
  it('si leggono solo quelle di quel film', () => {
    const film = newFilm('Uno');
    newFilm('Due');

    const rows = readFilmRows(db, film.id);

    expect(rows.projects).toHaveLength(1);
    expect(rows.projects?.[0]?.title).toBe('Uno');
  });

  it('si riscrivono uguali in un altro database', async () => {
    const film = newFilm('Uno');
    const rows = readFilmRows(db, film.id);
    const other = (await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0' })).db;

    writeFilmRows(other, rows);

    expect(readFilmRows(other, film.id).projects).toEqual(rows.projects);
  });

  it('un film che c’è già non si scrive due volte: tutto o niente', () => {
    const film = newFilm('Uno');
    const rows = readFilmRows(db, film.id);

    expect(() => {
      writeFilmRows(db, rows);
    }).toThrow();
    expect(readFilmRows(db, film.id).projects).toHaveLength(1);
  });
});

describe('righe arrivate da fuori', () => {
  const rows = {
    projects: [{ id: 'f' }],
    characters: [{ id: 'c', project_id: 'f' }],
    assets: [{ id: 'a', project_id: 'f', path: 'progetti/f/immagine.png' }],
  };

  it('quelle di questo film vanno bene', () => {
    expect(foreignRowProblem(rows, 'f')).toBeUndefined();
  });

  it('una riga di un altro film, una tabella sconosciuta o un film diverso no', () => {
    expect(
      foreignRowProblem({ ...rows, characters: [{ id: 'c', project_id: 'altro' }] }, 'f'),
    ).toContain('altro film');
    expect(foreignRowProblem({ ...rows, settings: [] }, 'f')).toContain('sconosciuta');
    expect(foreignRowProblem(rows, 'g')).toContain('non corrisponde');
    expect(
      foreignRowProblem({ ...rows, takes: [{ id: 't', shot_id: 'di-un-altro' }] }, 'f'),
    ).toContain('senza il loro film');
  });

  it('un file fuori dalla cartella del film no: non si deve poter leggere il database o le chiavi', () => {
    for (const path of ['filmzy.db', 'progetti/altro/x.png', 'progetti/f/../../chiavi.dat']) {
      expect(
        foreignRowProblem({ ...rows, assets: [{ id: 'a', project_id: 'f', path }] }, 'f'),
      ).toContain('fuori dalla cartella');
    }
  });

  it('righe vuote o con valori strani no', () => {
    expect(foreignRowProblem({ ...rows, characters: [{}] }, 'f')).toContain('strane');
    expect(
      foreignRowProblem({ ...rows, characters: [{ id: 'c', project_id: 'f', x: { y: 1 } }] }, 'f'),
    ).toContain('strane');
  });
});

/** Un film come lo scriveva una versione passata: le colonne obbligatorie di allora, con valori qualunque. */
function projectAt(version: number, values: FilmRow): FilmRow {
  const then = databaseAtVersion(opened, version);
  try {
    const columns = then.sqlite
      .prepare(
        'select name, type, "notnull" as required, dflt_value as fallback from pragma_table_info(\'projects\')',
      )
      .all() as { name: string; type: string; required: number; fallback: unknown }[];
    const required = columns.filter(
      ({ required, fallback }) => required === 1 && fallback === null,
    );
    return {
      ...Object.fromEntries(
        required.map(({ name, type }) => [name, type.toUpperCase().includes('INT') ? 1 : 'x']),
      ),
      ...values,
    };
  } finally {
    then.close();
  }
}

describe('una copia salvata con una versione passata (D94)', () => {
  it('passa per gli stessi aggiornamenti dei dati: uno spot di prima del «tipo di film» resta uno spot', () => {
    // La migrazione 31 (0030) aggiunge il tipo, e lo calcola dalla durata: sotto il minuto è uno spot.
    const tables = { projects: [projectAt(30, { id: 'film-vecchio', duration_s: 30 })] };

    const rows = upgradeFilmRows(opened, { projectId: 'film-vecchio', schemaVersion: 30, tables });
    writeFilmRows(db, rows);

    expect(readFilmRows(db, 'film-vecchio').projects?.[0]).toMatchObject({
      duration_s: 30,
      kind: 'spot',
    });
  });

  it('una copia della stessa versione passa così com’è', () => {
    const tables = { projects: [{ id: 'f' }] };

    expect(
      upgradeFilmRows(opened, { projectId: 'f', schemaVersion: opened.schemaVersion, tables }),
    ).toBe(tables);
  });

  it('righe che nella loro versione non entrano: errore, e niente di scritto', () => {
    // Allo schema 1 i film non c'erano ancora.
    expect(() =>
      upgradeFilmRows(opened, {
        projectId: 'f',
        schemaVersion: 1,
        tables: { projects: [{ id: 'f' }] },
      }),
    ).toThrow();
    expect(readFilmRows(db, 'f').projects).toEqual([]);
  });
});

/** Una copia per ogni versione pubblicata: si aggiunge quando esce, e non si cambia più (D94). */
const PUBLISHED_COPIES = fileURLToPath(new URL('../test/copie', import.meta.url));

describe('le copie salvate con le versioni pubblicate', () => {
  it('si aprono tutte con questa versione, senza perdere righe', async () => {
    const names = (await readdir(PUBLISHED_COPIES)).filter((name) => name.endsWith('.json'));
    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      const copy = JSON.parse(await readFile(`${PUBLISHED_COPIES}/${name}`, 'utf8')) as {
        projectId: string;
        schemaVersion: number;
        tables: Record<string, FilmRow[]>;
      };
      const target = (await freshDatabase()).db;

      writeFilmRows(target, upgradeFilmRows(opened, copy));

      const back = readFilmRows(target, copy.projectId);
      for (const [table, rows] of Object.entries(copy.tables)) {
        expect(back[table]?.length, `${name}, ${table}`).toBe(rows.length);
      }
    }
  });
});

import { sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  FILM_TABLES_LEFT_OUT,
  FILM_TABLE_NAMES,
  foreignRowProblem,
  readFilmRows,
  writeFilmRows,
} from './film-copy.js';
import { openFilmzyDatabase, type FilmzyDb } from './open.js';
import { createProjectStore } from './project-store.js';
import { tempDataDir } from './test.fixtures.js';

let db: FilmzyDb;

beforeEach(async () => {
  ({ db } = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' }));
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

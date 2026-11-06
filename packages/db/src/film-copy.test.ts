import { beforeEach, describe, expect, it } from 'vitest';

import { foreignRowProblem, readFilmRows, writeFilmRows } from './film-copy.js';
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

describe('le righe di un film', () => {
  it('si leggono solo quelle di quel film', () => {
    const film = newFilm('Uno');
    newFilm('Due');

    const rows = readFilmRows(db, film.id);

    expect(rows.projects).toHaveLength(1);
    expect(rows.projects?.[0]?.title).toBe('Uno');
  });

  it('si riscrivono uguali in un altro database, e sostituendo tolgono le vecchie', async () => {
    const film = newFilm('Uno');
    const rows = readFilmRows(db, film.id);
    const other = (await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0' })).db;

    writeFilmRows(other, film.id, rows, { replace: false });
    expect(readFilmRows(other, film.id).projects).toEqual(rows.projects);

    const renamed = { ...rows, projects: [{ ...rows.projects?.[0], title: 'Nuovo titolo' }] };
    writeFilmRows(other, film.id, renamed, { replace: true });
    expect(readFilmRows(other, film.id).projects?.[0]?.title).toBe('Nuovo titolo');
  });

  it('senza sostituire, un film che c’è già non si scrive due volte: tutto o niente', () => {
    const film = newFilm('Uno');
    const rows = readFilmRows(db, film.id);

    expect(() => {
      writeFilmRows(db, film.id, rows, { replace: false });
    }).toThrow();
    expect(readFilmRows(db, film.id).projects).toHaveLength(1);
  });
});

describe('righe arrivate da fuori', () => {
  const rows = { projects: [{ id: 'f' }], characters: [{ id: 'c', project_id: 'f' }] };

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
});

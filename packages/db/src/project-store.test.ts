import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createProjectStore, type NewProject, type ProjectStore } from './project-store.js';
import { tempDataDir } from './test.fixtures.js';

const film: NewProject = {
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata sull’ultimo treno',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'handheld_warm',
  language: 'it',
  durationS: 60,
  phase: 'draft',
};

let dataDir: string;
let aperto: OpenedDatabase;
let store: ProjectStore;
let clock = new Date('2026-10-28T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-10-28T10:00:00.000Z');
  dataDir = await tempDataDir();
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createProjectStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

describe('ProjectStore', () => {
  it('crea un film e lo rilegge com’è, con la fase e le date', () => {
    const created = store.create(film);

    expect(created).toMatchObject({ ...film, createdAt: clock.toISOString() });
    expect(created.updatedAt).toBe(created.createdAt);
    expect(store.get(created.id)).toEqual(created);
  });

  it('due film hanno id diversi', () => {
    expect(store.create(film).id).not.toBe(store.create(film).id);
  });

  it('un film che non c’è non si trova e non si cambia', () => {
    expect(store.get('non-c-e')).toBeUndefined();
    expect(store.update('non-c-e', { tone: 'dark' })).toBeUndefined();
  });

  it('cambia solo i campi indicati e sposta la data di modifica, non quella di creazione', () => {
    const created = store.create(film);
    clock = new Date('2026-10-28T11:30:00.000Z');

    const changed = store.update(created.id, { tone: 'dark', idea: 'Un’altra idea' });

    expect(changed).toMatchObject({ ...film, tone: 'dark', idea: 'Un’altra idea' });
    expect(changed?.createdAt).toBe(created.createdAt);
    expect(changed?.updatedAt).toBe('2026-10-28T11:30:00.000Z');
  });

  it('elenca i film toccati per ultimi per primi', () => {
    const first = store.create({ ...film, title: 'Primo' });
    clock = new Date('2026-10-28T10:10:00.000Z');
    const second = store.create({ ...film, title: 'Secondo' });
    clock = new Date('2026-10-28T10:20:00.000Z');
    store.update(first.id, { title: 'Primo, rivisto' });

    expect(store.list().map((project) => project.title)).toEqual(['Primo, rivisto', 'Secondo']);
    expect(second.title).toBe('Secondo');
  });

  it('i film restano dopo aver chiuso e riaperto il database', async () => {
    const created = store.create(film);
    aperto.close();

    aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

    expect(createProjectStore(aperto.db).get(created.id)).toEqual(created);
  });
});

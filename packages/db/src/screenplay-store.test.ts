import { ROLE_OUTPUT_EXAMPLES, screenplaySchema } from '@filmzy/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { screenplays } from './schema.js';
import { createScreenplayStore, type ScreenplayStore } from './screenplay-store.js';
import { tempDataDir } from './test.fixtures.js';

const screenplay = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

let dataDir: string;
let aperto: OpenedDatabase;
let store: ScreenplayStore;
let clock = new Date('2026-10-28T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-10-28T10:00:00.000Z');
  dataDir = await tempDataDir();
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createScreenplayStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

const draft = { projectId: 'film-1', stage: 'draft', screenplay } as const;

describe('ScreenplayStore', () => {
  it('la prima versione è la 1, e si rilegge com’era', () => {
    const created = store.create({ ...draft, generationId: 'g-1' });

    expect(created).toMatchObject({
      projectId: 'film-1',
      stage: 'draft',
      version: 1,
      generationId: 'g-1',
      createdAt: clock.toISOString(),
    });
    expect(created.request).toBeUndefined();
    expect(store.get(created.id)).toEqual(created);
  });

  it('ogni richiesta scrive una versione nuova e la precedente resta com’era', () => {
    const first = store.create(draft);
    clock = new Date('2026-10-28T10:05:00.000Z');
    const second = store.create({
      ...draft,
      screenplay: { ...screenplay, title: 'Titolo rivisto' },
      request: 'Rendila più cupa',
    });

    expect(second.version).toBe(2);
    expect(second.request).toBe('Rendila più cupa');
    expect(store.get(first.id)).toEqual(first);
    expect(store.get(first.id)?.screenplay.title).toBe(screenplay.title);
  });

  it('i numeri sono per film e per tappa: ognuno riparte da 1', () => {
    store.create(draft);
    store.create(draft);

    expect(store.create({ ...draft, projectId: 'film-2' }).version).toBe(1);
    expect(store.create({ ...draft, stage: 'final' }).version).toBe(1);
    expect(store.create(draft).version).toBe(3);
  });

  it('l’ultima versione è la più recente; senza versioni non c’è niente', () => {
    expect(store.latest('film-1', 'draft')).toBeUndefined();

    store.create(draft);
    const last = store.create({ ...draft, request: 'Più breve' });

    expect(store.latest('film-1', 'draft')).toEqual(last);
    expect(store.latest('film-1', 'final')).toBeUndefined();
  });

  it('l’elenco va dalla più recente e ha il titolo, non il testo intero', () => {
    store.create(draft);
    store.create({ ...draft, screenplay: { ...screenplay, title: 'Secondo titolo' } });

    const list = store.list('film-1', 'draft');

    expect(list.map((item) => item.version)).toEqual([2, 1]);
    expect(list.map((item) => item.title)).toEqual(['Secondo titolo', screenplay.title]);
    expect(list.every((item) => !('screenplay' in item))).toBe(true);
  });

  it('un film senza versioni ha un elenco vuoto, e un id che non c’è non si trova', () => {
    expect(store.list('film-1', 'draft')).toEqual([]);
    expect(store.get('non-c-e')).toBeUndefined();
  });

  it('due versioni con lo stesso numero non possono esistere', () => {
    const created = store.create(draft);

    expect(() =>
      aperto.db
        .insert(screenplays)
        .values({
          id: 'doppione',
          projectId: 'film-1',
          stage: 'draft',
          version: created.version,
          content: JSON.stringify(screenplay),
          createdAt: 0,
        })
        .run(),
    ).toThrow();
  });

  it('le versioni restano dopo aver chiuso e riaperto il database', async () => {
    const created = store.create({ ...draft, request: 'Più breve' });
    aperto.close();

    aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

    expect(createScreenplayStore(aperto.db).get(created.id)).toEqual(created);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import { createAssemblyStore, type AssemblyStore } from './assembly-store.js';
import { openFilmzyDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

let store: AssemblyStore;
let clock: Date;

beforeEach(async () => {
  clock = new Date('2026-11-05T10:00:00.000Z');
  const opened = await openFilmzyDatabase({
    dataDir: await tempDataDir(),
    appVersion: '0.0.0-test',
  });
  store = createAssemblyStore(opened.db, { now: () => clock });
});

describe('i montaggi di un film', () => {
  it('un tentativo nasce in coda e ricorda cosa conteneva', () => {
    const started = store.start('film-1', 'impronta');

    expect(started.status).toBe('queued');
    expect(store.get(started.id)).toMatchObject({
      projectId: 'film-1',
      fingerprint: 'impronta',
    });
  });

  it('quello riuscito porta il file e la durata; dopo un errore resta solo il motivo', () => {
    const started = store.start('film-1', 'x');

    store.finish(started.id, { status: 'succeeded', assetId: 'a-1', durationS: 42 });
    expect(store.get(started.id)?.assembly).toMatchObject({ assetId: 'a-1', durationS: 42 });

    store.finish(started.id, { status: 'failed', errorCode: 'ffmpeg_failed' });
    const failed = store.get(started.id)?.assembly;
    expect(failed?.errorCode).toBe('ffmpeg_failed');
    expect(failed?.assetId).toBeUndefined();
  });

  it('si legge l’ultimo del film, e un film senza montaggi non ne ha', () => {
    store.start('film-1', 'primo');
    clock = new Date(clock.getTime() + 1000);
    const second = store.start('film-1', 'secondo');
    store.start('film-2', 'altro');

    expect(store.latest('film-1')?.assembly.id).toBe(second.id);
    expect(store.latest('film-3')).toBeUndefined();
    expect(store.get('inventato')).toBeUndefined();
  });
});

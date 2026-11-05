import { beforeEach, describe, expect, it } from 'vitest';

import { createExportStore, type ExportStore } from './export-store.js';
import { openFilmzyDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

let store: ExportStore;
let clock: Date;

beforeEach(async () => {
  clock = new Date('2026-11-05T10:00:00.000Z');
  const opened = await openFilmzyDatabase({
    dataDir: await tempDataDir(),
    appVersion: '0.0.0-test',
  });
  store = createExportStore(opened.db, { now: () => clock });
});

describe('le esportazioni di un film', () => {
  it('l’ultimo tentativo e l’ultimo file riuscito sono due cose diverse', () => {
    const good = store.start('film-1', { sourceAssetId: 'a', shortSide: 720 });
    store.finish(good.id, { status: 'succeeded', fileName: 'Film - 720p.mp4' });
    clock = new Date('2026-11-05T10:01:00.000Z');
    const bad = store.start('film-1', { sourceAssetId: 'b', shortSide: 480 });
    store.finish(bad.id, { status: 'failed', errorCode: 'ffmpeg_failed' });

    expect(store.latest('film-1')?.export).toMatchObject({
      id: bad.id,
      status: 'failed',
      errorCode: 'ffmpeg_failed',
      shortSide: 480,
    });
    expect(store.succeeded('film-1')).toMatchObject([
      {
        sourceAssetId: 'a',
        fileName: 'Film - 720p.mp4',
        export: { id: good.id, shortSide: 720 },
      },
    ]);
  });

  it('i riusciti vengono dal più recente', () => {
    const first = store.start('film-1', { sourceAssetId: 'a', shortSide: 720 });
    store.finish(first.id, { status: 'succeeded', fileName: 'a.mp4' });
    clock = new Date('2026-11-05T10:01:00.000Z');
    const second = store.start('film-1', { sourceAssetId: 'a', shortSide: 480 });
    store.finish(second.id, { status: 'succeeded', fileName: 'b.mp4' });

    expect(store.succeeded('film-1').map(({ fileName }) => fileName)).toEqual(['b.mp4', 'a.mp4']);
  });

  it('un film non vede le esportazioni di un altro', () => {
    const other = store.start('film-2', { sourceAssetId: 'a', shortSide: 720 });
    store.finish(other.id, { status: 'succeeded', fileName: 'Altro.mp4' });

    expect(store.latest('film-1')).toBeUndefined();
    expect(store.succeeded('film-1')).toEqual([]);
  });

  it('un tentativo che non c’è non è un errore: dice che non c’è', () => {
    expect(store.get('nessuno')).toBeUndefined();
  });

  it('il segno di vita si aggiorna a ogni passo', () => {
    const started = store.start('film-1', { sourceAssetId: 'a', shortSide: 720 });

    clock = new Date('2026-11-05T10:05:00.000Z');
    store.finish(started.id, { status: 'running' });

    expect(store.get(started.id)?.lastActivityAt).toBe(clock.getTime());
  });
});

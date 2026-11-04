import { ROLE_INPUT_EXAMPLES, cinematographerInputSchema, type ShotSpec } from '@filmzy/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createShotStore, type ShotStore } from './shot-store.js';
import { createTakeStore, type TakeStore } from './take-store.js';
import { tempDataDir } from './test.fixtures.js';

/** Un momento lontano: conta ogni lavoro, anche vecchio. */
const LONG_AGO = new Date(0);

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;
const shot = (id: string): ShotSpec => ({ ...example, id });

const kling = { modelId: 'kling-o3-standard', modelLabel: 'Kling · Standard' };
const seedance = { modelId: 'seedance-2', modelLabel: 'Seedance 2' };

let opened: OpenedDatabase;
let shots: ShotStore;
let store: TakeStore;
let clock: Date;

const tick = () => {
  clock = new Date(clock.getTime() + 1000);
};

beforeEach(async () => {
  clock = new Date('2026-11-02T10:00:00.000Z');
  opened = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  shots = createShotStore(opened.db, { now: () => clock });
  store = createTakeStore(opened.db, { now: () => clock });
  shots.replaceScene({
    projectId: 'film-1',
    sceneNumber: 1,
    sceneHash: 'h',
    screenplayId: 's',
    shots: [shot('a1'), shot('a2')],
  });
  shots.replaceScene({
    projectId: 'film-2',
    sceneNumber: 1,
    sceneHash: 'h',
    screenplayId: 's',
    shots: [shot('b1')],
  });
  return () => {
    opened.close();
  };
});

describe('quando è partito il take che la card fa vedere (regole di continuità)', () => {
  it('conta la partenza, non l’arrivo; il più recente, ma se ne è scelto uno vale quello', () => {
    shots.replaceScene({
      projectId: 'film-tempi',
      sceneNumber: 1,
      sceneHash: 'h',
      screenplayId: 's',
      shots: [shot('t1')],
    });
    const old = store.start('t1', kling);
    const oldAt = clock.getTime();
    tick();
    store.finish(old.id, { status: 'succeeded', assetId: 'clip-1' });
    tick();
    const recent = store.start('t1', kling);
    const recentAt = clock.getTime();
    tick();
    tick();
    // Arriva molto dopo: conta comunque quando è partito.
    store.finish(recent.id, { status: 'succeeded', assetId: 'clip-2' });
    expect(store.lastTakeAt('film-tempi')).toEqual({ t1: recentAt });

    store.choose('t1', old.id);
    expect(store.lastTakeAt('film-tempi')).toEqual({ t1: oldAt });

    // Un take fallito non conta.
    store.choose('t1', undefined);
    tick();
    const failed = store.start('t1', kling);
    store.finish(failed.id, { status: 'failed', errorCode: 'timeout' });
    expect(store.lastTakeAt('film-tempi')).toEqual({ t1: recentAt });
  });
});

describe('i take di un’inquadratura', () => {
  it('un take nasce in coda con il servizio scelto, senza clip né costo', () => {
    const take = store.start('a1', kling);

    expect(take).toMatchObject({
      chosen: false,
      status: 'queued',
      modelId: 'kling-o3-standard',
      modelLabel: 'Kling · Standard',
      createdAt: '2026-11-02T10:00:00.000Z',
    });
    expect(take).not.toHaveProperty('assetId');
    expect(take).not.toHaveProperty('costUsd');
    expect(store.get(take.id)).toEqual({ shotId: 'a1', take });
  });

  it('un take riuscito porta la clip e il costo reale, e il servizio resta quello che ha lavorato', () => {
    const { id } = store.start('a1', kling);

    expect(
      store.finish(id, { status: 'succeeded', assetId: 'clip-1', receiptId: 'r-1', costUsd: 0.42 }),
    ).toBe(true);

    expect(store.get(id)?.take).toMatchObject({
      status: 'succeeded',
      assetId: 'clip-1',
      costUsd: 0.42,
      modelLabel: 'Kling · Standard',
    });
  });

  it('un take fallito dice perché, senza clip', () => {
    const { id } = store.start('a1', kling);

    store.finish(id, { status: 'failed', errorCode: 'content_rejected' });

    const take = store.get(id)?.take;
    expect(take).toMatchObject({ status: 'failed', errorCode: 'content_rejected' });
    expect(take).not.toHaveProperty('assetId');
  });

  it('rigenerare con un altro servizio dà un secondo take, e i take si leggono dal più recente', () => {
    const first = store.start('a1', kling);
    tick();
    const second = store.start('a1', seedance);
    store.start('a2', kling);

    expect(store.list('a1').map((take) => [take.id, take.modelLabel])).toEqual([
      [second.id, 'Seedance 2'],
      [first.id, 'Kling · Standard'],
    ]);
  });

  it('finire un take che non c’è più (piano rifatto) non fa niente e lo dice', () => {
    expect(store.finish('non-c-e', { status: 'failed', errorCode: 'timeout' })).toBe(false);
    expect(store.get('non-c-e')).toBeUndefined();
  });
});

describe('la clip più recente di ogni inquadratura', () => {
  it('è quella del take riuscito più recente; i take in coda o falliti non contano', () => {
    const old = store.start('a1', kling);
    store.finish(old.id, { status: 'succeeded', assetId: 'clip-vecchia' });
    tick();
    const recent = store.start('a1', seedance);
    store.finish(recent.id, { status: 'succeeded', assetId: 'clip-nuova' });
    tick();
    store.start('a1', kling);
    tick();
    const failed = store.start('a2', kling);
    store.finish(failed.id, { status: 'failed', errorCode: 'timeout' });

    expect(store.latestClips('film-1')).toEqual({ a1: 'clip-nuova' });
  });

  it('guarda solo le inquadrature del film', () => {
    const other = store.start('b1', kling);
    store.finish(other.id, { status: 'succeeded', assetId: 'clip-di-altri' });

    expect(store.latestClips('film-1')).toEqual({});
    expect(store.latestClips('film-2')).toEqual({ b1: 'clip-di-altri' });
    expect(store.latestClips('non-c-e')).toEqual({});
  });
});

describe('il take scelto (T4.6)', () => {
  it('nessuno è scelto all’inizio; scegliere un take lo segna, e un altro scelto lo toglie al primo', () => {
    const first = store.start('a1', kling);
    tick();
    const second = store.start('a1', seedance);

    expect(store.list('a1').map((take) => take.chosen)).toEqual([false, false]);

    store.choose('a1', first.id);
    expect(store.list('a1').map((take) => [take.id, take.chosen])).toEqual([
      [second.id, false],
      [first.id, true],
    ]);
    expect(store.get(first.id)?.take.chosen).toBe(true);

    store.choose('a1', second.id);
    expect(
      store
        .list('a1')
        .filter((take) => take.chosen)
        .map((take) => take.id),
    ).toEqual([second.id]);
  });

  it('togliere la scelta fa tornare a valere il più recente; la scelta di un’inquadratura non tocca le altre', () => {
    const a1 = store.start('a1', kling);
    const a2 = store.start('a2', kling);
    store.choose('a1', a1.id);

    expect(store.list('a2')[0]?.chosen).toBe(false);
    expect(store.get(a2.id)?.take.chosen).toBe(false);

    store.choose('a1', undefined);
    expect(store.list('a1')[0]?.chosen).toBe(false);
  });
});

describe('la clip che la card fa vedere, con la scelta (T4.6)', () => {
  it('vale il take scelto, anche se non è il più recente; senza scelta, il più recente', () => {
    const old = store.start('a1', kling);
    store.finish(old.id, { status: 'succeeded', assetId: 'clip-vecchia' });
    tick();
    const recent = store.start('a1', seedance);
    store.finish(recent.id, { status: 'succeeded', assetId: 'clip-nuova' });

    expect(store.latestClips('film-1')).toEqual({ a1: 'clip-nuova' });

    store.choose('a1', old.id);
    expect(store.latestClips('film-1')).toEqual({ a1: 'clip-vecchia' });

    store.choose('a1', undefined);
    expect(store.latestClips('film-1')).toEqual({ a1: 'clip-nuova' });
  });

  it('un take scelto che non è riuscito non conta: si torna al più recente riuscito', () => {
    const ok = store.start('a1', kling);
    store.finish(ok.id, { status: 'succeeded', assetId: 'clip-buona' });
    tick();
    const bad = store.start('a1', seedance);
    store.finish(bad.id, { status: 'failed', errorCode: 'timeout' });

    store.choose('a1', bad.id);

    expect(store.latestClips('film-1')).toEqual({ a1: 'clip-buona' });
  });
});

describe('i fotogrammi presi da un take (T4.6)', () => {
  it('si salvano col take e il momento, e si leggono dal più recente, solo dell’inquadratura', () => {
    const take = store.start('a1', kling);
    const first = store.addFrame({ shotId: 'a1', takeId: take.id, atS: 1.5, assetId: 'img-1' });
    tick();
    const second = store.addFrame({ shotId: 'a1', takeId: take.id, atS: 0, assetId: 'img-2' });
    store.addFrame({ shotId: 'a2', takeId: 'altro', atS: 3, assetId: 'img-3' });

    expect(first).toMatchObject({ shotId: 'a1', takeId: take.id, atS: 1.5, assetId: 'img-1' });
    expect(store.frames('a1').map((frame) => frame.id)).toEqual([second.id, first.id]);
    expect(store.frames('a1')[0]?.createdAt).toBe('2026-11-02T10:00:01.000Z');
    expect(store.frames('non-c-e')).toEqual([]);
  });
});

describe('le inquadrature con un take in corso', () => {
  it('sono quelle con un take in coda o in lavorazione, e solo del film', () => {
    const waiting = store.start('a1', kling);
    const running = store.start('a2', kling);
    store.finish(running.id, { status: 'running' });
    const done = store.start('a2', seedance);
    store.finish(done.id, { status: 'succeeded', assetId: 'clip' });
    const elsewhere = store.start('b1', kling);

    expect(store.inProgress('film-1', LONG_AGO).sort()).toEqual(['a1', 'a2']);
    expect(store.inProgress('film-2', LONG_AGO)).toEqual(['b1']);
    expect(store.inProgress('non-c-e', LONG_AGO)).toEqual([]);

    store.finish(waiting.id, { status: 'failed', errorCode: 'timeout' });
    store.finish(running.id, { status: 'succeeded', assetId: 'clip-2' });
    store.finish(elsewhere.id, { status: 'succeeded', assetId: 'clip-3' });
    expect(store.inProgress('film-1', LONG_AGO)).toEqual([]);
  });
});

describe('un take rimasto a metà', () => {
  it('non conta più come «in corso» dopo il limite dato, perché il lavoro si è perso', () => {
    const old = createTakeStore(opened.db, { now: () => new Date('2026-11-02T08:00:00.000Z') });
    old.start('a1', kling);
    const recent = store.start('a2', kling);

    const since = new Date('2026-11-02T09:00:00.000Z');

    expect(store.inProgress('film-1', since)).toEqual(['a2']);
    expect(store.inProgress('film-1', LONG_AGO).sort()).toEqual(['a1', 'a2']);
    expect(recent.status).toBe('queued');
  });
});

describe('rifare il piano della scena', () => {
  it('porta via i take, i fotogrammi e la scelta delle inquadrature di prima, e lascia quelli delle altre scene', () => {
    const gone = store.start('a1', kling);
    store.choose('a1', gone.id);
    store.addFrame({ shotId: 'a1', takeId: gone.id, atS: 1, assetId: 'img' });
    shots.replaceScene({
      projectId: 'film-1',
      sceneNumber: 2,
      sceneHash: 'h',
      screenplayId: 's',
      shots: [shot('c1')],
    });
    const kept = store.start('c1', kling);

    shots.replaceScene({
      projectId: 'film-1',
      sceneNumber: 1,
      sceneHash: 'h2',
      screenplayId: 's',
      shots: [shot('a3')],
    });

    expect(store.get(gone.id)).toBeUndefined();
    expect(store.get(kept.id)).toBeDefined();
    expect(store.frames('a1')).toEqual([]);
  });
});

import { ROLE_INPUT_EXAMPLES, cinematographerInputSchema, type ShotSpec } from '@filmzy/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createShotStore, type NewShotPlan, type ShotStore } from './shot-store.js';
import { tempDataDir } from './test.fixtures.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;

const shot = (id: string, sceneNumber: number): ShotSpec => ({
  ...example,
  id,
  sceneId: `scena-${String(sceneNumber)}`,
});

function plan(sceneNumber: number, ids: string[], extra: Partial<NewShotPlan> = {}): NewShotPlan {
  return {
    projectId: 'film-1',
    sceneNumber,
    sceneHash: `hash-${String(sceneNumber)}`,
    screenplayId: 'stesura-1',
    generationId: 'scontrino-1',
    shots: ids.map((id) => shot(id, sceneNumber)),
    ...extra,
  };
}

let opened: OpenedDatabase;
let store: ShotStore;
let clock = new Date('2026-11-02T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-11-02T10:00:00.000Z');
  opened = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createShotStore(opened.db, { now: () => clock });
  return () => {
    opened.close();
  };
});

describe('il piano delle inquadrature di una scena', () => {
  it('si salva e si rilegge com’è, con le inquadrature nell’ordine in cui sono state date', () => {
    const saved = store.replaceScene(
      plan(1, ['s-b', 's-a', 's-c'], { notes: 'Fotografia come il film.' }),
    );

    expect(saved).toMatchObject({
      sceneNumber: 1,
      sceneHash: 'hash-1',
      screenplayId: 'stesura-1',
      generationId: 'scontrino-1',
      notes: 'Fotografia come il film.',
      createdAt: '2026-11-02T10:00:00.000Z',
    });
    expect(saved.shots.map((s) => s.id)).toEqual(['s-b', 's-a', 's-c']);
    expect(store.plan('film-1', 1)).toEqual(saved);
  });

  it('rifare la scena sostituisce il piano: le inquadrature vecchie non restano', () => {
    store.replaceScene(plan(1, ['vecchia-1', 'vecchia-2']));
    clock = new Date('2026-11-02T11:00:00.000Z');
    const second = store.replaceScene(plan(1, ['nuova-1'], { sceneHash: 'hash-nuovo' }));

    expect(second.shots.map((s) => s.id)).toEqual(['nuova-1']);
    expect(store.plan('film-1', 1)).toMatchObject({ sceneHash: 'hash-nuovo' });
    expect(store.get('vecchia-1')).toBeUndefined();
  });

  it('i piani sono per film e per scena: un’altra scena o un altro film non si toccano', () => {
    store.replaceScene(plan(1, ['a1']));
    store.replaceScene(plan(2, ['b1', 'b2']));
    store.replaceScene({ ...plan(1, ['c1']), projectId: 'film-2' });
    store.replaceScene(plan(1, ['a1-bis']));

    expect(store.plans('film-1').map((p) => [p.sceneNumber, p.shots.map((s) => s.id)])).toEqual([
      [1, ['a1-bis']],
      [2, ['b1', 'b2']],
    ]);
    expect(store.plans('film-2').map((p) => p.shots.map((s) => s.id))).toEqual([['c1']]);
    expect(store.plans('film-3')).toEqual([]);
    expect(store.plan('film-1', 3)).toBeUndefined();
  });

  it('un’inquadratura si ritrova dall’id, con il film e la scena a cui appartiene', () => {
    store.replaceScene(plan(2, ['b1']));

    expect(store.get('b1')).toMatchObject({ projectId: 'film-1', sceneNumber: 2 });
    expect(store.get('b1')?.spec.id).toBe('b1');
  });

  it('si cambia la scheda di un’inquadratura senza toccare le altre', () => {
    store.replaceScene(plan(1, ['a1', 'a2']));
    const changed: ShotSpec = {
      ...shot('a1', 1),
      intent: { ...example.intent, cameraMovement: 'static' },
    };

    store.updateSpec('a1', changed);

    expect(store.get('a1')?.spec.intent.cameraMovement).toBe('static');
    expect(store.get('a2')?.spec.intent.cameraMovement).toBe(example.intent.cameraMovement);
  });

  it('il piano della scena pensata più vicina prima di questa, saltando quelle non pensate', () => {
    store.replaceScene(plan(1, ['a1']));
    store.replaceScene(plan(3, ['c1', 'c2']));
    store.replaceScene({ ...plan(2, ['x1']), projectId: 'film-2' });

    expect(store.planBefore('film-1', 5)?.sceneNumber).toBe(3);
    expect(store.planBefore('film-1', 3)?.sceneNumber).toBe(1);
    expect(store.planBefore('film-1', 1)).toBeUndefined();
    expect(store.planBefore('film-3', 9)).toBeUndefined();
  });

  it('cambiare la scheda di un’inquadratura che non c’è più lo dice, invece di far finta', () => {
    store.replaceScene(plan(1, ['a1']));
    store.replaceScene(plan(1, ['a2']));

    expect(store.updateSpec('a1', shot('a1', 1))).toBe(false);
    expect(store.updateSpec('a2', shot('a2', 1))).toBe(true);
  });

  it('un piano senza scontrino né note si rilegge senza quei campi', () => {
    const saved = store.replaceScene({
      projectId: 'film-1',
      sceneNumber: 1,
      sceneHash: 'h',
      screenplayId: 's',
      shots: [shot('a1', 1)],
    });

    expect(saved).not.toHaveProperty('generationId');
    expect(saved).not.toHaveProperty('notes');
  });
});

describe('lo storyboard di un’inquadratura', () => {
  it('ogni richiesta è un tentativo numerato da 1, in coda, e si legge dal più recente', () => {
    store.replaceScene(plan(1, ['a1']));

    expect(store.startStoryboard('a1', 'storyboard')).toBe(1);
    expect(store.startStoryboard('a1', 'storyboard')).toBe(2);

    const { attempts, chosenAssetId } = store.storyboard('a1', 'storyboard');
    expect(attempts.map((attempt) => [attempt.attempt, attempt.status])).toEqual([
      [2, 'queued'],
      [1, 'queued'],
    ]);
    expect(chosenAssetId).toBeUndefined();
  });

  it('lo storyboard e l’ultimo fotogramma hanno ciascuno i suoi tentativi, numerati a parte', () => {
    store.replaceScene(plan(1, ['a1']));

    expect(store.startStoryboard('a1', 'storyboard')).toBe(1);
    expect(store.startStoryboard('a1', 'end_frame')).toBe(1);
    expect(store.startStoryboard('a1', 'end_frame')).toBe(2);
    store.finishStoryboard('a1', 'end_frame', 2, { status: 'succeeded', assetIds: ['u'] });
    store.chooseStoryboard('a1', 'x');

    expect(store.storyboard('a1', 'storyboard').attempts).toHaveLength(1);
    const lastFrames = store.storyboard('a1', 'end_frame');
    expect(lastFrames.attempts.map((attempt) => [attempt.attempt, attempt.status])).toEqual([
      [2, 'succeeded'],
      [1, 'queued'],
    ]);
    // La variante scelta è dello storyboard: l'ultimo fotogramma sta nelle immagini della scheda.
    expect(lastFrames.chosenAssetId).toBeUndefined();
  });

  it('un tentativo finito porta i suoi file, o il codice dell’errore se è fallito', () => {
    store.replaceScene(plan(1, ['a1']));
    store.startStoryboard('a1', 'storyboard');
    store.startStoryboard('a1', 'storyboard');

    store.finishStoryboard('a1', 'storyboard', 1, {
      status: 'succeeded',
      assetIds: ['x', 'y', 'z'],
    });
    store.finishStoryboard('a1', 'storyboard', 2, { status: 'failed', errorCode: 'timeout' });

    const { attempts } = store.storyboard('a1', 'storyboard');
    expect(attempts[1]).toMatchObject({ status: 'succeeded', assetIds: ['x', 'y', 'z'] });
    expect(attempts[0]).toMatchObject({ status: 'failed', errorCode: 'timeout', assetIds: [] });
  });

  it('si sceglie una variante, si cambia scelta e si toglie; la scelta di ogni inquadratura del film si legge insieme', () => {
    store.replaceScene(plan(1, ['a1', 'a2']));
    store.replaceScene({ ...plan(1, ['b1']), projectId: 'film-2' });

    store.chooseStoryboard('a1', 'x');
    store.chooseStoryboard('b1', 'altro-film');
    expect(store.storyboard('a1', 'storyboard').chosenAssetId).toBe('x');
    expect(store.chosenStoryboards('film-1')).toEqual({ a1: 'x' });

    store.chooseStoryboard('a1', 'y');
    store.chooseStoryboard('a2', 'z');
    expect(store.chosenStoryboards('film-1')).toEqual({ a1: 'y', a2: 'z' });

    store.chooseStoryboard('a1', undefined);
    expect(store.storyboard('a1', 'storyboard').chosenAssetId).toBeUndefined();
    expect(store.chosenStoryboards('film-1')).toEqual({ a2: 'z' });
  });

  it('si sa cosa si sta disegnando adesso per ogni inquadratura, e l’ultimo fotogramma vince', () => {
    store.replaceScene(plan(1, ['a1', 'a2', 'a3']));
    store.replaceScene({ ...plan(1, ['b1']), projectId: 'film-2' });
    store.startStoryboard('a1', 'storyboard');
    store.startStoryboard('a2', 'storyboard');
    store.startStoryboard('a2', 'end_frame');
    store.startStoryboard('b1', 'storyboard');
    const done = store.startStoryboard('a3', 'storyboard');
    store.finishStoryboard('a3', 'storyboard', done, { status: 'succeeded', assetIds: ['x'] });

    expect(store.drawing('film-1')).toEqual({ a1: 'storyboard', a2: 'end_frame' });
    expect(store.drawing('film-2')).toEqual({ b1: 'storyboard' });
    expect(store.drawing('non-c-e')).toEqual({});

    store.finishStoryboard('a1', 'storyboard', 1, { status: 'running' });
    expect(store.drawing('film-1').a1).toBe('storyboard');
    store.finishStoryboard('a1', 'storyboard', 1, { status: 'failed', errorCode: 'timeout' });
    expect(store.drawing('film-1')).toEqual({ a2: 'end_frame' });
  });

  it('rifare la scena toglie le inquadrature di prima con i loro tentativi e la loro scelta', () => {
    store.replaceScene(plan(1, ['a1']));
    store.replaceScene(plan(2, ['b1']));
    store.startStoryboard('a1', 'storyboard');
    store.startStoryboard('b1', 'storyboard');
    store.chooseStoryboard('a1', 'x');

    store.replaceScene(plan(1, ['a2']));

    expect(store.storyboard('a1', 'storyboard').attempts).toEqual([]);
    expect(store.chosenStoryboards('film-1')).toEqual({});
    // L'altra scena non si tocca.
    expect(store.storyboard('b1', 'storyboard').attempts).toHaveLength(1);
  });
});

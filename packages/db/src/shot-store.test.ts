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

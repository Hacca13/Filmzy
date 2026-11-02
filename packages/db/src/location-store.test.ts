import { beforeEach, describe, expect, it } from 'vitest';

import { createLocationStore, type LocationStore, type NewLocation } from './location-store.js';
import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

const piazza: NewLocation = {
  name: 'La piazza del paese',
  description: 'Piazza centrale al tramonto',
  prompt: 'a small town square at sunset',
  proposalId: 'piazza',
};

let dataDir: string;
let aperto: OpenedDatabase;
let store: LocationStore;
let clock = new Date('2026-10-28T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-10-28T10:00:00.000Z');
  dataDir = await tempDataDir();
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createLocationStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

describe('i luoghi', () => {
  it('si crea un luogo dalla proposta e si rilegge com’è, senza immagine di riferimento', () => {
    const created = store.create('film-1', piazza);

    expect(created).toMatchObject({ ...piazza, references: [] });
    expect(store.get(created.id)).toEqual(created);
  });

  it('elenca i luoghi del film nell’ordine in cui sono stati aggiunti, e solo i suoi', () => {
    const first = store.create('film-1', piazza);
    clock = new Date('2026-10-28T10:01:00.000Z');
    const second = store.create('film-1', { ...piazza, name: 'La stazione', proposalId: 'st' });
    store.create('film-2', { ...piazza, name: 'Altrove' });

    expect(store.list('film-1').map((l) => l.id)).toEqual([first.id, second.id]);
    expect(store.list('film-3')).toEqual([]);
  });

  it('un luogo che non c’è non si trova e non si toglie', () => {
    expect(store.get('non-c-e')).toBeUndefined();
    expect(store.remove('non-c-e')).toBe(false);
  });

  it('togliere un luogo toglie anche i suoi tentativi', () => {
    const location = store.create('film-1', piazza);
    store.startAttempt(location.id);

    expect(store.remove(location.id)).toBe(true);

    expect(store.images(location.id).attempts).toEqual([]);
    expect(store.get(location.id)).toBeUndefined();
  });
});

describe('le immagini del set', () => {
  it('senza richieste non ci sono tentativi né immagine scelta', () => {
    const location = store.create('film-1', piazza);

    expect(store.images(location.id)).toEqual({ locationId: location.id, attempts: [] });
  });

  it('un tentativo nasce in coda; finito ha i suoi file, o il motivo per cui è fallito', () => {
    const location = store.create('film-1', piazza);
    const first = store.startAttempt(location.id);
    const second = store.startAttempt(location.id);

    store.finishAttempt(location.id, first, { status: 'succeeded', assetIds: ['a', 'b', 'c'] });
    store.finishAttempt(location.id, second, { status: 'failed', errorCode: 'content_rejected' });

    const { attempts } = store.images(location.id);
    expect(attempts.map((a) => [a.attempt, a.status])).toEqual([
      [2, 'failed'],
      [1, 'succeeded'],
    ]);
    expect(attempts[0]?.errorCode).toBe('content_rejected');
    expect(attempts[1]?.assetIds).toEqual(['a', 'b', 'c']);
  });

  it('i tentativi sono per luogo: ognuno riparte da 1', () => {
    const one = store.create('film-1', piazza);
    const two = store.create('film-1', { ...piazza, name: 'La stazione', proposalId: 'st' });
    store.startAttempt(one.id);

    expect(store.startAttempt(two.id)).toBe(1);
    expect(store.startAttempt(one.id)).toBe(2);
  });

  it('un’immagine scelta diventa il riferimento del luogo; si può cambiare e togliere', () => {
    const location = store.create('film-1', piazza);

    store.choose(location.id, 'a');
    expect(store.get(location.id)?.references).toEqual([{ assetId: 'a' }]);
    expect(store.images(location.id).chosenAssetId).toBe('a');

    store.choose(location.id, 'b');
    expect(store.get(location.id)?.references).toEqual([{ assetId: 'b' }]);

    store.choose(location.id, undefined);
    expect(store.get(location.id)?.references).toEqual([]);
  });

  it('finire un tentativo che non c’è non fa niente', () => {
    expect(() => {
      store.finishAttempt('non-c-e', 1, { status: 'succeeded' });
    }).not.toThrow();
  });

  it('tutto resta dopo aver chiuso e riaperto il database', async () => {
    const location = store.create('film-1', piazza);
    const attempt = store.startAttempt(location.id);
    store.finishAttempt(location.id, attempt, { status: 'succeeded', assetIds: ['a'] });
    store.choose(location.id, 'a');
    aperto.close();

    aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

    const reopened = createLocationStore(aperto.db);
    expect(reopened.get(location.id)?.references).toEqual([{ assetId: 'a' }]);
    expect(reopened.images(location.id).attempts[0]?.assetIds).toEqual(['a']);
  });
});

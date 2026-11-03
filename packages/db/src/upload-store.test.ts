import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';
import { createUploadStore, type UploadStore } from './upload-store.js';

let aperto: OpenedDatabase;
let store: UploadStore;
let clock = new Date('2026-11-03T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-11-03T10:00:00.000Z');
  aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createUploadStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

const later = () => {
  clock = new Date(clock.getTime() + 1000);
};

const room = {
  projectId: 'film-1',
  assetId: 'a'.repeat(64),
  kind: 'location' as const,
  locationId: 'piazza',
  name: 'La stanza',
  checked: true,
  description: 'a bare room with a wooden floor',
};

describe('le immagini caricate (T4.8)', () => {
  it('una foto salvata si rilegge com’è, con il luogo e la lettura del servizio', () => {
    const saved = store.add(room);

    expect(saved).toMatchObject({
      assetId: room.assetId,
      kind: 'location',
      locationId: 'piazza',
      name: 'La stanza',
      checked: true,
      description: room.description,
      createdAt: '2026-11-03T10:00:00.000Z',
    });
    expect(store.list('film-1')).toEqual([saved]);
  });

  it('un oggetto non ha luogo, e senza controllo non ha una descrizione', () => {
    const saved = store.add({
      projectId: 'film-1',
      assetId: 'b'.repeat(64),
      kind: 'object',
      name: 'La lanterna',
      checked: false,
    });

    expect(saved.locationId).toBeUndefined();
    expect(saved.description).toBeUndefined();
    expect(saved.checked).toBe(false);
  });

  it('si elencano dalla più vecchia e solo quelle del film', () => {
    const first = store.add(room);
    later();
    const second = store.add({ ...room, assetId: 'c'.repeat(64), name: 'Un’altra' });
    store.add({ ...room, projectId: 'film-2', assetId: 'd'.repeat(64) });

    expect(store.list('film-1').map((upload) => upload.id)).toEqual([first.id, second.id]);
    expect(store.list('non-c-e')).toEqual([]);
  });

  it('la stessa foto per lo stesso luogo non si ripete; per un altro luogo sì', () => {
    const first = store.add(room);
    later();
    const again = store.add({ ...room, name: 'Ancora la stanza' });
    const other = store.add({ ...room, locationId: 'cucina' });

    expect(again.id).toBe(first.id);
    expect(again.name).toBe('La stanza');
    expect(other.id).not.toBe(first.id);
    expect(store.list('film-1')).toHaveLength(2);
  });

  it('di un luogo si leggono i file caricati, nell’ordine', () => {
    store.add(room);
    later();
    store.add({ ...room, assetId: 'c'.repeat(64) });
    store.add({ ...room, assetId: 'e'.repeat(64), locationId: 'cucina' });

    expect(store.assetIdsOfLocation('piazza')).toEqual(['a'.repeat(64), 'c'.repeat(64)]);
    expect(store.assetIdsOfLocation('nessuno')).toEqual([]);
  });
});

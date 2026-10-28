import { beforeEach, describe, expect, it } from 'vitest';

import { createCharacterStore, type CharacterStore } from './character-store.js';
import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createSheetStore, type SheetStore } from './sheet-store.js';
import { tempDataDir } from './test.fixtures.js';

let dataDir: string;
let aperto: OpenedDatabase;
let sheets: SheetStore;
let characters: CharacterStore;
let characterId: string;
let clock = new Date('2026-10-28T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-10-28T10:00:00.000Z');
  dataDir = await tempDataDir();
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  sheets = createSheetStore(aperto.db, { now: () => clock });
  characters = createCharacterStore(aperto.db, { now: () => clock });
  characterId = characters.create('film-1', {
    name: 'Anna',
    tag: 'protagonist',
    role: 'La protagonista',
    description: 'Una donna che torna nella città natale.',
    appearance: {
      apparentAge: '35',
      build: 'snella',
      hair: 'corti',
      face: 'occhi chiari',
      clothing: 'giacca',
      prompt: 'a woman',
    },
  }).id;
  return () => {
    aperto.close();
  };
});

function succeed(attempt: number, assetPrefix: string) {
  for (const angle of ['front', 'profile', 'three_quarter'] as const) {
    sheets.update(characterId, attempt, angle, {
      status: 'succeeded',
      assetId: `${assetPrefix}-${angle}`,
    });
  }
}

describe('i file', () => {
  const asset = { id: 'abc', path: 'progetti/film-1/abc.png', contentType: 'image/png', bytes: 10 };

  it('un file registrato si ritrova, con lo scontrino che l’ha prodotto', () => {
    sheets.registerAsset({ ...asset, projectId: 'film-1', generationId: 'g-1' });

    expect(sheets.getAsset('abc')).toEqual({ ...asset, projectId: 'film-1', generationId: 'g-1' });
    expect(sheets.getAsset('non-c-e')).toBeUndefined();
  });

  it('lo stesso file due volte è lo stesso file: non si duplica e non dà errore', () => {
    sheets.registerAsset(asset);

    expect(() => {
      sheets.registerAsset(asset);
    }).not.toThrow();
    expect(sheets.getAsset('abc')).toEqual(asset);
  });
});

describe('la scheda', () => {
  it('senza richieste non ha tentativi né volto bloccato', () => {
    expect(sheets.get(characterId)).toEqual({ characterId, attempts: [] });
  });

  it('un tentativo nasce con le tre angolazioni in coda, nell’ordine', () => {
    const attempt = sheets.startAttempt(characterId);

    expect(attempt).toBe(1);
    const [first] = sheets.get(characterId).attempts;
    expect(first?.images.map((image) => [image.angle, image.status])).toEqual([
      ['front', 'queued'],
      ['profile', 'queued'],
      ['three_quarter', 'queued'],
    ]);
  });

  it('i tentativi vanno dal più recente, e ognuno ha il suo numero', () => {
    sheets.startAttempt(characterId);
    clock = new Date('2026-10-28T10:05:00.000Z');
    sheets.startAttempt(characterId);

    expect(sheets.get(characterId).attempts.map((a) => a.attempt)).toEqual([2, 1]);
  });

  it('segue il lavoro: in lavorazione, pronta con il file, fallita col suo motivo', () => {
    const attempt = sheets.startAttempt(characterId);

    sheets.update(characterId, attempt, 'front', { status: 'running' });
    sheets.update(characterId, attempt, 'profile', { status: 'succeeded', assetId: 'p1' });
    sheets.update(characterId, attempt, 'three_quarter', {
      status: 'failed',
      errorCode: 'content_rejected',
    });

    const images = sheets.get(characterId).attempts[0]?.images;
    expect(images).toEqual([
      { angle: 'front', status: 'running' },
      { angle: 'profile', status: 'succeeded', assetId: 'p1' },
      { angle: 'three_quarter', status: 'failed', errorCode: 'content_rejected' },
    ]);
  });

  it('le schede di due personaggi non si mescolano', () => {
    const other = characters.create('film-1', {
      name: 'Marco',
      tag: 'ally',
      role: 'Un amico',
      description: 'Un amico.',
      appearance: {
        apparentAge: '60',
        build: 'robusta',
        hair: 'grigi',
        face: 'occhiali',
        clothing: 'maglione',
        prompt: 'a man',
      },
    });
    sheets.startAttempt(characterId);

    expect(sheets.get(other.id).attempts).toEqual([]);
  });
});

describe('il volto bloccato', () => {
  it('si blocca su un tentativo e dà i tre file nell’ordine delle angolazioni', () => {
    const first = sheets.startAttempt(characterId);
    succeed(first, 'uno');
    const second = sheets.startAttempt(characterId);
    succeed(second, 'due');

    sheets.lock(characterId, first);

    expect(sheets.get(characterId).lockedAttempt).toBe(first);
    expect(sheets.lockedAssetIds(characterId)).toEqual([
      'uno-front',
      'uno-profile',
      'uno-three_quarter',
    ]);
  });

  it('si sblocca, e senza blocco non ci sono riferimenti', () => {
    const attempt = sheets.startAttempt(characterId);
    succeed(attempt, 'uno');
    sheets.lock(characterId, attempt);

    sheets.lock(characterId, undefined);

    expect(sheets.get(characterId).lockedAttempt).toBeUndefined();
    expect(sheets.lockedAssetIds(characterId)).toEqual([]);
  });

  it('togliere la scheda cancella i tentativi', () => {
    sheets.startAttempt(characterId);

    sheets.removeFor(characterId);

    expect(sheets.get(characterId).attempts).toEqual([]);
  });

  it('i tentativi e il blocco restano dopo aver chiuso e riaperto il database', async () => {
    const attempt = sheets.startAttempt(characterId);
    succeed(attempt, 'uno');
    sheets.lock(characterId, attempt);
    aperto.close();

    aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

    const reopened = createSheetStore(aperto.db);
    expect(reopened.get(characterId).lockedAttempt).toBe(attempt);
    expect(reopened.lockedAssetIds(characterId)).toHaveLength(3);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase } from './open.js';
import { createSceneChoiceStore, type SceneChoiceStore } from './scene-choice-store.js';
import { tempDataDir } from './test.fixtures.js';

let store: SceneChoiceStore;

beforeEach(async () => {
  const opened = await openFilmzyDatabase({
    dataDir: await tempDataDir(),
    appVersion: '0.0.0-test',
  });
  store = createSceneChoiceStore(opened.db);
});

describe('le scene tolte da un film', () => {
  it('all’inizio non ce n’è nessuna', () => {
    expect(store.excluded('film-1')).toEqual(new Set());
  });

  it('togliere e rimettere; farlo due volte non cambia niente', () => {
    store.setIncluded('film-1', 2, false);
    store.setIncluded('film-1', 2, false);
    expect(store.excluded('film-1')).toEqual(new Set([2]));

    store.setIncluded('film-1', 2, true);
    store.setIncluded('film-1', 2, true);
    expect(store.excluded('film-1')).toEqual(new Set());
  });

  it('ogni film ha le sue', () => {
    store.setIncluded('film-1', 1, false);

    expect(store.excluded('film-2')).toEqual(new Set());
  });
});

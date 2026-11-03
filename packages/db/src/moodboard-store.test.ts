import type { MoodReference } from '@filmzy/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { createMoodboardStore, type MoodboardStore } from './moodboard-store.js';
import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

let aperto: OpenedDatabase;
let store: MoodboardStore;
let clock = new Date('2026-11-03T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-11-03T10:00:00.000Z');
  aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createMoodboardStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

const later = () => {
  clock = new Date(clock.getTime() + 1000);
};

const amber = { hex: '#c2813a', name: 'Ambra', use: 'dominante' as const };

const reference = (extra: Partial<MoodReference> = {}): MoodReference => ({
  assetId: 'a'.repeat(64),
  origin: 'uploaded',
  analysisOnly: false,
  description: 'a quiet station at dusk',
  moodTags: ['quiet', 'warm'],
  palette: [amber],
  ...extra,
});

describe('il moodboard nel database (T4.10)', () => {
  it('un film senza moodboard ha una parte vuota e nessuna scena', () => {
    expect(store.get('film-1')).toEqual({
      projectId: 'film-1',
      film: { palette: [], notes: '', references: [] },
      scenes: [],
    });
  });

  it('palette e consigli del film si salvano, si rileggono e si sostituiscono', () => {
    store.saveText('film-1', undefined, { palette: [amber], notes: 'Luce calda.' });
    expect(store.get('film-1').film).toMatchObject({ palette: [amber], notes: 'Luce calda.' });

    store.saveText('film-1', undefined, { palette: [], notes: 'Solo parole.' });
    expect(store.get('film-1').film).toMatchObject({ palette: [], notes: 'Solo parole.' });
  });

  it("una parte vuota toglie la riga: palette e consigli tornano come all'inizio", () => {
    store.saveText('film-1', undefined, { palette: [amber], notes: 'x' });
    store.saveText('film-1', undefined, { palette: [], notes: '   ' });

    expect(store.get('film-1').film).toEqual({ palette: [], notes: '', references: [] });
    expect(store.changes('film-1')).toEqual({ scenes: {} });
  });

  it('ogni scena ha la sua parte, e le scene sono elencate in ordine', () => {
    store.saveText('film-1', 'scene-2', { palette: [amber], notes: 'Notte.' });
    store.saveText('film-1', 'scene-1', { palette: [], notes: 'Giorno.' });

    expect(store.get('film-1').scenes.map((scene) => [scene.sceneId, scene.notes])).toEqual([
      ['scene-1', 'Giorno.'],
      ['scene-2', 'Notte.'],
    ]);

    store.saveText('film-1', 'scene-2', { palette: [], notes: '' });
    expect(store.get('film-1').scenes.map((scene) => scene.sceneId)).toEqual(['scene-1']);
  });

  it("i riferimenti si aggiungono al film o a una scena, nell'ordine, e si tolgono uno alla volta", () => {
    const first = store.addReference('film-1', undefined, reference());
    later();
    const second = store.addReference(
      'film-1',
      'scene-1',
      reference({ assetId: 'b'.repeat(64), origin: 'generated', generationId: 'g-1' }),
    );
    later();
    store.addReference(
      'film-1',
      undefined,
      reference({ assetId: 'c'.repeat(64), analysisOnly: true }),
    );

    const board = store.get('film-1');
    expect(board.film.references.map((item) => item.assetId)).toEqual([
      'a'.repeat(64),
      'c'.repeat(64),
    ]);
    expect(board.film.references[1]?.analysisOnly).toBe(true);
    expect(board.scenes[0]?.references[0]).toMatchObject({
      origin: 'generated',
      generationId: 'g-1',
    });

    expect(store.removeReference('film-1', first.id)).toBe(true);
    expect(store.removeReference('film-1', first.id)).toBe(false);
    expect(store.findReference('film-1', second.id)?.sceneId).toBe('scene-1');
    expect(store.findReference('film-1', first.id)).toBeUndefined();
  });

  it('un riferimento si trova e si toglie solo dal suo film', () => {
    const mine = store.addReference('film-1', undefined, reference());

    expect(store.findReference('film-2', mine.id)).toBeUndefined();
    expect(store.removeReference('film-2', mine.id)).toBe(false);
    expect(store.get('film-1').film.references).toHaveLength(1);
  });

  it("di una scena con soli riferimenti c'è la parte, con palette e consigli vuoti", () => {
    store.addReference('film-1', 'scene-3', reference());

    expect(store.get('film-1').scenes).toEqual([
      { sceneId: 'scene-3', palette: [], notes: '', references: [reference()] },
    ]);
  });

  it("si ricorda quando palette e consigli sono cambiati (R9); aggiungere un'immagine non conta", () => {
    store.saveText('film-1', undefined, { palette: [amber], notes: 'a' });
    const first = clock.getTime();
    later();
    store.saveText('film-1', 'scene-1', { palette: [amber], notes: 'b' });
    later();
    store.addReference('film-1', undefined, reference());

    expect(store.changes('film-1')).toEqual({ film: first, scenes: { 'scene-1': first + 1000 } });
  });
});

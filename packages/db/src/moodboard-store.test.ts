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

describe('salvare senza cambiare niente', () => {
  const amber = { hex: '#c2813a', name: 'Ambra' };

  it('non è un cambiamento, per il film e per la scena: R9 non avvisa', () => {
    store.saveText('film-same', undefined, { palette: [amber], notes: 'Luce calda.' });
    store.saveText('film-same', 'scene-1', { palette: [amber], notes: 'Sera.' });
    const before = store.changes('film-same');

    clock = new Date(clock.getTime() + 60_000);
    // Stesso contenuto, anche con le chiavi in un altro ordine e spazi in più nei consigli.
    store.saveText('film-same', undefined, {
      palette: [{ name: 'Ambra', hex: '#c2813a' }],
      notes: ' Luce calda. ',
    });
    store.saveText('film-same', 'scene-1', { palette: [amber], notes: 'Sera.' });

    expect(store.changes('film-same')).toEqual(before);

    store.saveText('film-same', undefined, { palette: [amber], notes: 'Luce fredda.' });
    expect(store.changes('film-same').film).toBe(clock.getTime());
  });

  it('una parte vuota che non c’è mai stata non si crea: non c’è niente da ricordare', () => {
    store.saveText('film-vuoto', undefined, { palette: [], notes: '  ' });
    store.saveText('film-vuoto', 'scene-1', { palette: [], notes: '' });

    expect(store.changes('film-vuoto')).toEqual({ scenes: {} });
  });
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

  it('una parte svuotata torna come all’inizio, ma si ricorda che è cambiata (R9)', () => {
    store.saveText('film-1', undefined, { palette: [amber], notes: 'x' });
    store.saveText('film-1', 'scene-1', { palette: [amber], notes: 'y' });
    later();
    store.saveText('film-1', undefined, { palette: [], notes: '   ' });
    store.saveText('film-1', 'scene-1', { palette: [], notes: '' });

    expect(store.get('film-1').film).toEqual({ palette: [], notes: '', references: [] });
    expect(store.get('film-1').scenes).toEqual([]);
    expect(store.changes('film-1')).toEqual({
      film: clock.getTime(),
      scenes: { 'scene-1': clock.getTime() },
    });
  });

  it('all’avvio le richieste aperte si chiudono col motivo, e le immagini fatte restano contate', () => {
    const aperta = store.startRun('film-1', 'scene-1', 'Nano Banana');
    store.updateRun(aperta, { status: 'running', images: 2, costUsd: 0.1 });
    const finita = store.startRun('film-2', undefined, 'Nano Banana');
    store.updateRun(finita, { status: 'succeeded', images: 1 });

    store.closeOpenRuns('interrupted');

    expect(store.getRun(aperta)).toMatchObject({
      status: 'failed',
      errorCode: 'interrupted',
      images: 2,
    });
    expect(store.getRun(finita)?.status).toBe('succeeded');
  });

  it('una richiesta di immagini si rilegge per id', () => {
    const id = store.startRun('film-1', 'scene-1', 'Nano Banana');
    store.updateRun(id, { status: 'running', images: 2, costUsd: 0.1 });

    expect(store.getRun(id)).toMatchObject({
      id,
      sceneId: 'scene-1',
      status: 'running',
      images: 2,
      costUsd: 0.1,
      modelLabel: 'Nano Banana',
    });
    expect(store.getRun('non-c-e')).toBeUndefined();
    expect(store.latestRun('film-1')?.id).toBe(id);
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
      {
        sceneId: 'scene-3',
        palette: [],
        notes: '',
        references: [{ ...reference(), id: expect.any(String) as string }],
      },
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

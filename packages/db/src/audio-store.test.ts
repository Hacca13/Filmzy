import { beforeEach, describe, expect, it } from 'vitest';

import { createAudioStore, type AudioStore, type NewAudioClip } from './audio-store.js';
import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

const stable = { modelId: 'music-stable-audio-3', modelLabel: 'Stable Audio 3 · Musica' };

const music: NewAudioClip = {
  projectId: 'film-1',
  kind: 'music',
  sceneId: 'scene-1',
  durationS: 20,
  description: 'Un piano che accompagna la partenza.',
  mood: 'bittersweet',
  source: 'generated',
};

let opened: OpenedDatabase;
let store: AudioStore;
let clock: Date;

const tick = () => {
  clock = new Date(clock.getTime() + 1000);
};

beforeEach(async () => {
  clock = new Date('2026-11-04T10:00:00.000Z');
  opened = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createAudioStore(opened.db, { now: () => clock });
});

describe('le tracce di un film', () => {
  it('ce n’è una per tipo, e l’audio originale dei take parte muto', () => {
    expect(store.tracks('film-1').map(({ kind, muted }) => [kind, muted])).toEqual([
      ['native', true],
      ['dialogue', false],
      ['music', false],
      ['sfx', false],
    ]);
  });

  it('rileggerle non le raddoppia, e ogni film ha le sue', () => {
    const first = store.tracks('film-1');

    expect(store.tracks('film-1')).toEqual(first);
    expect(store.tracks('film-2').map((track) => track.id)).not.toEqual(
      first.map((track) => track.id),
    );
  });
});

describe('le clip', () => {
  it('una clip nasce sulla traccia del suo tipo, senza varianti', () => {
    const clip = store.createClip(music);
    const track = store.tracks('film-1').find((candidate) => candidate.kind === 'music');

    expect(clip).toMatchObject({
      trackId: track?.id,
      kind: 'music',
      sceneId: 'scene-1',
      startS: 0,
      durationS: 20,
      volume: 1,
      mood: 'bittersweet',
      source: 'generated',
      variants: [],
    });
    expect(clip.chosenVariantId).toBeUndefined();
  });

  it('un effetto ricorda l’inquadratura e il secondo di partenza', () => {
    const clip = store.createClip({
      ...music,
      kind: 'sfx',
      shotId: 's-1',
      startS: 1.5,
      durationS: 2,
    });

    expect(store.getClip(clip.id)).toEqual({
      projectId: 'film-1',
      clip: expect.objectContaining({ kind: 'sfx', shotId: 's-1', startS: 1.5 }) as unknown,
    });
  });

  it('le clip si leggono per film, nell’ordine in cui sono nate', () => {
    const first = store.createClip(music);
    tick();
    const second = store.createClip({ ...music, sceneId: 'scene-2' });
    store.createClip({ ...music, projectId: 'film-2' });

    expect(store.clips('film-1').map((clip) => clip.id)).toEqual([first.id, second.id]);
  });

  it('una clip che non c’è non si trova', () => {
    expect(store.getClip('inventata')).toBeUndefined();
    expect(store.getVariant('inventata')).toBeUndefined();
  });
});

describe('le varianti', () => {
  it('ogni richiesta è una variante in coda, dalla più recente', () => {
    const clip = store.createClip(music);
    const first = store.startVariant(clip.id, stable);
    tick();
    const second = store.startVariant(clip.id, stable);

    expect(store.getClip(clip.id)?.clip.variants.map((variant) => variant.id)).toEqual([
      second.id,
      first.id,
    ]);
    expect(first).toMatchObject({ status: 'queued', ...stable });
  });

  it('una variante riuscita porta il file, il costo e il servizio che ha lavorato', () => {
    const clip = store.createClip(music);
    const variant = store.startVariant(clip.id, stable);

    expect(
      store.finishVariant(variant.id, {
        status: 'succeeded',
        assetId: 'a-1',
        costUsd: 0.03,
        modelLabel: 'Un altro nome',
      }),
    ).toBe(true);

    expect(store.getVariant(variant.id)).toEqual({
      clipId: clip.id,
      variant: expect.objectContaining({
        status: 'succeeded',
        assetId: 'a-1',
        costUsd: 0.03,
        modelLabel: 'Un altro nome',
      }) as unknown,
    });
  });

  it('una variante fallita dice perché; una che non c’è più lo dice a chi la cerca', () => {
    const clip = store.createClip(music);
    const variant = store.startVariant(clip.id, stable);

    store.finishVariant(variant.id, { status: 'failed', errorCode: 'content_rejected' });

    expect(store.getVariant(variant.id)?.variant.errorCode).toBe('content_rejected');
    expect(store.finishVariant('inventata', { status: 'failed' })).toBe(false);
  });

  it('un file caricato ha una variante senza servizio', () => {
    const clip = store.createClip({ ...music, source: 'uploaded' });

    expect(store.startVariant(clip.id, {}).modelId).toBeUndefined();
  });

  it('si sceglie la variante in uso, e si può togliere la scelta', () => {
    const clip = store.createClip(music);
    const variant = store.startVariant(clip.id, stable);

    store.chooseVariant(clip.id, variant.id);
    expect(store.getClip(clip.id)?.clip.chosenVariantId).toBe(variant.id);

    store.chooseVariant(clip.id, undefined);
    expect(store.getClip(clip.id)?.clip.chosenVariantId).toBeUndefined();
  });

  it('togliere una clip toglie le sue varianti, e solo quelle', () => {
    const clip = store.createClip(music);
    const other = store.createClip({ ...music, sceneId: 'scene-2' });
    const gone = store.startVariant(clip.id, stable);
    const kept = store.startVariant(other.id, stable);

    store.removeClip(clip.id);

    expect(store.getClip(clip.id)).toBeUndefined();
    expect(store.getVariant(gone.id)).toBeUndefined();
    expect(store.getVariant(kept.id)?.clipId).toBe(other.id);
  });
});

import type { AudioClip, AudioTimeline, AudioVariant } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/client';
import type { SoundEditor } from '../../api/audio';
import {
  audioFileProblem,
  blockNote,
  blockState,
  clipIsWorking,
  describeAudioError,
  formatClock,
  formatSeconds,
  percentOf,
  rulerMarks,
  sceneName,
  scenesWithoutMusic,
  shotsForEffects,
  soundFailureText,
  soundIsWorking,
  stackRows,
  suggestionPlace,
  variantText,
} from './model';

const variant = (patch: Partial<AudioVariant> = {}): AudioVariant => ({
  id: 'v-1',
  status: 'succeeded',
  createdAt: '2026-11-05T10:00:00.000Z',
  ...patch,
});

const clip = (patch: Partial<AudioClip> = {}): AudioClip => ({
  id: 'c-1',
  trackId: 't-1',
  kind: 'music',
  sceneId: 'scene-1',
  startS: 0,
  durationS: 5,
  volume: 1,
  fadeInS: 0,
  fadeOutS: 0,
  description: 'Un piano',
  source: 'generated',
  variants: [],
  ...patch,
});

const timeline: AudioTimeline = {
  durationS: 12,
  scenes: [
    { sceneId: 'scene-1', sceneNumber: 1, heading: 'UNO', startS: 0, durationS: 7, stale: false },
    { sceneId: 'scene-2', sceneNumber: 2, heading: 'DUE', startS: 7, durationS: 5, stale: true },
  ],
  shots: [
    {
      shotId: 'a',
      sceneId: 'scene-1',
      startS: 0,
      durationS: 7,
      action: 'Anna apre la porta',
      nativeAudio: false,
    },
    {
      shotId: 'b',
      sceneId: 'scene-2',
      startS: 7,
      durationS: 5,
      action: 'Marco esce',
      nativeAudio: false,
    },
  ],
  placements: {},
};

describe('il tempo', () => {
  it('si legge come sul righello', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(86.4)).toBe('01:26');
    expect(formatSeconds(2)).toBe('2 s');
    expect(formatSeconds(1.5)).toBe('1,5 s');
  });

  it('il righello va dall’inizio alla fine, e un film vuoto non ne ha', () => {
    expect(rulerMarks(60)).toEqual([0, 10, 20, 30, 40, 50, 60]);
    expect(rulerMarks(0)).toEqual([]);
  });

  it('una posizione non esce mai dalla traccia', () => {
    expect(percentOf(30, 60)).toBe(50);
    expect(percentOf(90, 60)).toBe(100);
    expect(percentOf(5, 0)).toBe(0);
  });
});

describe('i blocchi di una traccia', () => {
  const block = (id: string, startS: number, durationS: number) => ({ id, startS, durationS });

  it('uno dopo l’altro stanno sulla stessa riga', () => {
    expect(stackRows([block('a', 0, 2), block('b', 2, 2)])).toEqual({
      rows: { a: 0, b: 0 },
      count: 1,
    });
  });

  it('nello stesso momento stanno uno sotto l’altro, e nessuno copre l’altro', () => {
    expect(
      stackRows([block('a', 0, 2), block('b', 0, 2), block('c', 1, 1), block('d', 2, 1)]),
    ).toEqual({
      rows: { a: 0, b: 1, c: 2, d: 0 },
      count: 3,
    });
  });

  it('una traccia vuota non ha righe', () => {
    expect(stackRows([])).toEqual({ rows: {}, count: 0 });
  });
});

describe('lo stato di un blocco', () => {
  it('senza suoni è da generare', () => {
    expect(blockState(clip())).toBe('empty');
    expect(blockNote(clip())).toBe('Da generare');
  });

  it('con un lavoro aperto è in lavorazione, anche se ne ha già uno in uso', () => {
    const working = clip({
      chosenVariantId: 'v-1',
      variants: [variant({ id: 'v-2', status: 'running' }), variant()],
    });

    expect(blockState(working)).toBe('working');
    expect(clipIsWorking(working)).toBe(true);
  });

  it('con una variante in uso è pronto, anche se l’ultima è fallita', () => {
    const ready = clip({
      chosenVariantId: 'v-1',
      variants: [variant({ id: 'v-2', status: 'failed' }), variant()],
    });

    expect(blockState(ready)).toBe('ready');
    expect(blockNote(ready)).toBeUndefined();
  });

  it('se l’ultima è fallita e non ce n’è una in uso, lo dice', () => {
    expect(blockState(clip({ variants: [variant({ status: 'failed' })] }))).toBe('failed');
  });

  it('il film lavora finché un suono lavora', () => {
    const editor = (clips: AudioClip[]): SoundEditor => ({ tracks: [], clips, timeline });

    expect(soundIsWorking(editor([clip({ variants: [variant({ status: 'queued' })] })]))).toBe(
      true,
    );
    expect(soundIsWorking(editor([clip({ variants: [variant()] })]))).toBe(false);
  });
});

describe('cosa si scrive di una variante', () => {
  it('dice chi l’ha fatta e quanto è costata; un file caricato è dell’utente', () => {
    expect(variantText(variant({ modelLabel: 'Stable Audio', costUsd: 0.5 }))).toBe(
      'Fatto con Stable Audio · costato 0,50 $',
    );
    expect(variantText(variant({ modelLabel: 'Stable Audio' }))).toBe('Fatto con Stable Audio');
    expect(variantText(variant())).toBe('Il tuo file');
  });

  it('un rifiuto chiede di cambiare descrizione, gli altri errori restano quelli di sempre', () => {
    expect(soundFailureText('content_rejected')).toContain('prova a descriverlo');
    expect(variantText(variant({ status: 'failed', errorCode: 'timeout' }))).toContain(
      'ci ha messo troppo',
    );
  });
});

describe('un file audio', () => {
  it('si manda solo se è di un tipo che va, non vuoto e non troppo grande', () => {
    expect(audioFileProblem({ type: 'audio/mpeg', size: 10 })).toBeUndefined();
    expect(audioFileProblem({ type: 'image/png', size: 10 })).toContain('WAV');
    expect(audioFileProblem({ type: 'audio/wav', size: 0 })).toContain('vuoto');
    expect(audioFileProblem({ type: 'audio/wav', size: 200 * 1024 * 1024 })).toContain('grande');
  });

  it('un file che non si legge non parla di video', () => {
    const error = new ApiError('http_error', { serverCode: 'media_failed' });

    expect(describeAudioError(error)).toContain('questo file');
    expect(describeAudioError(new Error('x'))).toContain('Qualcosa è andato storto');
  });
});

describe('dove può andare un suono', () => {
  it('una musica per scena: una scena che l’ha già non si propone', () => {
    expect(scenesWithoutMusic(timeline, [clip()]).map(({ sceneId }) => sceneId)).toEqual([
      'scene-2',
    ]);
  });

  it('un effetto non va su una scena da rifare', () => {
    expect(shotsForEffects(timeline).map(({ shotId }) => shotId)).toEqual(['a']);
  });

  it('una proposta dice dove andrebbe', () => {
    const base = { durationS: 2, description: 'x' };

    expect(suggestionPlace(timeline, { ...base, kind: 'music', sceneId: 'scene-2' })).toBe(
      'Musica · Scena 2',
    );
    expect(
      suggestionPlace(timeline, { ...base, kind: 'sfx', sceneId: 'scene-1', shotId: 'a' }),
    ).toBe('Effetto · Scena 1 · Anna apre la porta');
    expect(sceneName(timeline, 'scene-9')).toBe('Scena che non c’è più');
  });
});

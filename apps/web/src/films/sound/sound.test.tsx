import type { AudioClip, AudioTimeline } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { SoundEditor } from '../../api/audio';
import { VariantList } from './ClipPanel';
import { SoundLanes } from './SoundLanes';

const timeline: AudioTimeline = {
  durationS: 10,
  scenes: [
    { sceneId: 'scene-1', sceneNumber: 1, heading: 'UNO', startS: 0, durationS: 10, stale: false },
  ],
  shots: [
    {
      shotId: 'a',
      sceneId: 'scene-1',
      startS: 0,
      durationS: 5,
      action: 'Anna apre la porta',
      takeId: 't-1',
      assetId: 'clip-1',
      nativeAudio: false,
    },
    {
      shotId: 'b',
      sceneId: 'scene-1',
      startS: 5,
      durationS: 5,
      action: 'Marco esce',
      nativeAudio: false,
    },
  ],
  placements: { 'c-1': { startS: 5, durationS: 5 } },
};

const clip: AudioClip = {
  id: 'c-1',
  trackId: 'music',
  kind: 'music',
  sceneId: 'scene-1',
  startS: 0,
  durationS: 5,
  volume: 1,
  fadeInS: 0,
  fadeOutS: 0,
  description: 'Un piano che accompagna',
  source: 'generated',
  variants: [],
};

const editor = (patch: Partial<SoundEditor> = {}): SoundEditor => ({
  tracks: [
    { id: 'native', kind: 'native', muted: true, volume: 1 },
    { id: 'dialogue', kind: 'dialogue', muted: false, volume: 1 },
    { id: 'music', kind: 'music', muted: false, volume: 0.5 },
    { id: 'sfx', kind: 'sfx', muted: false, volume: 1 },
  ],
  clips: [clip],
  timeline,
  ...patch,
});

const lanes = (value: SoundEditor = editor()) =>
  renderToStaticMarkup(
    <SoundLanes
      editor={value}
      selectedId={undefined}
      busy={false}
      onSelect={() => undefined}
      onAdd={() => undefined}
      onTrackChange={() => undefined}
      onNativeAudio={() => undefined}
    />,
  );

describe('le tracce', () => {
  it('sono quattro, ognuna con muto e volume', () => {
    const html = lanes();

    for (const name of ['Video', 'Dialoghi', 'Musica', 'Effetti']) {
      expect(html).toContain(`aria-label="${name}"`);
      expect(html).toContain(`aria-label="Volume di ${name}"`);
    }
  });

  it('un blocco sta dove dice il server, in percentuale del film', () => {
    const html = lanes();

    expect(html).toContain('left:50%;width:50%');
    expect(html).toContain('Un piano che accompagna');
    expect(html).toContain('Da generare');
  });

  it('una clip girata ha l’audio originale spento; una da girare non ha l’icona', () => {
    const html = lanes();

    expect(html).toContain('Audio originale spento');
    expect(html.match(/sound-speaker/g)).toHaveLength(1);
    expect(html).toContain('Da girare');
  });

  it('due suoni nello stesso momento stanno uno sotto l’altro', () => {
    const second = { ...clip, id: 'c-2', description: 'Una seconda musica' };
    const html = lanes(
      editor({
        clips: [clip, second],
        timeline: {
          ...timeline,
          placements: {
            'c-1': { startS: 5, durationS: 5 },
            'c-2': { startS: 5, durationS: 5 },
          },
        },
      }),
    );

    expect(html).toContain('top:8px');
    expect(html).toContain('top:72px');
    expect(html).toContain('min-height:144px');
  });

  it('una traccia vuota dice cosa ci va', () => {
    const html = lanes(editor({ clips: [] }));

    expect(html).toContain('Nessun effetto: aggiungi il primo');
    expect(html).toContain('Nessuna musica: aggiungi la prima');
    expect(html).toContain('Per ora i personaggi non parlano');
    expect(html).toContain('Carica una registrazione');
  });

  it('una clip che ha perso il suo posto non sta sulla traccia', () => {
    const lost = { ...clip, id: 'perso', description: 'Un suono perso' };

    expect(lanes(editor({ clips: [lost] }))).not.toContain('Un suono perso');
  });

  it('nelle schermate normali non compaiono parole tecniche', () => {
    expect(lanes().toLowerCase()).not.toMatch(/prompt|modello|token|temperatura/);
  });
});

describe('le varianti', () => {
  const list = (value: AudioClip) =>
    renderToStaticMarkup(<VariantList clip={value} busy={false} onChoose={() => undefined} />);

  it('senza varianti non si mostra niente', () => {
    expect(list(clip)).toBe('');
  });

  it('dalla più recente, con quella in uso segnata e un pulsante per scegliere le altre', () => {
    const html = list({
      ...clip,
      chosenVariantId: 'v-1',
      variants: [
        { id: 'v-2', status: 'succeeded', assetId: 'a-2', modelLabel: 'B', createdAt: 'x' },
        { id: 'v-1', status: 'succeeded', assetId: 'a-1', createdAt: 'x' },
      ],
    });

    expect(html.indexOf('Variante 2')).toBeLessThan(html.indexOf('Variante 1'));
    expect(html).toContain('In uso');
    expect(html.match(/Scegli/g)).toHaveLength(1);
    expect(html).toContain('Il tuo file');
    expect(html.match(/<audio/g)).toHaveLength(2);
  });

  it('una in lavorazione lo dice e non si può ascoltare', () => {
    const html = list({
      ...clip,
      variants: [{ id: 'v-1', status: 'running', createdAt: 'x' }],
    });

    expect(html).toContain('Stiamo preparando il tuo suono');
    expect(html).not.toContain('<audio');
  });
});

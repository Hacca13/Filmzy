import type { ImageCandidate, ShotImage } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShotImagesSection } from './ShotImagesSection';
import { hasFirstFrame, reassign, uniqueCandidates, useOf, videoNotice } from './images-model';

const image = (use: ShotImage['use'], assetId: string): ShotImage => ({
  use,
  from: 'generate',
  assetId,
});

describe('useOf', () => {
  it('dice che ruolo ha un’immagine, o niente', () => {
    const images = [image('first_frame', 'a'), image('reference', 'b')];

    expect(useOf(images, 'a')).toBe('first_frame');
    expect(useOf(images, 'b')).toBe('reference');
    expect(useOf(images, 'c')).toBeUndefined();
  });
});

describe('reassign', () => {
  it('un’immagine nuova si aggiunge a quelle che c’erano', () => {
    expect(reassign([image('first_frame', 'a')], 'b', 'last_frame')).toEqual([
      { use: 'first_frame', assetId: 'a' },
      { use: 'last_frame', assetId: 'b' },
    ]);
  });

  it('cambiare il ruolo di un’immagine le toglie quello di prima', () => {
    expect(
      reassign([image('first_frame', 'a'), image('reference', 'b')], 'a', 'reference'),
    ).toEqual([
      { use: 'reference', assetId: 'b' },
      { use: 'reference', assetId: 'a' },
    ]);
  });

  it('il primo e l’ultimo fotogramma sono uno solo: chi lo aveva lo lascia', () => {
    expect(
      reassign([image('first_frame', 'a'), image('last_frame', 'z')], 'b', 'first_frame'),
    ).toEqual([
      { use: 'last_frame', assetId: 'z' },
      { use: 'first_frame', assetId: 'b' },
    ]);
  });

  it('più immagini di ispirazione possono stare insieme', () => {
    expect(reassign([image('reference', 'a')], 'b', 'reference')).toEqual([
      { use: 'reference', assetId: 'a' },
      { use: 'reference', assetId: 'b' },
    ]);
  });

  it('«Non la uso» toglie l’immagine e lascia le altre', () => {
    expect(reassign([image('first_frame', 'a'), image('reference', 'b')], 'a', undefined)).toEqual([
      { use: 'reference', assetId: 'b' },
    ]);
    expect(reassign([], 'a', undefined)).toEqual([]);
  });
});

describe('uniqueCandidates', () => {
  it('offre un file una volta sola, anche se due tentativi hanno dato lo stesso', () => {
    const candidates: ImageCandidate[] = [
      { assetId: 'a', mode: 'storyboard', attempt: 1 },
      { assetId: 'a', mode: 'end_frame', attempt: 1 },
      { assetId: 'b', mode: 'storyboard', attempt: 2 },
    ];

    expect(uniqueCandidates(candidates).map((candidate) => candidate.assetId)).toEqual(['a', 'b']);
  });
});

describe('videoNotice e hasFirstFrame', () => {
  it('si avvisa solo quando nessun servizio video accetta la combinazione, e non si cambia da soli', () => {
    expect(videoNotice(0)).toContain('Nessun servizio video attivato');
    expect(videoNotice(0)).toContain('non passo da solo');
    expect(videoNotice(1)).toBeUndefined();
    expect(videoNotice(3)).toBeUndefined();
  });

  it('l’ultimo fotogramma si offre solo se c’è il primo', () => {
    expect(hasFirstFrame([image('first_frame', 'a')])).toBe(true);
    expect(hasFirstFrame([image('reference', 'a'), image('last_frame', 'b')])).toBe(false);
    expect(hasFirstFrame([])).toBe(false);
  });
});

describe('ShotImagesSection', () => {
  it('mentre legge mostra il titolo e la spiegazione, e dice che è facoltativo', () => {
    const html = renderToStaticMarkup(
      <ShotImagesSection filmId="f" shotId="s-1" refreshKey={0} onChanged={() => undefined} />,
    );

    expect(html).toContain('Imposta le immagini');
    expect(html).toContain('Facoltativo');
    expect(html).toContain('decide l&#x27;aiuto regista');
  });
});

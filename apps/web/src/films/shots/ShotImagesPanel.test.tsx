import { SHOT_SPEC_SCHEMA_VERSION, type ShotSpec } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShotImagesPanel } from './ShotImagesPanel';

const entry = {
  locationId: 'l-piazza',
  timeOfDay: 'sera',
  present: [],
  costumes: {},
  props: [],
};

const shot = (images: ShotSpec['images']): ShotSpec => ({
  schema: SHOT_SPEC_SCHEMA_VERSION,
  id: 's-1',
  sceneId: 'scene-1',
  order: 0,
  intent: {
    action: 'Anna guarda l’orologio',
    emotion: 'ansiosa',
    framing: 'close_up',
    cameraMovement: 'push_in',
    lighting: 'luce calda',
    durationS: 5,
  },
  characters: [],
  location: { locationId: 'l-piazza', references: [] },
  images,
  dialogue: [],
  cinematography: 'inherit',
  continuity: { entry, exit: entry },
});

const render = (images: ShotSpec['images'] = []) =>
  renderToStaticMarkup(
    <ShotImagesPanel
      filmId="f"
      shot={shot(images)}
      onChanged={() => undefined}
      onClose={() => undefined}
    />,
  );

describe('ShotImagesPanel', () => {
  it('ha il titolo dell’inquadratura e un pulsante per chiudere', () => {
    const html = render();

    expect(html).toContain('Inquadratura 1 · storyboard, immagini e video');
    expect(html).toMatch(/<button[^>]*aria-label="Chiudi"/);
  });

  it('senza il primo fotogramma non c’è la sezione dell’ultimo; con il primo sì', () => {
    expect(render()).not.toContain('Ultimo fotogramma');

    const withFirst = render([{ use: 'first_frame', from: 'generate', assetId: 'a' }]);
    expect(withFirst).toContain('aria-label="Ultimo fotogramma"');
  });

  it('le sezioni sono impilate nell’ordine del disegno: storyboard, immagini, video', () => {
    const html = render([{ use: 'first_frame', from: 'generate', assetId: 'a' }]);
    const order = [
      'aria-label="Storyboard"',
      'aria-label="Imposta le immagini"',
      'aria-label="Ultimo fotogramma"',
      'aria-label="Video"',
    ].map((label) => html.indexOf(label));

    expect(order.every((position) => position >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

import {
  SHOT_SPEC_SCHEMA_VERSION,
  type ContinuityState,
  type ScenePlan,
  type ShotSpec,
} from '@filmzy/contracts';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShotCard } from './ShotCard';
import { continuityLine, humanize, sceneStatus, type Names } from './model';

const names: Names = {
  characters: [
    { id: 'c-anna', name: 'Anna' },
    { id: 'c-marco', name: 'Marco' },
  ],
  locations: [{ id: 'l-piazza', name: 'La piazza' }],
};

const entry: ContinuityState = {
  locationId: 'l-piazza',
  timeOfDay: 'sera',
  present: ['c-anna', 'c-marco'],
  costumes: {},
  props: [],
};

const shot: ShotSpec = {
  schema: SHOT_SPEC_SCHEMA_VERSION,
  id: 's-1',
  sceneId: 'scene-1',
  order: 0,
  intent: {
    action: 'Anna guarda l’orologio della stazione',
    emotion: 'ansiosa',
    framing: 'close_up',
    cameraMovement: 'push_in',
    lighting: 'luce calda del tramonto',
    durationS: 5.4,
  },
  characters: [{ characterId: 'c-anna', costume: 'giacca', references: [] }],
  location: { locationId: 'l-piazza', references: [] },
  images: [],
  dialogue: [],
  cinematography: 'inherit',
  continuity: { entry, exit: { ...entry, present: ['c-anna'] } },
};

const scene = (patch: Partial<ScenePlan> = {}): ScenePlan => ({
  sceneNumber: 1,
  heading: 'EST. PIAZZA - SERA',
  summary: 'Anna aspetta.',
  durationS: 20,
  planned: true,
  stale: false,
  shots: [shot],
  chosenStoryboards: {},
  latestTakes: {},
  ...patch,
});

describe('i nomi', () => {
  it('un id si legge come un nome: senza trattini bassi e con la maiuscola', () => {
    expect(humanize('close_up')).toBe('Close up');
    expect(humanize('push-in')).toBe('Push in');
    expect(humanize('')).toBe('');
  });
});

describe('sceneStatus', () => {
  it('dice se la scena è da pensare, da rifare o quante inquadrature ha', () => {
    expect(sceneStatus(scene({ planned: false, shots: [] }))).toBe('Da pensare');
    expect(sceneStatus(scene({ stale: true }))).toBe('Da rifare: è cambiato qualcosa');
    expect(sceneStatus(scene())).toBe('1 inquadratura');
    expect(sceneStatus(scene({ shots: [shot, shot, shot] }))).toBe('3 inquadrature');
  });
});

describe('continuityLine', () => {
  it('dice dove, quando e chi, con i nomi del film', () => {
    expect(continuityLine(entry, names)).toBe('La piazza · sera · con Anna, Marco');
  });

  it('salta ciò che non si riconosce o non c’è', () => {
    expect(continuityLine({ ...entry, locationId: 'altrove', present: [] }, names)).toBe('sera');
  });
});

describe('ShotCard', () => {
  const movements = [
    { id: 'static', label: 'Resta fermo' },
    { id: 'push_in', label: 'Avvicinati' },
  ];
  const render = (
    given: ShotSpec = shot,
    busy = false,
    storyboard: Partial<ComponentProps<typeof ShotCard>> = {},
  ) =>
    renderToStaticMarkup(
      <ShotCard
        shot={given}
        movements={movements}
        names={names}
        busy={busy}
        onMovement={() => undefined}
        storyboardOpen={false}
        canStoryboard
        onStoryboard={() => undefined}
        {...storyboard}
      />,
    );

  it('mostra cosa succede, il piano, la durata, la luce e come entra ed esce', () => {
    const html = render();

    expect(html).toContain('Inquadratura 1');
    expect(html).toContain('Anna guarda l’orologio della stazione');
    expect(html).toContain('Close up');
    expect(html).toContain('5 s');
    expect(html).toContain('Luce: luce calda del tramonto');
    expect(html).toContain('Entra');
    expect(html).toContain('La piazza · sera · con Anna, Marco');
    expect(html).toContain('Esce');
    expect(html).toContain('La piazza · sera · con Anna');
  });

  it('il movimento si sceglie dalla lista, con quello attuale selezionato', () => {
    const html = render();

    expect(html).toContain('Resta fermo');
    expect(html).toContain('Avvicinati');
    expect(html).toMatch(/<option value="push_in" selected/);
  });

  it('un movimento che non è più tra gli attivi resta visibile, senza cambiare da solo', () => {
    const html = render({ ...shot, intent: { ...shot.intent, cameraMovement: 'volo_acrobatico' } });

    expect(html).toContain('Volo acrobatico');
    expect(html).toMatch(/<option value="volo_acrobatico" selected/);
  });

  it('mentre si salva il menu è bloccato', () => {
    expect(render(shot, true)).toMatch(/<select[^>]*disabled/);
  });

  it('senza storyboard scelto non c’è nessuna immagine, e si offre «Storyboard»', () => {
    const html = render();

    expect(html).not.toContain('<img');
    expect(html).toContain('>Storyboard<');
    expect(html).toContain('aria-pressed="false"');
  });

  it('la variante scelta è il riferimento visivo della card, e si può cambiare', () => {
    const html = render(shot, false, { storyboardAssetId: 'img-1', storyboardOpen: true });

    expect(html).toContain('src="/api/assets/img-1"');
    expect(html).toContain('alt="Storyboard dell&#x27;inquadratura 1"');
    expect(html).toContain('Cambia lo storyboard');
    expect(html).toContain('aria-pressed="true"');
  });

  it('con un video la card fa vedere la clip al posto dello storyboard', () => {
    const html = render(shot, false, { storyboardAssetId: 'img-1', clipAssetId: 'clip-1' });

    expect(html).toContain('<video');
    expect(html).toContain('src="/api/assets/clip-1"');
    expect(html).toContain('aria-label="Video dell&#x27;inquadratura 1"');
    expect(html).not.toContain('<img');
  });

  it('se il piano è da rifare lo storyboard non si offre, ma la variante già scelta si vede', () => {
    const html = render(shot, false, { canStoryboard: false, storyboardAssetId: 'img-1' });

    expect(html).not.toContain('<button');
    expect(html).toContain('src="/api/assets/img-1"');
  });
});

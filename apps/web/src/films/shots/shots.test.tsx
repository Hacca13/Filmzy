import {
  SHOT_SPEC_SCHEMA_VERSION,
  type ContinuityFlag,
  type ContinuityState,
  type ScenePlan,
  type ShotSpec,
} from '@filmzy/contracts';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FlagNote } from './FlagNote';
import { ShotCard } from './ShotCard';
import { continuityLine, humanize, sceneChip, sceneStatus, type Names } from './model';

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
  clips: {},
  flags: {},
  sceneFlags: [],
  hasWork: false,
  working: {},
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

describe('sceneChip', () => {
  it('è confermato con le inquadrature, da controllare se la scena è da pensare o da rifare', () => {
    expect(sceneChip(scene())).toEqual({ label: '1 inquadratura', tone: 'confirmed' });
    expect(sceneChip(scene({ planned: false, shots: [] }))).toEqual({
      label: 'Da pensare',
      tone: 'warning',
    });
    expect(sceneChip(scene({ stale: true }))).toEqual({
      label: 'Da rifare: è cambiato qualcosa',
      tone: 'warning',
    });
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

describe('FlagNote', () => {
  const flag = (patch: Partial<ContinuityFlag> = {}): ContinuityFlag => ({
    code: 'R7',
    key: 'k',
    reason: 'La scena nomina un personaggio tolto.',
    origin: 'rule',
    light: false,
    fix: 'none',
    ignored: false,
    ...patch,
  });

  it('un giallo vero dice «Da rivedere», uno leggero «Avviso leggero», sempre con il motivo', () => {
    const strong = renderToStaticMarkup(<FlagNote flag={flag()} />);
    const light = renderToStaticMarkup(<FlagNote flag={flag({ light: true })} />);

    expect(strong).toContain('Da rivedere');
    expect(strong).toContain('La scena nomina un personaggio tolto.');
    expect(light).toContain('Avviso leggero');
    expect(light).not.toContain('Da rivedere');
  });

  it('si può ignorare e rifare; ignorato resta da leggere e si può rimettere (T5.3)', () => {
    const open = renderToStaticMarkup(
      <FlagNote
        flag={flag()}
        fix={{ label: 'Rigenera', run: () => undefined }}
        onIgnored={() => undefined}
      />,
    );
    const ignored = renderToStaticMarkup(
      <FlagNote
        flag={flag({ ignored: true })}
        fix={{ label: 'Rigenera', run: () => undefined }}
        onIgnored={() => undefined}
      />,
    );

    expect(open).toContain('Rigenera');
    expect(open).toContain('Ignora');
    expect(ignored).toContain('Ignorato');
    expect(ignored).toContain('La scena nomina un personaggio tolto.');
    expect(ignored).toContain('Rimetti');
    expect(ignored).not.toContain('Rigenera');
    expect(ignored).not.toContain('Da rivedere');
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

  it('un’inquadratura con un giallo lo dice con il motivo; senza gialli non c’è niente (T4.9, R6)', () => {
    const flagged = render(shot, false, {
      flags: [
        {
          code: 'R6',
          reason: 'Il luogo è cambiato. Rifai lo storyboard.',
          origin: 'rule',
          light: false,
          key: 'k',
          fix: 'regenerate',
          ignored: false,
        },
      ],
    });

    expect(flagged).toContain('Da rivedere');
    expect(flagged).toContain('Il luogo è cambiato. Rifai lo storyboard.');
    expect(render()).not.toContain('Da rivedere');
    const light = render(shot, false, {
      flags: [
        {
          code: 'R9',
          reason: 'Il moodboard è cambiato. Rigiralo.',
          origin: 'rule',
          light: true,
          key: 'k',
          fix: 'regenerate',
          ignored: false,
        },
      ],
    });
    expect(light).toContain('Avviso leggero');
    expect(light).toContain('Il moodboard è cambiato. Rigiralo.');
    expect(light).not.toContain('Da rivedere');
    expect(render(shot, false, { flags: [] })).not.toContain('Da rivedere');
  });

  it('il pulsante del giallo lo decide il server: rigenera, ripensa la scena o niente (T5.3)', () => {
    const withFix = (fix: ContinuityFlag['fix'], canStoryboard = true) =>
      render(shot, false, {
        canStoryboard,
        replanLabel: 'Rifai le inquadrature · circa 0,03 $',
        onOpen: () => undefined,
        onReplan: () => undefined,
        onFlagIgnored: () => undefined,
        flags: [
          {
            code: 'R1',
            key: 'k',
            reason: 'Non combacia.',
            origin: 'rule',
            light: false,
            fix,
            ignored: false,
          },
        ],
      });

    expect(withFix('regenerate')).toContain('>Rigenera<');
    expect(withFix('replan')).toContain('Rifai le inquadrature · circa 0,03 $');
    expect(withFix('none')).not.toContain('>Rigenera<');
    expect(withFix('none')).toContain('>Ignora<');
    // Con il piano da rifare il lavoro dell'inquadratura non si offre.
    expect(withFix('regenerate', false)).not.toContain('>Rigenera<');
  });

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

  it('mentre c’è un lavoro per l’inquadratura la card lo dice, e finito lo dice più (T4.4)', () => {
    expect(render(shot, false, { working: 'video' })).toContain('Sto girando il video…');
    expect(render(shot, false, { working: 'storyboard' })).toContain(
      'Sto disegnando lo storyboard…',
    );
    expect(render(shot, false, { working: 'end_frame' })).toContain(
      'Sto disegnando l&#x27;ultimo fotogramma…',
    );
    expect(render(shot, false, { working: undefined })).not.toContain('Sto ');
  });

  it('se il piano è da rifare lo storyboard non si offre, ma la variante già scelta si vede', () => {
    const html = render(shot, false, { canStoryboard: false, storyboardAssetId: 'img-1' });

    expect(html).not.toContain('<button');
    expect(html).toContain('src="/api/assets/img-1"');
  });
});

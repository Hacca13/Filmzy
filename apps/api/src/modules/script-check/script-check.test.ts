import {
  ROLE_INPUT_EXAMPLES,
  cinematographerInputSchema,
  type ScenePlan,
  type ScriptSupervisorIssue,
  type ShotSpec,
} from '@filmzy/contracts';
import type { StoredScriptCheck } from '@filmzy/db';
import { describe, expect, it } from 'vitest';

import {
  MAX_ISSUES,
  addScriptFlags,
  checkState,
  fingerprintOf,
  issuesView,
  placesOf,
  settleIssues,
  usableScenes,
} from './script-check.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;
const shot = (id: string, sceneNumber: number, order = 0): ShotSpec => ({
  ...example,
  id,
  order,
  sceneId: `scene-${String(sceneNumber)}`,
});

const scene = (
  sceneNumber: number,
  shots: ShotSpec[],
  patch: Partial<ScenePlan> = {},
): ScenePlan => ({
  sceneNumber,
  heading: `SCENA ${String(sceneNumber)}`,
  summary: 'Qualcosa succede.',
  durationS: 20,
  planned: shots.length > 0,
  stale: false,
  shots,
  chosenStoryboards: {},
  clips: {},
  working: {},
  flags: {},
  sceneFlags: [],
  ...patch,
});

const scenes = [
  scene(1, [shot('a1', 1, 0), shot('a2', 1, 1)]),
  scene(2, [shot('b1', 2)]),
  scene(3, []),
];

const issue = (patch: Partial<ScriptSupervisorIssue>): ScriptSupervisorIssue => ({
  code: 'plot',
  severity: 'warning',
  reason: 'Qualcosa non torna.',
  ...patch,
});

describe('quali scene legge la segretaria', () => {
  it('solo quelle pensate il cui piano vale ancora', () => {
    const old = scene(4, [shot('d1', 4)], { stale: true });

    expect(usableScenes([...scenes, old]).map((item) => item.sceneNumber)).toEqual([1, 2]);
  });

  it('il riassunto cambia se cambiano la stesura o le inquadrature, non l’ordine delle scene', () => {
    const same = fingerprintOf('stesura-1', scenes);

    expect(fingerprintOf('stesura-1', [...scenes].reverse())).toBe(same);
    expect(fingerprintOf('stesura-2', scenes)).not.toBe(same);
    expect(
      fingerprintOf('stesura-1', [scene(1, [shot('nuovo', 1)]), scenes[1] as ScenePlan]),
    ).not.toBe(same);
    // Cambia ciò che la segretaria legge (l'azione) o no (il movimento di macchina).
    const acted = (patch: Partial<ShotSpec['intent']>): ScenePlan[] => [
      scene(1, [
        { ...shot('a1', 1, 0), intent: { ...example.intent, ...patch } },
        shot('a2', 1, 1),
      ]),
      scenes[1] as ScenePlan,
    ];
    expect(fingerprintOf('stesura-1', acted({ action: 'Un’altra azione.' }))).not.toBe(same);
    expect(fingerprintOf('stesura-1', acted({ cameraMovement: 'push_in' }))).toBe(same);
    expect(fingerprintOf('stesura-1', acted({}))).toBe(
      fingerprintOf('stesura-1', acted({ cameraMovement: example.intent.cameraMovement })),
    );
    // Una scena da rifare non conta: il controllo non l'ha letta.
    expect(
      fingerprintOf('stesura-1', [...scenes, scene(4, [shot('d1', 4)], { stale: true })]),
    ).toBe(same);
  });
});

describe('cosa si tiene di ciò che risponde', () => {
  const known = placesOf(scenes);

  it('un’inquadratura porta la sua scena; il peso diventa quello del giallo', () => {
    const [kept] = settleIssues(
      [issue({ shotId: 'b1', sceneId: 'scene-1', severity: 'notice', reason: '  Un dubbio.  ' })],
      known,
    );

    expect(kept).toEqual({
      code: 'plot',
      light: true,
      reason: 'Un dubbio.',
      sceneId: 'scene-2',
      shotId: 'b1',
    });
  });

  it('gli id inventati non valgono: l’inquadratura cade sulla scena, la scena sul film', () => {
    const settled = settleIssues(
      [
        issue({ shotId: 'inventata', sceneId: 'scene-1', reason: 'Uno.' }),
        issue({ shotId: 'inventata', sceneId: 'scene-9', reason: 'Due.' }),
        issue({ sceneId: 'scene-3', reason: 'Tre.' }),
        issue({ reason: 'Quattro.' }),
      ],
      known,
    );

    expect(settled[0]).toMatchObject({ sceneId: 'scene-1' });
    expect(settled[0]).not.toHaveProperty('shotId');
    expect(settled[1]).not.toHaveProperty('sceneId');
    expect(settled[1]).not.toHaveProperty('shotId');
    // La scena 3 non ha inquadrature pensate, ma la segretaria l'ha letta: l'id vale.
    expect(settled[2]).toMatchObject({ sceneId: 'scene-3' });
    expect(settled[3]).not.toHaveProperty('sceneId');
  });

  it('un motivo vuoto non dice niente e la stessa segnalazione due volte conta una volta', () => {
    const settled = settleIssues(
      [
        issue({ reason: '   ' }),
        issue({ sceneId: 'scene-1', reason: 'Uguale.' }),
        issue({ sceneId: 'scene-1', reason: ' Uguale. ' }),
        issue({ sceneId: 'scene-2', reason: 'Uguale.' }),
      ],
      known,
    );

    expect(settled.map((item) => [item.sceneId, item.reason])).toEqual([
      ['scene-1', 'Uguale.'],
      ['scene-2', 'Uguale.'],
    ]);
  });

  it('un modello che esagera si ferma al massimo', () => {
    const many = Array.from({ length: MAX_ISSUES + 5 }, (_, index) =>
      issue({ reason: `Problema ${String(index)}.` }),
    );

    expect(settleIssues(many, known)).toHaveLength(MAX_ISSUES);
  });
});

describe('le segnalazioni diventano gialli', () => {
  const stored = (fingerprint: string): StoredScriptCheck => ({
    id: 'controllo-1',
    projectId: 'film-1',
    fingerprint,
    generationId: 'scontrino-1',
    createdAt: '2026-11-04T10:00:00.000Z',
    issues: [
      {
        id: 'i1',
        sceneId: 'scene-1',
        shotId: 'a2',
        code: 'costume',
        light: false,
        reason: 'Giacca.',
      },
      { id: 'i2', sceneId: 'scene-2', code: 'plot', light: true, reason: 'Lettera.' },
      { id: 'i3', code: 'time_place', light: false, reason: 'Del film.' },
    ],
  });
  const current = stored(fingerprintOf('stesura-1', scenes));

  it('sull’inquadratura se c’è, sulla scena altrimenti; quelle del film restano nell’elenco', () => {
    const [first, second] = addScriptFlags(scenes, current, 'stesura-1');

    expect(first?.flags['a2']).toEqual([
      { code: 'costume', reason: 'Giacca.', origin: 'llm', light: false },
    ]);
    expect(first?.sceneFlags).toEqual([]);
    expect(second?.sceneFlags).toEqual([
      { code: 'plot', reason: 'Lettera.', origin: 'llm', light: true },
    ]);
  });

  it('un controllo vecchio, o nessun controllo, non ingiallisce niente', () => {
    expect(addScriptFlags(scenes, current, 'stesura-2')).toEqual(scenes);
    expect(addScriptFlags(scenes, undefined, 'stesura-1')).toEqual(scenes);
    expect(checkState(current, 'stesura-1', scenes)).toBe('current');
    expect(checkState(current, 'stesura-2', scenes)).toBe('outdated');
    expect(checkState(undefined, 'stesura-1', scenes)).toBe('none');
  });

  it('per l’utente scena e inquadratura sono numerate da 1; una che non c’è più resta senza numero', () => {
    const view = issuesView(current, scenes);

    expect(view[0]).toMatchObject({ sceneNumber: 1, shotNumber: 2, light: false });
    expect(view[1]).toMatchObject({ sceneNumber: 2 });
    expect(view[1]).not.toHaveProperty('shotNumber');
    expect(view[2]).not.toHaveProperty('sceneNumber');
    expect(issuesView(current, [scene(1, [shot('altro', 1)])])[0]).not.toHaveProperty('shotNumber');
  });
});

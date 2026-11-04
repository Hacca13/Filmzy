import { describe, expect, it } from 'vitest';

import { exampleShotSpec } from './examples.js';
import {
  SHOT_DURATION_RANGE_S,
  changeShotBodySchema,
  planSceneBodySchema,
  planSceneEstimateBodySchema,
  scenePlanSchema,
  shotPlansSchema,
} from './shots-api.js';

const shot = exampleShotSpec;

const scene = {
  sceneNumber: 1,
  heading: 'INT. STAZIONE - NOTTE',
  summary: 'Anna trova la bobina.',
  durationS: 20,
  planned: true,
  stale: false,
  shots: [shot],
  chosenStoryboards: {},
  clips: {},
  working: {},
  flags: {},
  sceneFlags: [],
  hasWork: false,
};

describe('scenePlanSchema', () => {
  it('accetta una scena con le sue inquadrature, e una non ancora pensata', () => {
    expect(scenePlanSchema.parse(scene).shots).toHaveLength(1);
    expect(scenePlanSchema.parse({ ...scene, planned: false, shots: [] }).planned).toBe(false);
    expect(scenePlanSchema.parse({ ...scene, notes: 'Cambia la fotografia.' }).notes).toBe(
      'Cambia la fotografia.',
    );
  });

  it('rifiuta una scena senza numero valido e un’inquadratura che non è una scheda', () => {
    expect(scenePlanSchema.safeParse({ ...scene, sceneNumber: 0 }).success).toBe(false);
    expect(scenePlanSchema.safeParse({ ...scene, shots: [{ id: 'x' }] }).success).toBe(false);
  });
});

describe('flags (T4.9)', () => {
  it('un’inquadratura può avere dei gialli, con codice, motivo, origine e peso; senza il campo la scena non vale', () => {
    const flagged = {
      ...scene,
      flags: {
        'shot-1': [
          {
            code: 'R6',
            key: 'R6:shot-1:1',
            reason: 'Il luogo è cambiato.',
            origin: 'rule',
            light: false,
            fix: 'regenerate',
            ignored: false,
          },
        ],
      },
    };

    expect(scenePlanSchema.parse(flagged).flags['shot-1']?.[0]?.code).toBe('R6');
    expect(
      scenePlanSchema.safeParse({
        ...scene,
        flags: {
          'shot-1': [
            {
              code: 'R6',
              key: 'k',
              reason: 'x',
              origin: 'a caso',
              light: false,
              fix: 'none',
              ignored: false,
            },
          ],
        },
      }).success,
    ).toBe(false);
    // Senza il peso il giallo non vale: il server lo dice sempre.
    expect(
      scenePlanSchema.safeParse({
        ...scene,
        flags: { 'shot-1': [{ code: 'R6', reason: 'x', origin: 'rule' }] },
      }).success,
    ).toBe(false);
    expect(scenePlanSchema.safeParse({ ...scene, flags: undefined }).success).toBe(false);
  });
});

describe('working', () => {
  it('dice cosa si sta facendo per ogni inquadratura che ha un lavoro, e non ammette altro', () => {
    expect(
      scenePlanSchema.parse({ ...scene, working: { 'shot-1': 'video', 'shot-2': 'end_frame' } })
        .working,
    ).toEqual({ 'shot-1': 'video', 'shot-2': 'end_frame' });
    expect(
      scenePlanSchema.safeParse({ ...scene, working: { 'shot-1': 'montaggio' } }).success,
    ).toBe(false);
    expect(scenePlanSchema.safeParse({ ...scene, working: undefined }).success).toBe(false);
  });
});

describe('clips', () => {
  it('porta la clip più recente di ogni inquadratura che ne ha una', () => {
    expect(scenePlanSchema.parse({ ...scene, clips: { 'shot-1': 'clip-1' } }).clips).toEqual({
      'shot-1': 'clip-1',
    });
    expect(scenePlanSchema.safeParse({ ...scene, clips: undefined }).success).toBe(false);
  });
});

describe('chosenStoryboards', () => {
  it('dice per ogni inquadratura quale variante di storyboard è stata scelta', () => {
    const parsed = scenePlanSchema.parse({ ...scene, chosenStoryboards: { 'shot-1': 'asset-9' } });

    expect(parsed.chosenStoryboards).toEqual({ 'shot-1': 'asset-9' });
    expect(
      scenePlanSchema.safeParse({ ...scene, chosenStoryboards: { 'shot-1': '' } }).success,
    ).toBe(false);
    expect(scenePlanSchema.safeParse({ ...scene, chosenStoryboards: undefined }).success).toBe(
      false,
    );
  });
});

describe('shotPlansSchema', () => {
  it('porta la versione della stesura, le scene e i movimenti tra cui scegliere', () => {
    const plans = shotPlansSchema.parse({
      finalVersionId: 'v-1',
      scenes: [scene],
      cameraMovements: [{ id: 'static', label: 'Resta fermo' }],
    });

    expect(plans.cameraMovements.map((m) => m.id)).toEqual(['static']);
    expect(shotPlansSchema.safeParse({ scenes: [scene], cameraMovements: [] }).success).toBe(false);
  });
});

describe('le richieste', () => {
  it('pensare le inquadrature vuole il numero di una scena; la conferma del limite è facoltativa', () => {
    expect(planSceneBodySchema.parse({ sceneNumber: 2 })).toEqual({ sceneNumber: 2 });
    expect(planSceneBodySchema.parse({ sceneNumber: 2, spendConfirmed: true }).spendConfirmed).toBe(
      true,
    );
    expect(planSceneBodySchema.safeParse({ sceneNumber: 0 }).success).toBe(false);
    expect(planSceneBodySchema.safeParse({ sceneNumber: 1, extra: 1 }).success).toBe(false);
    expect(planSceneEstimateBodySchema.safeParse({}).success).toBe(false);
  });

  it('il movimento di macchina è un id di configurazione, non un testo qualunque', () => {
    expect(changeShotBodySchema.parse({ cameraMovement: 'push_in' })).toEqual({
      cameraMovement: 'push_in',
    });
    expect(changeShotBodySchema.safeParse({ cameraMovement: 'Zoom Veloce' }).success).toBe(false);
    expect(changeShotBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('SHOT_DURATION_RANGE_S', () => {
  it('è un intervallo sensato', () => {
    expect(SHOT_DURATION_RANGE_S.min).toBeGreaterThan(0);
    expect(SHOT_DURATION_RANGE_S.max).toBeGreaterThan(SHOT_DURATION_RANGE_S.min);
  });
});

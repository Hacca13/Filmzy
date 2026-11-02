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

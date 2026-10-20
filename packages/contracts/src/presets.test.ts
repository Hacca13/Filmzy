import { describe, expect, it } from 'vitest';

import {
  cameraMovementSchema,
  characterTagSchema,
  cinematographyPresetSchema,
  genreSchema,
  stylePresetSchema,
} from './presets.js';

describe('stylePresetSchema', () => {
  it('accetta lo stile realistico del seme', () => {
    expect(
      stylePresetSchema.parse({
        id: 'realistic',
        label: 'Realistico',
        description: 'Ripresa dal vero, colori naturali',
        hint: 'photorealistic live-action film still, natural skin tones',
        enabled: true,
      }).id,
    ).toBe('realistic');
  });

  it('rifiuta un id con lettere maiuscole', () => {
    expect(
      stylePresetSchema.safeParse({
        id: 'Realistic',
        label: 'Realistico',
        description: 'x',
        hint: 'x',
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe('cinematographyPresetSchema', () => {
  it('accetta la fotografia noir del seme', () => {
    expect(
      cinematographyPresetSchema.parse({
        id: 'noir',
        label: 'Noir',
        description: 'Ombre nette, contrasto forte',
        camera: 'low angles, slow push-ins',
        lighting: 'hard side light, deep shadows',
        lens: '40mm',
        grade: 'high contrast, desaturated',
        enabled: true,
      }).grade,
    ).toBe('high contrast, desaturated');
  });

  it('rifiuta una voce senza grade', () => {
    expect(
      cinematographyPresetSchema.safeParse({
        id: 'noir',
        label: 'Noir',
        description: 'x',
        camera: 'x',
        lighting: 'x',
        lens: 'x',
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe('cameraMovementSchema', () => {
  it('usa endFrameHint in camelCase, come le istruzioni (`{{ movement.endFrameHint }}`)', () => {
    const movement = cameraMovementSchema.parse({
      id: 'push_in',
      label: 'Avvicinati',
      description: 'La camera si avvicina piano al soggetto',
      hint: 'slow, steady push-in, the camera moves closer to the subject',
      endFrameHint: 'the camera has moved closer: tighter framing on the subject, same angle',
      enabled: true,
    });
    expect(movement.endFrameHint).toContain('tighter framing');
  });

  it('rifiuta la forma snake_case del file di configurazione', () => {
    expect(
      cameraMovementSchema.safeParse({
        id: 'push_in',
        label: 'Avvicinati',
        description: 'x',
        hint: 'x',
        end_frame_hint: 'x',
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe('characterTagSchema', () => {
  it('accetta un tag del seme', () => {
    expect(
      characterTagSchema.parse({
        id: 'protagonist',
        label: 'Protagonista',
        description: 'La storia segue lui o lei',
        enabled: true,
      }).label,
    ).toBe('Protagonista');
  });
});

describe('genreSchema', () => {
  it('accetta un genere con id e label, come lo usano le istruzioni', () => {
    expect(genreSchema.parse({ id: 'comedy', label: 'Commedia' }).label).toBe('Commedia');
  });
});

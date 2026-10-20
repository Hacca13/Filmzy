import { describe, expect, it } from 'vitest';

import {
  cameraMovementSchema,
  cameraMovementsFileSchema,
  characterTagSchema,
  characterTagsFileSchema,
  cinematographyFileSchema,
  cinematographyPresetSchema,
  genreSchema,
  genresFileSchema,
  stylePresetSchema,
  stylesFileSchema,
} from './presets.js';

describe('stylePresetSchema', () => {
  it('accetta una voce di config/presets/styles.yaml', () => {
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
  it('accetta una voce di config/presets/cinematography.yaml', () => {
    expect(
      cinematographyPresetSchema.parse({
        id: 'noir',
        label: 'Noir',
        description: 'Ombre nette, contrasto forte',
        camera: 'low angles, slow push-ins',
        lighting: 'hard side light, deep shadows, venetian blind patterns',
        lens: '40mm',
        grade: 'high contrast, desaturated',
        enabled: true,
      }).id,
    ).toBe('noir');
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
  it('accetta una voce di config/presets/camera_movements.yaml', () => {
    expect(
      cameraMovementSchema.parse({
        id: 'push_in',
        label: 'Avvicinati',
        description: 'La camera si avvicina piano al soggetto',
        hint: 'slow, steady push-in, the camera moves closer to the subject',
        end_frame_hint: 'the camera has moved closer: tighter framing on the subject, same angle',
        enabled: true,
      }).id,
    ).toBe('push_in');
  });

  it('rifiuta una voce senza end_frame_hint', () => {
    expect(
      cameraMovementSchema.safeParse({
        id: 'push_in',
        label: 'Avvicinati',
        description: 'x',
        hint: 'x',
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe('characterTagSchema', () => {
  it('accetta una voce di config/presets/character_tags.yaml', () => {
    expect(
      characterTagSchema.parse({
        id: 'protagonist',
        label: 'Protagonista',
        description: 'La storia segue lui o lei',
        enabled: true,
      }).id,
    ).toBe('protagonist');
  });
});

describe('genreSchema', () => {
  it('accetta una voce di config/presets/genres.yaml', () => {
    expect(genreSchema.parse({ id: 'comedy', label: 'Commedia' }).id).toBe('comedy');
  });
});

describe('contenitori dei file di seme', () => {
  it('accetta il file degli stili con version e la lista', () => {
    const file = {
      version: 1 as const,
      styles: [
        {
          id: 'realistic',
          label: 'Realistico',
          description: 'x',
          hint: 'x',
          enabled: true,
        },
      ],
    };
    expect(stylesFileSchema.parse(file)).toEqual(file);
  });

  it('accetta il file della fotografia', () => {
    expect(
      cinematographyFileSchema.safeParse({ version: 1, cinematography: [] }).success,
    ).toBe(true);
  });

  it('accetta il file dei movimenti di macchina', () => {
    expect(cameraMovementsFileSchema.safeParse({ version: 1, camera_movements: [] }).success).toBe(
      true,
    );
  });

  it('accetta il file dei tag', () => {
    expect(characterTagsFileSchema.safeParse({ version: 1, character_tags: [] }).success).toBe(
      true,
    );
  });

  it('accetta il file dei generi e dei toni', () => {
    const file = {
      version: 1 as const,
      genres: [{ id: 'comedy', label: 'Commedia' }],
      tones: [{ id: 'light', label: 'Leggero' }],
    };
    expect(genresFileSchema.parse(file)).toEqual(file);
  });

  it('rifiuta una version diversa da 1', () => {
    expect(stylesFileSchema.safeParse({ version: 2, styles: [] }).success).toBe(false);
  });
});

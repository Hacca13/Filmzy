import { describe, expect, it } from 'vitest';

import {
  cameraMovementConfigSchema,
  cameraMovementsFileSchema,
  characterTagsFileSchema,
  cinematographyFileSchema,
  genresFileSchema,
  stylesFileSchema,
} from './presets.js';

describe('cameraMovementConfigSchema', () => {
  it('accetta la voce di config/presets/camera_movements.yaml, in snake_case', () => {
    const movement = {
      id: 'push_in',
      label: 'Avvicinati',
      description: 'La camera si avvicina piano al soggetto',
      hint: 'slow, steady push-in, the camera moves closer to the subject',
      end_frame_hint: 'the camera has moved closer: tighter framing on the subject, same angle',
      enabled: true,
    };
    expect(cameraMovementConfigSchema.parse(movement).end_frame_hint).toContain('tighter framing');
  });

  it('rifiuta una voce senza end_frame_hint', () => {
    expect(
      cameraMovementConfigSchema.safeParse({
        id: 'push_in',
        label: 'Avvicinati',
        description: 'x',
        hint: 'x',
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe('contenitori dei file di seme', () => {
  it('accetta il file degli stili con version e la lista', () => {
    const file = {
      version: 1 as const,
      styles: [
        { id: 'realistic', label: 'Realistico', description: 'x', hint: 'x', enabled: true },
      ],
    };
    expect(stylesFileSchema.parse(file)).toEqual(file);
  });

  it('accetta il file della fotografia', () => {
    expect(cinematographyFileSchema.safeParse({ version: 1, cinematography: [] }).success).toBe(
      true,
    );
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

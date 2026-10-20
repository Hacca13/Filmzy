import { z } from 'zod';

import {
  characterTagSchema,
  cinematographyPresetSchema,
  genreSchema,
  stylePresetSchema,
  toneSchema,
} from '../presets.js';

/**
 * Gli schemi dei file di seme di `config/presets/`: chiavi in **snake_case**, come nei YAML
 * (CLAUDE.md «Convenzioni»). Le voci i cui campi sono già uguali nelle due convenzioni si
 * riusano dal dominio (`src/presets.ts`); il movimento di macchina ha un campo con due nomi
 * (`end_frame_hint` nel file, `endFrameHint` per le istruzioni), quindi qui ha uno schema suo.
 */
export const cameraMovementConfigSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  hint: z.string().min(1),
  end_frame_hint: z.string().min(1),
  enabled: z.boolean(),
});

export type CameraMovementConfig = z.infer<typeof cameraMovementConfigSchema>;

export const stylesFileSchema = z.object({
  version: z.literal(1),
  styles: z.array(stylePresetSchema),
});

export const cinematographyFileSchema = z.object({
  version: z.literal(1),
  cinematography: z.array(cinematographyPresetSchema),
});

export const cameraMovementsFileSchema = z.object({
  version: z.literal(1),
  camera_movements: z.array(cameraMovementConfigSchema),
});

export const characterTagsFileSchema = z.object({
  version: z.literal(1),
  character_tags: z.array(characterTagSchema),
});

export const genresFileSchema = z.object({
  version: z.literal(1),
  genres: z.array(genreSchema),
  tones: z.array(toneSchema),
});

import { z } from 'zod';

import { assetRefSchema } from '../asset.js';
import { characterSchema, locationSchema } from '../bible.js';
import { stylePresetSchema } from '../presets.js';
import { roleMoodboardFieldSchema, visualPromptSchema } from './shared.js';

/** `character_designer`: scheda a tre angolazioni su fondo neutro (architettura §5.3). */
export const characterDesignerInputSchema = z.object({
  character: characterSchema,
  style: stylePresetSchema,
  angle: z.enum(['front', 'profile', 'three_quarter']),
  moodboard: roleMoodboardFieldSchema,
});

export type CharacterDesignerInput = z.infer<typeof characterDesignerInputSchema>;

/** `set_designer`: 3-4 immagini del set, senza persone (architettura §5.3, D19). */
export const setDesignerInputSchema = z.object({
  location: locationSchema,
  style: stylePresetSchema,
  variants: z.number().int().positive(),
  moodboard: roleMoodboardFieldSchema,
});

export type SetDesignerInput = z.infer<typeof setDesignerInputSchema>;

/** `moodboard_artist`: immagini di riferimento dal prompt del moodboard designer (D37). */
export const moodboardArtistInputSchema = z.object({
  prompt: z.string().min(1),
  style: stylePresetSchema,
  variants: z.number().int().positive(),
});

export type MoodboardArtistInput = z.infer<typeof moodboardArtistInputSchema>;

/** `retoucher`: togli, sostituisci o cambia colore su un'immagine data (architettura §5.3, D21). */
export const retoucherInputSchema = z.object({
  image: assetRefSchema,
  mask: assetRefSchema,
  operation: z.enum(['remove', 'replace', 'recolor']),
  instruction: z.string().min(1).nullable(),
  style: stylePresetSchema,
});

export type RetoucherInput = z.infer<typeof retoucherInputSchema>;

/**
 * `storyboard_artist`: due modi (architettura §5.3). `storyboard` genera varianti dai riferimenti;
 * `end_frame` modifica il primo fotogramma (`baseImage`) per generare l'ultimo, in base al
 * movimento di macchina già descritto nel prompt visivo.
 */
export const storyboardArtistInputSchema = z.object({
  mode: z.enum(['storyboard', 'end_frame']),
  visualPrompt: visualPromptSchema,
  references: z.array(assetRefSchema),
  variants: z.number().int().positive(),
  baseImage: assetRefSchema.nullable(),
  moodboard: roleMoodboardFieldSchema,
});

export type StoryboardArtistInput = z.infer<typeof storyboardArtistInputSchema>;

/** `camera_operator`: prompt visivo e riferimenti verso un take video (architettura §5.3). */
export const cameraOperatorInputSchema = z.object({
  visualPrompt: visualPromptSchema,
  references: z.array(assetRefSchema),
  durationS: z.number().positive(),
});

export type CameraOperatorInput = z.infer<typeof cameraOperatorInputSchema>;

import { z } from 'zod';

import { assetIdSchema, configKeySchema } from '../ids.js';
import { moodboardBriefSchema } from '../moodboard.js';

/**
 * Il prompt visivo scritto dal direttore della fotografia (architettura §5.3, §4.7): in inglese,
 * lo leggono il traduttore e i ruoli immagine e video.
 */
export const visualPromptSchema = z.object({
  prompt: z.string().min(1),
  negativePrompt: z.string().min(1).optional(),
});

export type VisualPrompt = z.infer<typeof visualPromptSchema>;

/**
 * Destinazione del prompt (architettura §4.7): a quale famiglia di modelli e con quali ingressi
 * dell'utente (D20). `frame`: una clip (`clip`) o un fotogramma (`start`, `end`).
 */
export const promptTargetSchema = z.object({
  family: configKeySchema,
  kind: z.enum(['image', 'video']),
  maxPromptChars: z.number().int().positive(),
  frame: z.enum(['clip', 'start', 'end']),
  inputs: z.array(z.enum(['references', 'first_frame', 'last_frame'])),
});

export type PromptTarget = z.infer<typeof promptTargetSchema>;

/**
 * Riferimento a un'immagine di ispirazione (scheda personaggio, immagine del set...) passata a un
 * ruolo immagine o video, senza i campi dell'editor di ritocco.
 */
export const referenceImageSchema = z.object({ assetId: assetIdSchema });

export type ReferenceImage = z.infer<typeof referenceImageSchema>;

/**
 * Il campo `moodboard?` che arriva ai ruoli che scrivono o generano immagini (architettura §5.3):
 * sempre presente, `null` se il progetto non ha un moodboard (§4.4).
 */
export const roleMoodboardFieldSchema = moodboardBriefSchema.nullable();

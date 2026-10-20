import { z } from 'zod';

import { assetRefSchema } from './asset.js';
import { characterIdSchema, idSchema, locationIdSchema } from './ids.js';
import { moodboardBriefSchema } from './moodboard.js';
import { cinematographyPresetSchema, stylePresetSchema } from './presets.js';
import { projectSummarySchema } from './project.js';

/** Dettagli facoltativi del personaggio (D22): si possono ignorare. */
export const characterProfileSchema = z.object({
  personality: z.string().min(1).optional(),
  behavior: z.string().min(1).optional(),
  goal: z.string().min(1).optional(),
});

export type CharacterProfile = z.infer<typeof characterProfileSchema>;

/** Aspetto del personaggio: `prompt` è in inglese, lo scrive il casting (architettura §4.2). */
export const characterAppearanceSchema = z.object({
  apparentAge: z.string().min(1),
  build: z.string().min(1),
  hair: z.string().min(1),
  face: z.string().min(1),
  clothing: z.string().min(1),
  distinctive: z.string().min(1).optional(),
  prompt: z.string().min(1),
});

export type CharacterAppearance = z.infer<typeof characterAppearanceSchema>;

/**
 * Un personaggio della Bibbia (architettura §5.1). `tag` è l'id di un `character_tags` (D22);
 * `proposalId` collega il personaggio alla proposta della bozza da cui viene (D18), vuoto se
 * creato direttamente nel casting.
 */
export const characterSchema = z.object({
  id: characterIdSchema,
  name: z.string().min(1),
  tag: idSchema,
  role: z.string().min(1),
  description: z.string().min(1),
  profile: characterProfileSchema.optional(),
  appearance: characterAppearanceSchema,
  sheet: z.array(assetRefSchema),
  voiceId: idSchema.optional(),
  proposalId: idSchema.optional(),
});

export type Character = z.infer<typeof characterSchema>;

/**
 * Un luogo della Bibbia. `prompt` è la sua descrizione in inglese scritta dallo sceneggiatore
 * (architettura §5.1).
 */
export const locationSchema = z.object({
  id: locationIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  prompt: z.string().min(1),
  references: z.array(assetRefSchema),
  proposalId: idSchema.optional(),
});

export type Location = z.infer<typeof locationSchema>;

/**
 * Limiti che il backend applica alla Bibbia (architettura §4.3): `maxCharacters` è il numero di
 * personaggi principali per film (2 nell'MVP).
 */
export const bibleLimitsSchema = z.object({
  maxCharacters: z.number().int().positive(),
});

export type BibleLimits = z.infer<typeof bibleLimitsSchema>;

/**
 * La Bibbia (architettura §5.1): "un unico oggetto che ogni ruolo legge", assemblato dal modulo
 * `bible` a partire dalle tabelle del database. `moodboard` è assente se l'utente non l'ha fatto
 * (D37).
 */
export const storyBibleSchema = z.object({
  project: projectSummarySchema,
  style: stylePresetSchema,
  cinematography: cinematographyPresetSchema,
  characters: z.array(characterSchema),
  locations: z.array(locationSchema),
  moodboard: moodboardBriefSchema.optional(),
  limits: bibleLimitsSchema,
});

export type StoryBible = z.infer<typeof storyBibleSchema>;

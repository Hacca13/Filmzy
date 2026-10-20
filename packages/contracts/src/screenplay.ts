import { z } from 'zod';

import { characterIdSchema, idSchema, locationIdSchema } from './ids.js';

/** Una scena della sceneggiatura (architettura §5.3). `beats` è vuoto nella bozza. */
export const screenplaySceneSchema = z.object({
  number: z.number().int().positive(),
  heading: z.string().min(1),
  locationId: locationIdSchema.optional(),
  timeOfDay: z.string().min(1),
  characterIds: z.array(characterIdSchema),
  summary: z.string().min(1),
  beats: z.array(z.string().min(1)),
  durationS: z.number().positive(),
});

export type ScreenplayScene = z.infer<typeof screenplaySceneSchema>;

/** Proposta di personaggio della sceneggiatura, scelta o scartata al riepilogo (D18). */
export const screenplayCharacterProposalSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  role: z.string().min(1),
});

export type ScreenplayCharacterProposal = z.infer<typeof screenplayCharacterProposalSchema>;

/** Proposta di luogo della sceneggiatura: `prompt` è la descrizione in inglese. */
export const screenplayLocationProposalSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  prompt: z.string().min(1),
});

export type ScreenplayLocationProposal = z.infer<typeof screenplayLocationProposalSchema>;

/**
 * Sceneggiatura scritta dallo sceneggiatore (architettura §5.3): bozza, revisione o stesura
 * ufficiale. Nel modo `final` le proposte di personaggi e luoghi sono vuote, perché si usano solo
 * cast e luoghi già scelti.
 */
export const screenplaySchema = z.object({
  title: z.string().min(1),
  logline: z.string().min(1),
  characters: z.array(screenplayCharacterProposalSchema),
  locations: z.array(screenplayLocationProposalSchema),
  scenes: z.array(screenplaySceneSchema),
  notes: z.string().min(1).optional(),
});

export type Screenplay = z.infer<typeof screenplaySchema>;

/**
 * Un elemento della bozza che l'utente ha deciso di tenere così com'è al riepilogo (architettura
 * §5.3): resta come comparsa o luogo generico. Vuoto fuori dal modo `final`.
 */
export const acceptedElementSchema = z.object({
  kind: z.enum(['character', 'location']),
  name: z.string().min(1),
});

export type AcceptedElement = z.infer<typeof acceptedElementSchema>;

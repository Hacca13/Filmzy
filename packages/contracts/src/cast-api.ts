import { z } from 'zod';

import { characterProfileSchema, characterSchema } from './bible.js';
import { projectChoiceSchema } from './projects-api.js';
import { castingSuggestionSchema } from './roles/llm.js';
import { estimateSchema } from './spend.js';

/**
 * Le rotte del cast (T3.5, D18, D22): le proposte del direttore del casting, che l'utente aggiunge,
 * cambia o scarta, e i personaggi che entrano nella Bibbia del film.
 */

/** Il cast del film: i personaggi scelti, il massimo consentito e i ruoli tra cui scegliere (tag). */
export const castSchema = z.object({
  characters: z.array(characterSchema),
  maxCharacters: z.number().int().positive(),
  tags: z.array(projectChoiceSchema),
});

export type Cast = z.infer<typeof castSchema>;

/**
 * «Proponi il cast» e «Cambia»: quante proposte (non oltre i posti ancora liberi) e quelle già
 * sul tavolo, che il casting deve conoscere per non fare doppioni. `spendConfirmed` è la conferma
 * dell'utente a superare un limite di spesa (D30).
 */
export const suggestCastBodySchema = z.strictObject({
  count: z.number().int().positive(),
  pending: z.array(castingSuggestionSchema).optional(),
  spendConfirmed: z.boolean().optional(),
});

export type SuggestCastBody = z.infer<typeof suggestCastBodySchema>;

export const castSuggestionsSchema = z.object({
  suggestions: z.array(castingSuggestionSchema),
});

export type CastSuggestions = z.infer<typeof castSuggestionsSchema>;

/** Quanto costerebbe chiedere `count` proposte, prima di chiederle (D30). */
export const castEstimateBodySchema = z.strictObject({
  count: z.number().int().positive(),
});

export const castEstimateSchema = z.object({ estimate: estimateSchema });

export type CastEstimate = z.infer<typeof castEstimateSchema>;

/** «Aggiungi»: la proposta diventa un personaggio del film. */
export const addCharacterBodySchema = z.strictObject({
  suggestion: castingSuggestionSchema,
});

export type AddCharacterBody = z.infer<typeof addCharacterBodySchema>;

/**
 * Cambia un personaggio già aggiunto: il tag e i dettagli facoltativi si possono rivedere in
 * qualsiasi momento. Il testo cambiato passa dal moderatore (T3.3).
 */
export const updateCharacterBodySchema = z.strictObject({
  name: z.string().trim().min(1).optional(),
  tag: z.string().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  profile: characterProfileSchema.optional(),
});

export type UpdateCharacterBody = z.infer<typeof updateCharacterBodySchema>;

import { z } from 'zod';

import { locationAttemptSchema } from './locations-api.js';
import { assetIdSchema, modelIdSchema, shotIdSchema } from './ids.js';

/**
 * Lo storyboard di un'inquadratura (T4.1, architettura §3.1, §5.2): l'aiuto regista ha pensato
 * l'inquadratura, ora si vedono due o tre varianti dell'immagine, fatte col volto bloccato dei
 * personaggi e l'immagine del set come riferimento, e se ne sceglie una. La variante scelta è il
 * riferimento visivo della card.
 */

/**
 * Quanto può essere lungo il prompt visivo di un'immagine, in caratteri: lo dice il direttore della
 * fotografia alle sue istruzioni. È un limite del programma, come la durata delle inquadrature: il
 * bench di T4.0 può cambiarlo.
 */
export const STORYBOARD_PROMPT_MAX_CHARS = 900;

/** Un tentativo di storyboard: le varianti nate dalla stessa richiesta, con un solo stato. */
export const storyboardAttemptSchema = locationAttemptSchema;

export type StoryboardAttempt = z.infer<typeof storyboardAttemptSchema>;

/** Lo storyboard di un'inquadratura: i tentativi dal più recente e la variante scelta. */
export const shotStoryboardSchema = z.object({
  shotId: shotIdSchema,
  attempts: z.array(storyboardAttemptSchema),
  chosenAssetId: assetIdSchema.optional(),
});

export type ShotStoryboard = z.infer<typeof shotStoryboardSchema>;

/** Cosa porta in coda il lavoro «fai lo storyboard» (`storyboard_images`). */
export const storyboardJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  shotId: shotIdSchema,
  attempt: z.number().int().positive(),
  modelId: modelIdSchema,
  spendConfirmed: z.boolean().optional(),
});

export type StoryboardJobPayload = z.infer<typeof storyboardJobPayloadSchema>;

/** «Scegli questa»: la variante che diventa il riferimento visivo dell'inquadratura. */
export const chooseStoryboardBodySchema = z.strictObject({
  assetId: assetIdSchema,
});

export type ChooseStoryboardBody = z.infer<typeof chooseStoryboardBodySchema>;

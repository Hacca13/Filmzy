import { z } from 'zod';

/**
 * Il «no» del moderatore a un testo dell'utente (T3.3, architettura §5.3, §10): perché non si può
 * usare e, se c'è, come riformularlo. `reason` e `suggestion` sono scritti dal moderatore nella
 * lingua del film, in una frase semplice, e arrivano all'interfaccia così come sono. `category` è
 * un'etichetta per chi legge i registri, non per l'utente.
 */
export const moderationRejectionSchema = z.object({
  category: z.string().min(1).optional(),
  reason: z.string().min(1),
  suggestion: z.string().min(1).optional(),
});

export type ModerationRejection = z.infer<typeof moderationRejectionSchema>;

import { z } from 'zod';

import { modelKindSchema } from '../model-kind.js';

/** Un servizio i cui termini l'utente deve conoscere: si può usare, ma con la sua scritta (D79). */
export const restrictedServiceSchema = z.object({
  /** Senza, vale per ogni tipo di servizio. */
  kinds: z.array(modelKindSchema).min(1).optional(),
  match: z.array(z.string().min(1)).min(1),
  notice: z.string().min(1),
});

export type RestrictedService = z.infer<typeof restrictedServiceSchema>;

/** Il file `config/ai/policy.yaml`. Non sta nella release: non si cambia pubblicando una bozza. */
export const servicePolicyFileSchema = z.object({
  version: z.literal(1),
  restricted_services: z.array(restrictedServiceSchema),
});

export type ServicePolicyFile = z.infer<typeof servicePolicyFileSchema>;

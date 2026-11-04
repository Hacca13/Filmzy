import { z } from 'zod';

import { modelKindSchema } from '../model-kind.js';

/** Un servizio che Filmzy non permette di aggiungere, con il motivo da mostrare all'utente (D79). */
export const blockedServiceSchema = z.object({
  /** Senza, vale per ogni tipo di servizio. */
  kinds: z.array(modelKindSchema).min(1).optional(),
  match: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1),
});

export type BlockedService = z.infer<typeof blockedServiceSchema>;

/** Il file `config/ai/policy.yaml`. Non sta nella release: non si cambia pubblicando una bozza. */
export const servicePolicyFileSchema = z.object({
  version: z.literal(1),
  blocked_services: z.array(blockedServiceSchema),
});

export type ServicePolicyFile = z.infer<typeof servicePolicyFileSchema>;

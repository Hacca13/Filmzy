import { z } from 'zod';

import { connectionIdSchema, modelIdSchema } from './ids.js';
import { modelGroupSchema } from './model-kind.js';
import { roleIdSchema } from './roles.js';
import { spendCapSchema } from './spend.js';

/**
 * Riferimento a una versione delle istruzioni (architettura §5.6): `id@versione`, anche di un
 * file caricato dall'utente (`origin: user` nella tabella `instruction_versions`).
 */
export const instructionsRefSchema = z.string().regex(/^[a-z0-9_-]+@[0-9]+$/);

export type InstructionsRef = z.infer<typeof instructionsRefSchema>;

/**
 * Regolazioni di un ruolo scelte dall'utente in «Chi fa cosa» (architettura §4.3, §5.6, D38): se ci
 * sono, vincono sul predefinito del gruppo. `params.temperature` si accetta solo se il modello
 * scelto la dichiara e dentro i suoi limiti: il controllo è del validatore (T0.4), non di questo
 * schema.
 */
export const roleSettingsSchema = z.object({
  modelId: modelIdSchema.optional(),
  params: z.object({ temperature: z.number().optional() }).optional(),
  instructions: instructionsRefSchema.optional(),
});

export type RoleSettings = z.infer<typeof roleSettingsSchema>;

/**
 * Le scelte dell'utente (architettura §4.3, §5.6, D36): valgono subito, senza pubblicare una
 * release. Nessun limite di spesa è preimpostato.
 */
export const userSettingsSchema = z.object({
  enabledModelIds: z.array(modelIdSchema),
  defaultModels: z.partialRecord(modelGroupSchema, modelIdSchema),
  defaultModelByConnection: z.record(connectionIdSchema, modelIdSchema),
  spendCaps: spendCapSchema,
  roleSettings: z.partialRecord(roleIdSchema, roleSettingsSchema),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

import { z } from 'zod';

import { domainErrorCodeSchema } from './errors.js';
import { connectionIdSchema, modelIdSchema } from './ids.js';
import { modelGroupSchema, modelKindSchema } from './model-kind.js';

/**
 * «Chi fa cosa» (T2.7, architettura §4.3, §5.6, D38): per ogni ruolo, quale servizio lavora, quali
 * altri si potrebbero scegliere, la creatività dove il servizio la accetta e la versione delle
 * istruzioni. Le scelte valgono subito, senza pubblicare (D36).
 */

/** I limiti della creatività del servizio in uso: c'è solo dove il servizio la accetta (D42). */
export const temperatureStateSchema = z.object({
  /** Quella scelta dall'utente, o quella scritta nella release; assente se nessuna. */
  value: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  /** L'ha scelta l'utente (e si può tornare al valore del programma). */
  chosen: z.boolean(),
});

export const roleServiceOptionSchema = z.object({
  modelId: modelIdSchema,
  label: z.string().min(1),
});

export const roleProviderOptionSchema = z.object({
  connectionId: connectionIdSchema,
  label: z.string().min(1),
  services: z.array(roleServiceOptionSchema),
});

export const roleStateSchema = z.object({
  roleId: z.string().min(1),
  label: z.string().min(1),
  kind: modelKindSchema,
  group: modelGroupSchema,
  enabled: z.boolean(),
  /** Il servizio che oggi lavorerebbe. Senza, `problem` dice perché (nessun servizio idoneo, ruolo spento…). */
  inUse: z
    .object({
      connectionId: connectionIdSchema,
      connectionLabel: z.string().min(1),
      modelId: modelIdSchema,
      modelLabel: z.string().min(1),
    })
    .optional(),
  problem: domainErrorCodeSchema.optional(),
  /** Il servizio che l'utente ha scelto per questo ruolo, se l'ha scelto. */
  chosenModelId: modelIdSchema.optional(),
  /** I servizi fra cui scegliere: attivati, utilizzabili, del tipo giusto e adatti al ruolo. */
  providers: z.array(roleProviderOptionSchema),
  temperature: temperatureStateSchema.optional(),
  instructions: z
    .object({
      /** «Versione 2» o «Le mie istruzioni 1». */
      label: z.string().min(1),
      recommended: z.boolean(),
      newerAvailable: z.boolean(),
    })
    .optional(),
});

export type RoleState = z.infer<typeof roleStateSchema>;

export const rolesOverviewSchema = z.object({ roles: z.array(roleStateSchema) });

export type RolesOverview = z.infer<typeof rolesOverviewSchema>;

/** `PUT /roles/:id/service`: `null` torna al servizio della release (o al predefinito del gruppo). */
export const setRoleServiceBodySchema = z.object({ modelId: modelIdSchema.nullable() });

export type SetRoleServiceBody = z.infer<typeof setRoleServiceBodySchema>;

/** `PUT /roles/:id/temperature`: `null` torna al valore del programma. I limiti li controlla il server. */
export const setRoleTemperatureBodySchema = z.object({ value: z.number().finite().nullable() });

export type SetRoleTemperatureBody = z.infer<typeof setRoleTemperatureBodySchema>;

/**
 * La risposta a una modifica: il quadro aggiornato e le regolazioni che il servizio nuovo non
 * accetta e che si sono scartate, perché l'interfaccia lo dica (architettura §4.3).
 */
export const roleChangeResultSchema = z.object({
  overview: rolesOverviewSchema,
  discarded: z.array(z.enum(['temperature'])),
});

export type RoleChangeResult = z.infer<typeof roleChangeResultSchema>;

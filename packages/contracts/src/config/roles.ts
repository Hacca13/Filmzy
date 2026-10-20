import { z } from 'zod';

import { modelIdSchema } from '../ids.js';
import { modelKindSchema } from '../model-kind.js';
import { instructionsRefSchema } from '../settings.js';
import { roleIdSchema } from '../roles.js';

/** Instradamento tra più candidati (architettura §4.8): il router ordina secondo la politica. */
export const roleRoutingSchema = z.object({
  policy: z.enum(['cheap', 'balanced', 'quality']),
  candidates: z.array(modelIdSchema).min(1),
});

export type RoleRouting = z.infer<typeof roleRoutingSchema>;

/**
 * Nuovi tentativi sullo stesso servizio per errori passeggeri (architettura §4.1, §4.10): nessuna
 * riserva automatica, solo poche ripetizioni prima di fermarsi.
 */
export const roleRetriesSchema = z.object({
  invalid_output: z.number().int().nonnegative().optional(),
  technical_error: z.number().int().nonnegative().optional(),
});

export type RoleRetries = z.infer<typeof roleRetriesSchema>;

/** Un valore di parametro scelto per il ruolo (non un intervallo: quello sta nel catalogo). */
export const roleParamValueSchema = z.union([z.string(), z.number(), z.boolean()]);

/**
 * I campi di un ruolo, senza il controllo "model o routing" (architettura §4.3, §4.8): la base
 * che `roleConfigEntrySchema` irrigidisce con `.refine()` e che la sovrapposizione d'ambiente
 * (`environments.ts`) riusa con `.partial()`, perché lì ogni campo è facoltativo.
 */
export const roleConfigFieldsSchema = z.strictObject({
  label: z.string().min(1),
  kind: modelKindSchema,
  model: modelIdSchema.optional(),
  routing: roleRoutingSchema.optional(),
  prompt_from: roleIdSchema.optional(),
  params: z.record(z.string().min(1), roleParamValueSchema).optional(),
  instructions: instructionsRefSchema.optional(),
  output_strategy: z.literal('auto').optional(),
  retries: roleRetriesSchema.optional(),
  enabled: z.boolean().optional(),
});

/**
 * Un ruolo della troupe (architettura §4.3, §4.8, `config/ai/roles.yaml`). `model` e `routing`
 * sono alternativi: un ruolo attivo (`enabled` non `false`) deve averne uno, un ruolo spento
 * (come `sfx_artist`, in attesa del fornitore) può non averne ancora nessuno.
 */
export const roleConfigEntrySchema = roleConfigFieldsSchema.refine(
  (entry) => {
    const hasModel = entry.model !== undefined;
    const hasRouting = entry.routing !== undefined;
    if (hasModel && hasRouting) return false;
    if (entry.enabled === false) return true;
    return hasModel || hasRouting;
  },
  {
    message:
      'model e routing sono alternativi; un ruolo attivo deve averne uno (architettura §4.3)',
  },
);

export type RoleConfigEntry = z.infer<typeof roleConfigEntrySchema>;

/**
 * Il file di seme `config/ai/roles.yaml`. Mappa parziale: non ogni ruolo dell'MVP è già nel seme
 * (per esempio i ruoli del moodboard, opzione non ancora attiva).
 */
export const rolesConfigFileSchema = z.object({
  version: z.literal(1),
  roles: z.partialRecord(roleIdSchema, roleConfigEntrySchema),
});

export type RolesConfigFile = z.infer<typeof rolesConfigFileSchema>;

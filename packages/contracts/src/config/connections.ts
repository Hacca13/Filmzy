import { z } from 'zod';

import { configKeySchema } from '../ids.js';

/**
 * Un riferimento a un segreto nella configurazione (CLAUDE.md regola d'oro 7): `env:NOME`
 * (obbligatoria), `env:NOME?` (facoltativa), `secret:NOME` (dal portachiavi) o `none`. Mai una
 * chiave in chiaro.
 */
export const secretRefSchema = z
  .string()
  .regex(/^(env:[A-Z][A-Z0-9_]*\??|secret:[A-Z][A-Z0-9_]*|none)$/);

export type SecretRef = z.infer<typeof secretRefSchema>;

/**
 * Una connessione: come si raggiunge un fornitore (architettura §4.3). `adapter` resta una
 * stringa aperta (configKeySchema): un nuovo adapter non tocca questo schema (§4.12 caso C).
 */
export const connectionSchema = z.strictObject({
  adapter: configKeySchema,
  base_url: z.url().optional(),
  api_key: secretRefSchema,
  http_proxy: secretRefSchema.optional(),
  timeout_s: z.number().int().positive(),
  max_concurrency: z.number().int().positive(),
  delivery: z.literal('polling').optional(),
  media_retention: z.string().min(1).optional(),
  data_region: z.string().min(1).optional(),
  monthly_cap_usd: z.number().positive().optional(),
  enabled: z.boolean(),
  fixtures: z.string().min(1).optional(),
});

export type Connection = z.infer<typeof connectionSchema>;

/** Il file di seme `config/ai/connections.yaml`. */
export const connectionsFileSchema = z.object({
  version: z.literal(1),
  connections: z.record(configKeySchema, connectionSchema),
});

export type ConnectionsFile = z.infer<typeof connectionsFileSchema>;

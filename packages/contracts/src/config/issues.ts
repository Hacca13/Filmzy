import { z } from 'zod';

/** Le sezioni della configurazione a cui può riferirsi un problema (architettura §4.6). */
export const CONFIG_SECTIONS = [
  'connections',
  'models',
  'roles',
  'features',
  'presets',
  'instructions',
  'bench',
] as const;

export const configSectionSchema = z.enum(CONFIG_SECTIONS);

export type ConfigSection = z.infer<typeof configSectionSchema>;

/**
 * Un problema trovato nella configurazione (architettura §4.6). Un `error` impedisce la
 * pubblicazione, un `warning` no: nei file di seme, per esempio, un prezzo mancante o un id da
 * verificare sono avvisi.
 *
 * Il messaggio è in italiano e **nomina ruolo e campo**, perché è ciò che serve a capire dove
 * guardare; gli altri campi servono alle impostazioni avanzate per mostrare il problema accanto
 * alla voce giusta. Attraversa il confine col server, quindi ha uno schema (regola d'oro 3).
 */
export const configIssueSchema = z.object({
  severity: z.enum(['error', 'warning']),
  code: z.string().min(1),
  message: z.string().min(1),
  file: z.string().min(1).optional(),
  section: configSectionSchema.optional(),
  key: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
  connectionId: z.string().min(1).optional(),
  field: z.string().min(1).optional(),
});

export type ConfigIssue = z.infer<typeof configIssueSchema>;

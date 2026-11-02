import { z } from 'zod';

import { releaseSummarySchema } from './settings-api.js';

/**
 * Differenze, storico e ripristino della configurazione (T2.6, architettura §4.5 punti 3 e 4).
 * Le differenze le calcola il server (regola 8): l'interfaccia le mostra.
 */

export const CONFIG_CHANGE_SECTIONS = [
  'connections',
  'models',
  'roles',
  'presets',
  'features',
  'limits',
] as const;

export const configChangeSectionSchema = z.enum(CONFIG_CHANGE_SECTIONS);

export type ConfigChangeSection = z.infer<typeof configChangeSectionSchema>;

/**
 * Una differenza fra due configurazioni. `key` è la voce (per i preset `categoria:id`; per funzioni
 * e limiti il nome del valore); `label` il nome che le dà la configurazione, se ne ha uno; `fields`
 * i campi cambiati di una voce modificata.
 */
export const configChangeSchema = z.object({
  section: configChangeSectionSchema,
  key: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(['added', 'removed', 'changed']),
  fields: z.array(z.string().min(1)),
});

export type ConfigChange = z.infer<typeof configChangeSchema>;

/** `GET /troupe/draft/diff` e `GET /troupe/releases/:id/diff`: cosa cambierebbe, e rispetto a cosa. */
export const configDiffSchema = z.object({ changes: z.array(configChangeSchema) });

export type ConfigDiff = z.infer<typeof configDiffSchema>;

/** `GET /troupe/releases`: lo storico, dalla più recente. Una sola è quella attiva. */
export const releaseListSchema = z.object({
  releases: z.array(releaseSummarySchema.extend({ isActive: z.boolean() })),
});

export type ReleaseList = z.infer<typeof releaseListSchema>;

/**
 * `POST /troupe/releases/:id/restore`: ripristinare è pubblicare di nuovo una release vecchia come
 * release nuova (lo storico resta lineare), e come ogni pubblicazione vuole una nota.
 */
export const restoreBodySchema = z.object({ note: z.string().trim().min(1).max(500) });

export type RestoreBody = z.infer<typeof restoreBodySchema>;

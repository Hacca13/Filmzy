import { z } from 'zod';

import { configKeySchema } from '../ids.js';
import { connectionSchema } from './connections.js';
import { roleConfigFieldsSchema, roleRoutingSchema } from './roles.js';

/**
 * Chiave di una sezione sovrapposta (architettura §4.5): l'id di una voce del seme, oppure `*`
 * che vale per tutte le voci della sezione.
 */
export const environmentKeySchema = z.union([configKeySchema, z.literal('*')]);

/**
 * Sovrapposizione d'ambiente (architettura §4.5, `config/ai/environments/<env>.yaml`): sopra la
 * release attiva (o il seme), sotto gli override di singola chiamata. Ogni sezione e ogni campo
 * sono facoltativi, ma una sezione che non si può sovrapporre è un errore e non un silenzio:
 * altrimenti un file d'ambiente sembrerebbe funzionare senza cambiare nulla.
 */
export const environmentFileSchema = z.strictObject({
  connections: z.record(environmentKeySchema, connectionSchema.partial()).optional(),
  roles: z.record(
    environmentKeySchema,
    roleConfigFieldsSchema.partial().extend({
      routing: roleRoutingSchema.partial().optional(),
    }),
  ).optional(),
});

export type EnvironmentFile = z.infer<typeof environmentFileSchema>;

import { z } from 'zod';

import { assetIdSchema } from './ids.js';

/**
 * Riferimento a un file nella cartella del progetto: schede personaggio, immagini del set,
 * maschere, fotogrammi, immagini del moodboard. I file dei fornitori si copiano subito in locale,
 * quindi qui non c'è mai un link esterno (CLAUDE.md regola d'oro 11).
 */
export const assetRefSchema = z.object({
  assetId: assetIdSchema,
});

export type AssetRef = z.infer<typeof assetRefSchema>;

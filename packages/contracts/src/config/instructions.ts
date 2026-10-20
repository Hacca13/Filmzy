import { z } from 'zod';

import { configKeySchema, idSchema } from '../ids.js';

/**
 * L'intestazione di un file di istruzioni (architettura §4.4): `id`, `version`, `description`,
 * `variables` e `changelog` sono sempre presenti; `kind` segna i template per le immagini e i
 * suoni (una sola sezione `## prompt`); `variant` e `mode` sono delle varianti per famiglia.
 */
export const instructionHeaderSchema = z.object({
  id: idSchema,
  version: z.number().int().positive(),
  kind: z.enum(['image_prompt', 'audio_prompt']).optional(),
  variant: configKeySchema.optional(),
  mode: z.enum(['append', 'replace']).optional(),
  description: z.string().min(1),
  variables: z.array(z.string().min(1)),
  changelog: z.array(z.string().min(1)),
});

export type InstructionHeader = z.infer<typeof instructionHeaderSchema>;

/** Una variante per famiglia elencata nel manifesto (architettura §4.4, §5.6). */
export const instructionsManifestVariantSchema = z.object({
  family: configKeySchema,
  file: z.string().min(1),
  mode: z.enum(['append', 'replace']),
});

export type InstructionsManifestVariant = z.infer<typeof instructionsManifestVariantSchema>;

export const instructionsManifestVersionSchema = z.object({
  version: z.number().int().positive(),
  file: z.string().min(1),
  variants: z.array(instructionsManifestVariantSchema).optional(),
});

export type InstructionsManifestVersion = z.infer<typeof instructionsManifestVersionSchema>;

/**
 * Il `manifest.json` accanto ai file di istruzioni di un ruolo (architettura §4.4, §5.6):
 * `recommended` è la versione consigliata per chi non ha ancora scelto.
 */
export const instructionsManifestSchema = z
  .object({
    id: idSchema,
    recommended: z.number().int().positive(),
    versions: z.array(instructionsManifestVersionSchema).min(1),
  })
  .refine((manifest) => manifest.versions.some((v) => v.version === manifest.recommended), {
    message: 'la versione consigliata deve esistere tra le versioni elencate',
    path: ['recommended'],
  });

export type InstructionsManifest = z.infer<typeof instructionsManifestSchema>;

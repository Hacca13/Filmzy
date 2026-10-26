import { z } from 'zod';

import { configIssueSchema } from './config/issues.js';
import { instructionOriginSchema } from './config/release.js';
import { instructionsRefSchema } from './settings.js';

/**
 * Le richieste e le risposte delle Istruzioni (T2.4, architettura §4.4, D38): le versioni di ogni
 * ruolo (quelle del programma e quelle dell'utente), il controllo di un testo, la creazione di una
 * versione nuova e la scelta di quale usare.
 */

/**
 * Le versioni scritte dall'utente partono da qui, così non si scontrano mai con quelle che
 * arriveranno col programma (`screenwriter@2` è del programma, `screenwriter@101` è «le mie
 * istruzioni 1»): un aggiornamento non può prendere il posto di un file dell'utente.
 */
export const USER_INSTRUCTION_VERSION_BASE = 100;

export const instructionVersionInfoSchema = z.object({
  version: z.number().int().positive(),
  origin: instructionOriginSchema,
  /** Il nome per l'utente: «Versione 2» o «Le mie istruzioni 1». */
  label: z.string().min(1),
  description: z.string(),
  changelog: z.array(z.string()),
  /** Le parole del testo che il programma riempie: `{{ idea }}`, `{{ genre }}`… */
  variables: z.array(z.string()),
  /** Le famiglie di servizi che hanno una variante di questa versione. */
  variants: z.array(z.string()),
  createdAt: z.iso.datetime().optional(),
});

export type InstructionVersionInfo = z.infer<typeof instructionVersionInfoSchema>;

export const roleInstructionsSchema = z.object({
  roleId: z.string().min(1),
  /** L'id delle istruzioni (di norma il ruolo stesso). */
  instructionsId: z.string().min(1),
  label: z.string().min(1),
  /** La versione consigliata del programma, per chi non ha scelto. */
  recommended: z.number().int().positive(),
  /** La scelta dell'utente, se c'è. Senza, vale quella della release o la consigliata. */
  chosen: instructionsRefSchema.optional(),
  /** La versione che gira adesso. */
  inUse: z.number().int().positive(),
  /** Cosa può leggere un testo per questo ruolo: i campi del suo input. */
  availableVariables: z.array(z.string()),
  versions: z.array(instructionVersionInfoSchema),
});

export type RoleInstructions = z.infer<typeof roleInstructionsSchema>;

export const instructionsOverviewSchema = z.object({ roles: z.array(roleInstructionsSchema) });

export type InstructionsOverview = z.infer<typeof instructionsOverviewSchema>;

/** `GET /instructions/:roleId/versions/:version`: il testo base e le varianti, come scritti. */
export const instructionTextSchema = z.object({
  version: z.number().int().positive(),
  text: z.string(),
  variants: z.array(
    z.object({ family: z.string().min(1), mode: z.enum(['append', 'replace']), text: z.string() }),
  ),
});

export type InstructionText = z.infer<typeof instructionTextSchema>;

/** Un testo di istruzioni: abbastanza grande per un prompt lungo, non per un file qualsiasi. */
const instructionTextBodySchema = z.string().min(1).max(200_000);

/** `POST /instructions/:roleId/preview`: controlla un testo e lo rende con l'esempio fisso. */
export const previewInstructionsBodySchema = z.object({ text: instructionTextBodySchema });

export type PreviewInstructionsBody = z.infer<typeof previewInstructionsBodySchema>;

/** `rendered` c'è solo se il testo non ha errori; le sezioni sono quelle del file (`system`, `user`…). */
export const previewInstructionsResponseSchema = z.object({
  issues: z.array(configIssueSchema),
  rendered: z.record(z.string(), z.string()).optional(),
});

export type PreviewInstructionsResponse = z.infer<typeof previewInstructionsResponseSchema>;

/**
 * `POST /instructions/:roleId/versions`: salva un testo come versione nuova, senza toccare le
 * altre. Con `basedOn` porta con sé le varianti della versione di partenza.
 */
export const createInstructionVersionBodySchema = z.object({
  text: instructionTextBodySchema,
  basedOn: z.number().int().positive().optional(),
});

export type CreateInstructionVersionBody = z.infer<typeof createInstructionVersionBodySchema>;

/** Senza `version` non si è salvato niente: `issues` dice perché. */
export const createInstructionVersionResponseSchema = z.object({
  version: instructionVersionInfoSchema.optional(),
  issues: z.array(configIssueSchema),
});

export type CreateInstructionVersionResponse = z.infer<
  typeof createInstructionVersionResponseSchema
>;

/** `PUT /instructions/:roleId/choice`: `null` torna alla versione consigliata. */
export const chooseInstructionVersionBodySchema = z.object({
  version: z.number().int().positive().nullable(),
});

export type ChooseInstructionVersionBody = z.infer<typeof chooseInstructionVersionBodySchema>;

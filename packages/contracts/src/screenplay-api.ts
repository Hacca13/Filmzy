import { z } from 'zod';

import { idSchema, projectIdSchema } from './ids.js';
import { screenplaySchema } from './screenplay.js';
import { estimateSchema } from './spend.js';

/**
 * Le rotte della sceneggiatura (T3.4): la bozza scritta dallo sceneggiatore, le richieste di
 * modifica («Parla con lo sceneggiatore») e le versioni, che restano tutte consultabili.
 */

/** La bozza e la stesura ufficiale sono due tappe diverse dello stesso testo (architettura §3.1). */
export const SCREENPLAY_STAGES = ['draft', 'final'] as const;

export const screenplayStageSchema = z.enum(SCREENPLAY_STAGES);

export type ScreenplayStage = z.infer<typeof screenplayStageSchema>;

/** Quanto può essere lunga una richiesta di modifica, in caratteri. */
export const REVISION_REQUEST_MAX_LENGTH = 1000;

/**
 * Una versione della sceneggiatura, com'era quando è stata scritta. Le versioni non si cambiano e
 * non si cancellano: ogni richiesta ne crea una nuova e la precedente resta da rileggere.
 * `request` è la richiesta dell'utente che l'ha prodotta (assente per una bozza scritta da zero).
 */
export const screenplayVersionSchema = z.object({
  id: idSchema,
  projectId: projectIdSchema,
  stage: screenplayStageSchema,
  /** 1, 2, 3… per film e tappa. */
  version: z.number().int().positive(),
  screenplay: screenplaySchema,
  request: z.string().min(1).optional(),
  /** Lo scontrino della chiamata che l'ha scritta: da qui si legge quanto è costata e con cosa. */
  generationId: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
});

export type ScreenplayVersion = z.infer<typeof screenplayVersionSchema>;

/** La versione in elenco: abbastanza per riconoscerla, senza il testo intero. */
export const screenplayVersionSummarySchema = screenplayVersionSchema
  .omit({ screenplay: true })
  .extend({ title: z.string().min(1) });

export type ScreenplayVersionSummary = z.infer<typeof screenplayVersionSummarySchema>;

/** Le versioni di un film, dalla più recente. */
export const screenplayVersionsSchema = z.object({
  versions: z.array(screenplayVersionSummarySchema),
});

export type ScreenplayVersions = z.infer<typeof screenplayVersionsSchema>;

/** «Scrivi la bozza»: `spendConfirmed` dice che l'utente ha visto il limite di spesa e prosegue (D30). */
export const writeDraftBodySchema = z.strictObject({
  spendConfirmed: z.boolean().optional(),
});

export type WriteDraftBody = z.infer<typeof writeDraftBodySchema>;

/** «Parla con lo sceneggiatore»: una richiesta a turno singolo sull'ultima versione. */
export const reviseBodySchema = z.strictObject({
  request: z.string().trim().min(1).max(REVISION_REQUEST_MAX_LENGTH),
  spendConfirmed: z.boolean().optional(),
});

export type ReviseBody = z.infer<typeof reviseBodySchema>;

/** Quanto costerebbe, prima di chiederlo: la bozza da zero o una modifica (D30). */
export const screenplayEstimateBodySchema = z.strictObject({
  mode: z.enum(['draft', 'revise']),
  request: z.string().trim().max(REVISION_REQUEST_MAX_LENGTH).optional(),
});

export type ScreenplayEstimateBody = z.infer<typeof screenplayEstimateBodySchema>;

export const screenplayEstimateSchema = z.object({ estimate: estimateSchema });

export type ScreenplayEstimate = z.infer<typeof screenplayEstimateSchema>;

import { z } from 'zod';

import { assetIdSchema, idSchema } from './ids.js';
import { sheetImageStatusSchema } from './sheet-api.js';

/**
 * Il montaggio del film (T5.7, architettura §9): mette in fila i take scelti, mixa le tracce e aggiunge i
 * titoli con la dicitura AI. Non chiama nessun fornitore, quindi non costa niente e si può rifare. Si
 * lavora in coda, perché ricodificare è lungo (regola 9).
 */

/** Perché una scena non si può ancora montare. */
export const ASSEMBLY_GAP_KINDS = ['no_scenes', 'not_planned', 'stale', 'no_take'] as const;

export const assemblyGapSchema = z.object({
  /** Quale scena: manca solo per `no_scenes`, una storia senza scene. */
  sceneNumber: z.number().int().positive().optional(),
  kind: z.enum(ASSEMBLY_GAP_KINDS),
  /** Quante inquadrature della scena non hanno ancora un video (per `no_take`). */
  missing: z.number().int().positive().optional(),
});

export type AssemblyGap = z.infer<typeof assemblyGapSchema>;

export const filmAssemblySchema = z.object({
  id: idSchema,
  status: sheetImageStatusSchema,
  /** Il film montato, nella cartella del film. Solo se è riuscito. */
  assetId: assetIdSchema.optional(),
  durationS: z.number().positive().optional(),
  errorCode: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export type FilmAssembly = z.infer<typeof filmAssemblySchema>;

/** I titoli che il montaggio scriverà, così l'utente li legge prima. */
export const assemblyTitlesSchema = z.object({
  title: z.string().min(1),
  /** «Con Anna e Marco». Manca se il film non ha personaggi. */
  cast: z.string().min(1).optional(),
  /** La dicitura AI: c'è di default (D28). */
  aiNotice: z.string().min(1),
});

export type AssemblyTitles = z.infer<typeof assemblyTitlesSchema>;

/**
 * A che punto è il montaggio: cosa manca, l'ultimo tentativo, e se dopo è cambiato qualcosa. Una stesura
 * che non c'è ancora è «non trovato», come per le inquadrature.
 */
export const assemblyViewSchema = z.object({
  gaps: z.array(assemblyGapSchema),
  /** L'ultimo tentativo, com'è andato. */
  latest: filmAssemblySchema.optional(),
  /** L'ultimo film riuscito: un tentativo che fallisce o che sta lavorando non lo nasconde. */
  film: filmAssemblySchema.optional(),
  /** Quel film contiene tutto ciò che c'è adesso: niente è cambiato dopo. */
  upToDate: z.boolean(),
  titles: assemblyTitlesSchema,
});

export type AssemblyView = z.infer<typeof assemblyViewSchema>;

/** Cosa porta in coda il lavoro «monta il film» (`film_assemble`). */
export const assemblyJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  assemblyId: idSchema,
});

export type AssemblyJobPayload = z.infer<typeof assemblyJobPayloadSchema>;

import { z } from 'zod';

import { configKeySchema, projectIdSchema } from './ids.js';

/** Fasi di un progetto (architettura §3.1); si può sempre tornare a una fase precedente. */
export const PROJECT_PHASES = [
  'idea',
  'draft',
  'moodboard',
  'cast',
  'locations',
  'review',
  'final',
  'shots',
  'sound',
  'export',
] as const;

export const projectPhaseSchema = z.enum(PROJECT_PHASES);

export type ProjectPhase = z.infer<typeof projectPhaseSchema>;

/** Il riassunto di progetto che entra nella Bibbia (architettura §5.1). */
export const projectSummarySchema = z.object({
  id: projectIdSchema,
  title: z.string().min(1),
  idea: z.string().min(1),
  genre: z.string().min(1),
  tone: z.string().min(1),
  language: z.string().min(1),
  durationS: z.number().positive(),
});

export type ProjectSummary = z.infer<typeof projectSummarySchema>;

/** Quanto può essere lunga l'idea, in caratteri: è il contatore del wizard «La tua idea» (T3.2). */
export const IDEA_MAX_LENGTH = 2000;

export const TITLE_MAX_LENGTH = 80;

/**
 * Le durate tra cui si sceglie, in secondi. Sono un limite del programma e non un preset: la durata
 * decide quanto costa il film, e il backend deve poter dire di no a una cifra che non conosce.
 */
export const PROJECT_DURATIONS_S = [30, 60, 90, 120, 180] as const;

export const projectDurationSchema = z.literal(PROJECT_DURATIONS_S);

export type ProjectDuration = z.infer<typeof projectDurationSchema>;

/**
 * Il film come lo ricorda il programma (T3.2): il riassunto della Bibbia più lo stile e la
 * fotografia scelti (id dei preset), la fase a cui è arrivato e le date. La fase è quella da cui si
 * riprende (architettura §3.1). La durata è quella salvata, non una delle scelte di oggi: l'elenco
 * può cambiare e un film già fatto non deve diventare illeggibile.
 */
export const projectSchema = projectSummarySchema.extend({
  style: configKeySchema,
  cinematography: configKeySchema,
  phase: projectPhaseSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Project = z.infer<typeof projectSchema>;

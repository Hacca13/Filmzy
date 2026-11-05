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

/** Che film si vuole fare (D85). Mediometraggio e lungometraggio arrivano con la seconda versione. */
export const FILM_KINDS = ['spot', 'short', 'medium', 'feature'] as const;

export const filmKindSchema = z.enum(FILM_KINDS);

export type FilmKind = z.infer<typeof filmKindSchema>;

/**
 * Quanto può durare ogni tipo di film, in secondi (D85). Sono un limite del programma e non un preset: la
 * durata decide quanto costa il film, e lo sceneggiatore scrive tutto in una richiesta sola. Un lungometraggio
 * non ha un massimo. Il limite di 10 minuti del Corto è una stima da misurare con lo sceneggiatore vero.
 */
export const FILM_KIND_RANGES: Record<
  FilmKind,
  { minS: number; maxS?: number; stepS: number; defaultS: number; available: boolean }
> = {
  spot: { minS: 15, maxS: 60, stepS: 5, defaultS: 30, available: true },
  short: { minS: 60, maxS: 600, stepS: 30, defaultS: 60, available: true },
  medium: { minS: 600, maxS: 3600, stepS: 300, defaultS: 1800, available: false },
  feature: { minS: 3600, stepS: 600, defaultS: 5400, available: false },
};

/**
 * Il film come lo ricorda il programma (T3.2): il riassunto della Bibbia più lo stile e la
 * fotografia scelti (id dei preset), la fase a cui è arrivato e le date. La fase è quella da cui si
 * riprende (architettura §3.1). La durata è quella salvata, non una delle scelte di oggi: i limiti
 * possono cambiare e un film già fatto non deve diventare illeggibile.
 */
export const projectSchema = projectSummarySchema.extend({
  kind: filmKindSchema,
  style: configKeySchema,
  cinematography: configKeySchema,
  phase: projectPhaseSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Project = z.infer<typeof projectSchema>;

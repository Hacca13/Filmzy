import { z } from 'zod';

import { projectIdSchema } from './ids.js';

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

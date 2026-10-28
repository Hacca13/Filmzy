import { z } from 'zod';

import { configKeySchema } from './ids.js';
import {
  IDEA_MAX_LENGTH,
  projectDurationSchema,
  projectSchema,
  TITLE_MAX_LENGTH,
} from './project.js';

/**
 * Le rotte del film (T3.2): creare un film dal wizard «La tua idea», rileggerlo, cambiarne l'idea.
 * Le scelte (genere, tono, stile, fotografia) viaggiano come id dei preset; il backend controlla che
 * esistano e siano attivi (regola 8).
 */

/** Una voce da scegliere nel wizard: l'utente vede nome e, se c'è, una riga che la spiega. */
export const projectChoiceSchema = z.object({
  id: configKeySchema,
  label: z.string().min(1),
  description: z.string().min(1).optional(),
});

export type ProjectChoice = z.infer<typeof projectChoiceSchema>;

/** Cosa si può scegliere nel wizard: solo le voci attive dei preset, e i limiti dei campi. */
export const projectOptionsSchema = z.object({
  genres: z.array(projectChoiceSchema),
  tones: z.array(projectChoiceSchema),
  styles: z.array(projectChoiceSchema),
  cinematography: z.array(projectChoiceSchema),
  durationsS: z.array(projectDurationSchema),
  ideaMaxLength: z.number().int().positive(),
  titleMaxLength: z.number().int().positive(),
});

export type ProjectOptions = z.infer<typeof projectOptionsSchema>;

export const createProjectBodySchema = z.strictObject({
  idea: z.string().trim().min(1).max(IDEA_MAX_LENGTH),
  /** Vuoto o assente: lo propone il programma dalle prime parole dell'idea. */
  title: z.string().trim().max(TITLE_MAX_LENGTH).optional(),
  genre: configKeySchema,
  tone: configKeySchema,
  style: configKeySchema,
  cinematography: configKeySchema,
  durationS: projectDurationSchema,
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;

/** Cambia solo i campi presenti: l'idea si può rivedere in qualsiasi fase (architettura §3.1). */
export const updateProjectBodySchema = createProjectBodySchema.partial();

export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;

export const projectsListSchema = z.object({ projects: z.array(projectSchema) });

export type ProjectsList = z.infer<typeof projectsListSchema>;

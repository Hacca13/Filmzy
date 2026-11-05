import { z } from 'zod';

import { configKeySchema } from './ids.js';
import { filmKindSchema, IDEA_MAX_LENGTH, projectSchema, TITLE_MAX_LENGTH } from './project.js';

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

const filmLengthSchema = z.number().int().positive();

/** Un tipo di film da scegliere: quanto può durare e se si può già scegliere (D85). */
export const filmKindOptionSchema = z.object({
  id: filmKindSchema,
  minS: filmLengthSchema,
  /** Manca se non c'è un massimo. */
  maxS: filmLengthSchema.optional(),
  /** Di quanto si muove il cursore. */
  stepS: filmLengthSchema,
  /** Da quanto parte il cursore, scegliendo questo tipo. */
  defaultS: filmLengthSchema,
  /** Falso se arriva con la prossima versione: si vede, e non si può scegliere. */
  available: z.boolean(),
});

export type FilmKindOption = z.infer<typeof filmKindOptionSchema>;

/**
 * Le voci già scelte quando si apre il wizard, così per partire basta scrivere l'idea (T3.2). Le sceglie
 * il backend (regola 8): ogni campo manca solo se non c'è nessuna voce attiva da proporre.
 */
export const projectDefaultsSchema = z.object({
  genre: configKeySchema.optional(),
  tone: configKeySchema.optional(),
  style: configKeySchema.optional(),
  cinematography: configKeySchema.optional(),
  kind: filmKindSchema,
  durationS: filmLengthSchema,
});

export type ProjectDefaults = z.infer<typeof projectDefaultsSchema>;

/** Cosa si può scegliere nel wizard: solo le voci attive dei preset, e i limiti dei campi. */
export const projectOptionsSchema = z.object({
  genres: z.array(projectChoiceSchema),
  tones: z.array(projectChoiceSchema),
  styles: z.array(projectChoiceSchema),
  cinematography: z.array(projectChoiceSchema),
  kinds: z.array(filmKindOptionSchema),
  defaults: projectDefaultsSchema,
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
  /** Assente: si deduce dalla durata. Il backend controlla che la durata stia nei limiti del tipo. */
  kind: filmKindSchema.optional(),
  durationS: filmLengthSchema,
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;

/** Cambia solo i campi presenti: l'idea si può rivedere in qualsiasi fase (architettura §3.1). */
export const updateProjectBodySchema = createProjectBodySchema.partial();

export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;

export const projectsListSchema = z.object({ projects: z.array(projectSchema) });

/** Di quale durata si vuole il costo indicativo. */
export const filmEstimateQuerySchema = z.strictObject({
  durationS: z.coerce.number().int().positive(),
});

/**
 * Il costo indicativo di un film, per video e storyboard (D85). Lo calcola il server dal catalogo. Il numero
 * basso vale un video per inquadratura, quello alto li rifà tutti una volta. Se manca un servizio attivato la
 * stima non si può fare, e il film si può creare lo stesso.
 */
export const filmEstimateSchema = z.discriminatedUnion('available', [
  z.object({
    available: z.literal(true),
    lowUsd: z.number().nonnegative(),
    highUsd: z.number().nonnegative(),
  }),
  z.object({
    available: z.literal(false),
    reason: z.enum(['no_video_service', 'no_image_service']),
  }),
]);

export type FilmEstimate = z.infer<typeof filmEstimateSchema>;

export type ProjectsList = z.infer<typeof projectsListSchema>;

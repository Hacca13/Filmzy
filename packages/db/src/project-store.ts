import { randomUUID } from 'node:crypto';

import { projectSchema, type Project } from '@filmzy/contracts';
import { desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { projects, type ProjectRow } from './schema.js';

/** Quello che serve per creare un film: tutto tranne ciò che assegna il database. */
export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/** Quello che si può cambiare di un film già creato: ogni campo, uno per uno. */
export type ProjectChanges = Partial<NewProject>;

/**
 * I film nel database (architettura §3.1, §6). Quello che entra è già stato controllato dal
 * backend (preset esistenti, durata valida): qui si salva e si rilegge, e una riga che non torna
 * come `Project` fa un errore invece di sparire dall'elenco.
 */
export interface ProjectStore {
  create: (input: NewProject) => Project;
  get: (id: string) => Project | undefined;
  /** Gli ultimi toccati per primi. */
  list: () => Project[];
  /** Cambia i campi dati e aggiorna la data di modifica; `undefined` se il film non c'è. */
  update: (id: string, changes: ProjectChanges) => Project | undefined;
}

export interface ProjectStoreOptions {
  now?: () => Date;
}

function toProject(row: ProjectRow): Project {
  return projectSchema.parse({
    id: row.id,
    title: row.title,
    idea: row.idea,
    genre: row.genre,
    tone: row.tone,
    style: row.style,
    cinematography: row.cinematography,
    language: row.language,
    durationS: row.durationS,
    phase: row.phase,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  });
}

export function createProjectStore(db: FilmzyDb, options: ProjectStoreOptions = {}): ProjectStore {
  const now = options.now ?? (() => new Date());

  const get = (id: string): Project | undefined => {
    const row = db.select().from(projects).where(eq(projects.id, id)).get();
    return row === undefined ? undefined : toProject(row);
  };

  return {
    create(input) {
      const timestamp = now().getTime();
      const row = db
        .insert(projects)
        .values({ id: randomUUID(), ...input, createdAt: timestamp, updatedAt: timestamp })
        .returning()
        .get();
      return toProject(row);
    },
    get,
    list() {
      return db.select().from(projects).orderBy(desc(projects.updatedAt)).all().map(toProject);
    },
    update(id, changes) {
      if (get(id) === undefined) return undefined;
      db.update(projects)
        .set({ ...changes, updatedAt: now().getTime() })
        .where(eq(projects.id, id))
        .run();
      return get(id);
    },
  };
}

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
  /** Quando la fotografia del film è cambiata dopo la creazione (ms); `undefined` se non è mai cambiata (R4). */
  cinematographyChangedAt: (id: string) => number | undefined;
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
    kind: row.kind,
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
      const current = get(id);
      if (current === undefined) return undefined;
      const at = now().getTime();
      // Scegliere la stessa fotografia di prima non è un cambiamento: non avvisa niente (R4).
      const cinematographyChanged =
        changes.cinematography !== undefined && changes.cinematography !== current.cinematography;
      db.update(projects)
        .set({
          ...changes,
          updatedAt: at,
          ...(cinematographyChanged ? { cinematographyChangedAt: at } : {}),
        })
        .where(eq(projects.id, id))
        .run();
      return get(id);
    },

    cinematographyChangedAt(id) {
      const row = db
        .select({ at: projects.cinematographyChangedAt })
        .from(projects)
        .where(eq(projects.id, id))
        .get();
      return row?.at ?? undefined;
    },
  };
}

import { randomUUID } from 'node:crypto';

import {
  screenplaySchema,
  screenplayVersionSchema,
  type Screenplay,
  type ScreenplayStage,
  type ScreenplayVersion,
  type ScreenplayVersionSummary,
} from '@filmzy/contracts';
import { and, desc, eq, max } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { screenplays, type ScreenplayRow } from './schema.js';

export interface NewScreenplayVersion {
  projectId: string;
  stage: ScreenplayStage;
  screenplay: Screenplay;
  /** La richiesta dell'utente che l'ha prodotta; assente per una bozza scritta da zero. */
  request?: string;
  /** Lo scontrino della chiamata che l'ha scritta. */
  generationId?: string;
}

/**
 * Le versioni della sceneggiatura nel database (architettura §6). Si aggiunge e si legge, mai si
 * cambia o si cancella: la versione precedente deve restare da rileggere. Il numero di versione lo
 * assegna l'archivio, dentro la stessa operazione che scrive la riga, così due scritture insieme non
 * possono prendere lo stesso numero.
 */
export interface ScreenplayStore {
  create: (input: NewScreenplayVersion) => ScreenplayVersion;
  get: (id: string) => ScreenplayVersion | undefined;
  /** L'ultima versione del film in quella tappa. */
  latest: (projectId: string, stage: ScreenplayStage) => ScreenplayVersion | undefined;
  /** Tutte le versioni, dalla più recente, senza il testo intero. */
  list: (projectId: string, stage: ScreenplayStage) => ScreenplayVersionSummary[];
}

export interface ScreenplayStoreOptions {
  now?: () => Date;
}

function toVersion(row: ScreenplayRow): ScreenplayVersion {
  return screenplayVersionSchema.parse({
    id: row.id,
    projectId: row.projectId,
    stage: row.stage,
    version: row.version,
    screenplay: screenplaySchema.parse(JSON.parse(row.content)),
    ...(row.request === null ? {} : { request: row.request }),
    ...(row.generationId === null ? {} : { generationId: row.generationId }),
    createdAt: new Date(row.createdAt).toISOString(),
  });
}

function toSummary({ screenplay, ...rest }: ScreenplayVersion): ScreenplayVersionSummary {
  return { ...rest, title: screenplay.title };
}

export function createScreenplayStore(
  db: FilmzyDb,
  options: ScreenplayStoreOptions = {},
): ScreenplayStore {
  const now = options.now ?? (() => new Date());

  return {
    create(input) {
      return db.transaction((tx) => {
        const [last] = tx
          .select({ last: max(screenplays.version) })
          .from(screenplays)
          .where(
            and(eq(screenplays.projectId, input.projectId), eq(screenplays.stage, input.stage)),
          )
          .all();

        const row = tx
          .insert(screenplays)
          .values({
            id: randomUUID(),
            projectId: input.projectId,
            stage: input.stage,
            version: (last?.last ?? 0) + 1,
            content: JSON.stringify(input.screenplay),
            request: input.request ?? null,
            generationId: input.generationId ?? null,
            createdAt: now().getTime(),
          })
          .returning()
          .get();
        return toVersion(row);
      });
    },

    get(id) {
      const row = db.select().from(screenplays).where(eq(screenplays.id, id)).get();
      return row === undefined ? undefined : toVersion(row);
    },

    latest(projectId, stage) {
      const row = db
        .select()
        .from(screenplays)
        .where(and(eq(screenplays.projectId, projectId), eq(screenplays.stage, stage)))
        .orderBy(desc(screenplays.version))
        .limit(1)
        .get();
      return row === undefined ? undefined : toVersion(row);
    },

    list(projectId, stage) {
      return db
        .select()
        .from(screenplays)
        .where(and(eq(screenplays.projectId, projectId), eq(screenplays.stage, stage)))
        .orderBy(desc(screenplays.version))
        .all()
        .map((row) => toSummary(toVersion(row)));
    },
  };
}

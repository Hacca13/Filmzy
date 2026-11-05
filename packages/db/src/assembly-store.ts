import { randomUUID } from 'node:crypto';

import { filmAssemblySchema, type FilmAssembly, type SheetImageStatus } from '@filmzy/contracts';
import { desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { filmAssemblies, type FilmAssemblyRow } from './schema.js';

export interface AssemblyPatch {
  status: SheetImageStatus;
  assetId?: string;
  durationS?: number;
  errorCode?: string;
}

/** Un tentativo col film a cui appartiene e con ciò che conteneva. */
export interface StoredAssembly {
  projectId: string;
  /** L'impronta di ciò che è entrato nel film: se cambia, il film montato è indietro. */
  fingerprint: string;
  assembly: FilmAssembly;
}

/** I montaggi di un film (T5.7): si legge l'ultimo, perché il film si rifà da capo ogni volta. */
export interface AssemblyStore {
  start: (projectId: string, fingerprint: string) => FilmAssembly;
  finish: (assemblyId: string, patch: AssemblyPatch) => void;
  get: (assemblyId: string) => StoredAssembly | undefined;
  latest: (projectId: string) => StoredAssembly | undefined;
}

export interface AssemblyStoreOptions {
  now?: () => Date;
}

function toStored(row: FilmAssemblyRow): StoredAssembly {
  return {
    projectId: row.projectId,
    fingerprint: row.fingerprint,
    assembly: filmAssemblySchema.parse({
      id: row.id,
      status: row.status,
      ...(row.assetId === null ? {} : { assetId: row.assetId }),
      ...(row.durationS === null ? {} : { durationS: row.durationS }),
      ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
      createdAt: new Date(row.createdAt).toISOString(),
    }),
  };
}

export function createAssemblyStore(
  db: FilmzyDb,
  options: AssemblyStoreOptions = {},
): AssemblyStore {
  const now = options.now ?? (() => new Date());

  return {
    start(projectId, fingerprint) {
      const at = now().getTime();
      const row = db
        .insert(filmAssemblies)
        .values({
          id: randomUUID(),
          projectId,
          status: 'queued',
          fingerprint,
          createdAt: at,
          updatedAt: at,
        })
        .returning()
        .get();
      return toStored(row).assembly;
    },

    finish(assemblyId, patch) {
      db.update(filmAssemblies)
        .set({
          status: patch.status,
          assetId: patch.assetId ?? null,
          durationS: patch.durationS ?? null,
          errorCode: patch.errorCode ?? null,
          updatedAt: now().getTime(),
        })
        .where(eq(filmAssemblies.id, assemblyId))
        .run();
    },

    get(assemblyId) {
      const row = db.select().from(filmAssemblies).where(eq(filmAssemblies.id, assemblyId)).get();
      return row === undefined ? undefined : toStored(row);
    },

    latest(projectId) {
      const row = db
        .select()
        .from(filmAssemblies)
        .where(eq(filmAssemblies.projectId, projectId))
        .orderBy(desc(filmAssemblies.createdAt))
        .limit(1)
        .get();
      return row === undefined ? undefined : toStored(row);
    },
  };
}

import { randomUUID } from 'node:crypto';

import { filmExportSchema, type FilmExport, type SheetImageStatus } from '@filmzy/contracts';
import { and, desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { filmExports, type FilmExportRow } from './schema.js';

export interface ExportPatch {
  status: SheetImageStatus;
  /** Il nome del file nella cartella delle esportazioni. Solo se è riuscita. */
  fileName?: string;
  errorCode?: string;
}

/** Un tentativo col film a cui appartiene e col file da cui parte. */
export interface StoredExport {
  projectId: string;
  /** Il film montato da esportare (il suo id nel registro dei file). */
  sourceAssetId: string;
  fileName?: string;
  /** L'ultimo segno di vita (ms): un'esportazione ferma da troppo tempo si è persa. */
  lastActivityAt: number;
  export: FilmExport;
}

/** Le esportazioni di un film (T5.8): contano l'ultimo tentativo e l'ultimo file riuscito. */
export interface ExportStore {
  start: (projectId: string, request: { sourceAssetId: string; shortSide: number }) => FilmExport;
  finish: (exportId: string, patch: ExportPatch) => void;
  get: (exportId: string) => StoredExport | undefined;
  latest: (projectId: string) => StoredExport | undefined;
  /** L'ultimo riuscito: un tentativo che fallisce non toglie il file di prima. */
  lastSucceeded: (projectId: string) => StoredExport | undefined;
}

export interface ExportStoreOptions {
  now?: () => Date;
}

function toStored(row: FilmExportRow): StoredExport {
  return {
    projectId: row.projectId,
    sourceAssetId: row.sourceAssetId,
    ...(row.fileName === null ? {} : { fileName: row.fileName }),
    lastActivityAt: row.updatedAt,
    export: filmExportSchema.parse({
      id: row.id,
      status: row.status,
      shortSide: row.shortSide,
      ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
      createdAt: new Date(row.createdAt).toISOString(),
    }),
  };
}

export function createExportStore(db: FilmzyDb, options: ExportStoreOptions = {}): ExportStore {
  const now = options.now ?? (() => new Date());

  return {
    start(projectId, { sourceAssetId, shortSide }) {
      const at = now().getTime();
      const row = db
        .insert(filmExports)
        .values({
          id: randomUUID(),
          projectId,
          status: 'queued',
          sourceAssetId,
          shortSide,
          createdAt: at,
          updatedAt: at,
        })
        .returning()
        .get();
      return toStored(row).export;
    },

    finish(exportId, patch) {
      db.update(filmExports)
        .set({
          status: patch.status,
          fileName: patch.fileName ?? null,
          errorCode: patch.errorCode ?? null,
          updatedAt: now().getTime(),
        })
        .where(eq(filmExports.id, exportId))
        .run();
    },

    get(exportId) {
      const row = db.select().from(filmExports).where(eq(filmExports.id, exportId)).get();
      return row === undefined ? undefined : toStored(row);
    },

    latest(projectId) {
      const row = db
        .select()
        .from(filmExports)
        .where(eq(filmExports.projectId, projectId))
        .orderBy(desc(filmExports.createdAt))
        .limit(1)
        .get();
      return row === undefined ? undefined : toStored(row);
    },

    lastSucceeded(projectId) {
      const row = db
        .select()
        .from(filmExports)
        .where(and(eq(filmExports.projectId, projectId), eq(filmExports.status, 'succeeded')))
        .orderBy(desc(filmExports.createdAt))
        .limit(1)
        .get();
      return row === undefined ? undefined : toStored(row);
    },
  };
}

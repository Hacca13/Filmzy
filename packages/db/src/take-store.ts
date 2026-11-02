import { randomUUID } from 'node:crypto';

import {
  sheetImageStatusSchema,
  shotTakeSchema,
  type SheetImageStatus,
  type ShotTake,
} from '@filmzy/contracts';
import { and, desc, eq, gte, inArray, isNotNull } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { shots, takes, type TakeRow } from './schema.js';

/** Un take appena chiesto: il servizio che lo farà, scelto dall'utente (D36). */
export interface NewTake {
  modelId: string;
  modelLabel: string;
}

/** Cosa si può dire di un take mentre il lavoro avanza. */
export interface TakePatch {
  status: SheetImageStatus;
  assetId?: string;
  receiptId?: string;
  costUsd?: number;
  errorCode?: string;
  /** Il servizio che ha lavorato davvero, preso dallo scontrino (D36). Senza, resta quello scelto. */
  modelId?: string;
  modelLabel?: string;
}

/** Un take con l'inquadratura a cui appartiene. */
export interface StoredTake {
  shotId: string;
  take: ShotTake;
}

/**
 * I take video (T4.3, architettura §5.2, §7). Ogni richiesta è un take, in coda finché il lavoro non
 * parte; riuscito porta la clip, il costo reale e il servizio che ha lavorato; fallito dice perché.
 * Rigenerare con un altro servizio dà un altro take: quelli di prima restano.
 */
export interface TakeStore {
  /** Apre un take in coda per l'inquadratura. */
  start: (shotId: string, service: NewTake) => ShotTake;
  /** Aggiorna un take; `false` se non c'è più (l'inquadratura è stata rifatta). */
  finish: (takeId: string, patch: TakePatch) => boolean;
  get: (takeId: string) => StoredTake | undefined;
  /** I take di un'inquadratura dal più recente. */
  list: (shotId: string) => ShotTake[];
  /** La clip del take riuscito più recente di ogni inquadratura del film che ne ha una. */
  latestClips: (projectId: string) => Record<string, string>;
  /** Le inquadrature del film con un take in coda o in lavorazione adesso (non più vecchio di `since`: uno più vecchio si è perso). */
  inProgress: (projectId: string, since: Date) => string[];
}

export interface TakeStoreOptions {
  now?: () => Date;
}

function toTake(row: TakeRow): ShotTake {
  return shotTakeSchema.parse({
    id: row.id,
    status: sheetImageStatusSchema.parse(row.status),
    modelId: row.modelId,
    modelLabel: row.modelLabel,
    ...(row.assetId === null ? {} : { assetId: row.assetId }),
    ...(row.costUsd === null ? {} : { costUsd: row.costUsd }),
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
    createdAt: new Date(row.createdAt).toISOString(),
  });
}

export function createTakeStore(db: FilmzyDb, options: TakeStoreOptions = {}): TakeStore {
  const now = options.now ?? (() => new Date());

  const shotIdsOf = (projectId: string): string[] =>
    db
      .select({ id: shots.id })
      .from(shots)
      .where(eq(shots.projectId, projectId))
      .all()
      .map((shot) => shot.id);

  return {
    start(shotId, service) {
      const at = now().getTime();
      const row: TakeRow = {
        id: randomUUID(),
        shotId,
        status: 'queued',
        modelId: service.modelId,
        modelLabel: service.modelLabel,
        assetId: null,
        receiptId: null,
        costUsd: null,
        errorCode: null,
        createdAt: at,
        updatedAt: at,
      };
      db.insert(takes).values(row).run();
      return toTake(row);
    },

    finish(takeId, patch) {
      const { changes } = db
        .update(takes)
        .set({
          status: patch.status,
          assetId: patch.assetId ?? null,
          receiptId: patch.receiptId ?? null,
          costUsd: patch.costUsd ?? null,
          errorCode: patch.errorCode ?? null,
          ...(patch.modelId === undefined ? {} : { modelId: patch.modelId }),
          ...(patch.modelLabel === undefined ? {} : { modelLabel: patch.modelLabel }),
          updatedAt: now().getTime(),
        })
        .where(eq(takes.id, takeId))
        .run();
      return changes > 0;
    },

    get(takeId) {
      const row = db.select().from(takes).where(eq(takes.id, takeId)).get();
      return row === undefined ? undefined : { shotId: row.shotId, take: toTake(row) };
    },

    list(shotId) {
      return db
        .select()
        .from(takes)
        .where(eq(takes.shotId, shotId))
        .orderBy(desc(takes.createdAt), desc(takes.id))
        .all()
        .map(toTake);
    },

    inProgress(projectId, since) {
      const shotIds = shotIdsOf(projectId);
      if (shotIds.length === 0) return [];

      const rows = db
        .selectDistinct({ shotId: takes.shotId })
        .from(takes)
        .where(
          and(
            inArray(takes.shotId, shotIds),
            inArray(takes.status, ['queued', 'running']),
            gte(takes.createdAt, since.getTime()),
          ),
        )
        .all();
      return rows.map((row) => row.shotId);
    },

    latestClips(projectId) {
      const shotIds = shotIdsOf(projectId);
      if (shotIds.length === 0) return {};

      const rows = db
        .select()
        .from(takes)
        .where(
          and(
            inArray(takes.shotId, shotIds),
            eq(takes.status, 'succeeded'),
            isNotNull(takes.assetId),
          ),
        )
        .orderBy(desc(takes.createdAt), desc(takes.id))
        .all();
      // Dal più recente: la prima clip incontrata per un'inquadratura è la sua più recente.
      const latest: Record<string, string> = {};
      for (const row of rows) {
        if (row.assetId !== null && latest[row.shotId] === undefined)
          latest[row.shotId] = row.assetId;
      }
      return latest;
    },
  };
}

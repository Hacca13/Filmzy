import { randomUUID } from 'node:crypto';

import {
  sheetImageStatusSchema,
  shotTakeSchema,
  type SheetImageStatus,
  type ShotTake,
} from '@filmzy/contracts';
import { and, desc, eq, gte, inArray, isNotNull } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { shots, takeFrames, takes, type TakeFrameRow, type TakeRow } from './schema.js';

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

/** Un fotogramma preso da un take: il momento (secondi) e l'immagine che ne è venuta. */
export interface TakeFrame {
  id: string;
  shotId: string;
  takeId: string;
  atS: number;
  assetId: string;
  createdAt: string;
}

export type NewTakeFrame = Omit<TakeFrame, 'id' | 'createdAt'>;

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
  /** Sceglie il take da tenere per l'inquadratura, o toglie la scelta con `undefined` (torna a valere il più recente). */
  choose: (shotId: string, takeId: string | undefined) => void;
  /** Salva un fotogramma preso da un take (T4.6): il file è già un'immagine registrata. */
  addFrame: (frame: NewTakeFrame) => TakeFrame;
  /** I fotogrammi presi dai take di un'inquadratura, dal più recente. */
  frames: (shotId: string) => TakeFrame[];
  /** La clip che la card fa vedere per ogni inquadratura del film che ne ha una: quella del take scelto, o del più recente riuscito. */
  latestClips: (projectId: string) => Record<string, string>;
  /**
   * Quando è **partito** il take che la card fa vedere (quello scelto, o il più recente riuscito), per ogni
   * inquadratura del film che ne ha uno (ms). Un take legge i suoi ingressi all'inizio: ciò che cambia mentre
   * gira non è nel video.
   */
  lastTakeAt: (projectId: string) => Record<string, number>;
  /** Le inquadrature del film con un take in coda o in lavorazione adesso (non più vecchio di `since`: uno più vecchio si è perso). */
  inProgress: (projectId: string, since: Date) => string[];
}

export interface TakeStoreOptions {
  now?: () => Date;
}

const toFrame = (row: Omit<TakeFrameRow, 'createdAt'> & { createdAt: number }): TakeFrame => ({
  id: row.id,
  shotId: row.shotId,
  takeId: row.takeId,
  atS: row.atS,
  assetId: row.assetId,
  createdAt: new Date(row.createdAt).toISOString(),
});

function toTake(row: TakeRow, chosen: boolean): ShotTake {
  return shotTakeSchema.parse({
    chosen,
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

  /** Il take scelto di un'inquadratura, se ce n'è uno. */
  const chosenOf = (shotId: string): string | undefined =>
    db.select({ id: shots.chosenTakeId }).from(shots).where(eq(shots.id, shotId)).get()?.id ??
    undefined;

  /** Il take scelto di ogni inquadratura che ne ha uno. */
  const chosenTakesOf = (shotIds: string[]): Map<string, string> =>
    new Map(
      db
        .select({ id: shots.id, take: shots.chosenTakeId })
        .from(shots)
        .where(inArray(shots.id, shotIds))
        .all()
        .flatMap((shot) => (shot.take === null ? [] : [[shot.id, shot.take] as const])),
    );

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
      return toTake(row, false);
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
      return row === undefined
        ? undefined
        : { shotId: row.shotId, take: toTake(row, chosenOf(row.shotId) === row.id) };
    },

    list(shotId) {
      const chosen = chosenOf(shotId);
      return db
        .select()
        .from(takes)
        .where(eq(takes.shotId, shotId))
        .orderBy(desc(takes.createdAt), desc(takes.id))
        .all()
        .map((row) => toTake(row, row.id === chosen));
    },

    choose(shotId, takeId) {
      db.update(shots)
        .set({ chosenTakeId: takeId ?? null })
        .where(eq(shots.id, shotId))
        .run();
    },

    addFrame(frame) {
      const row = { id: randomUUID(), createdAt: now().getTime(), ...frame };
      db.insert(takeFrames).values(row).run();
      return toFrame(row);
    },

    frames(shotId) {
      return db
        .select()
        .from(takeFrames)
        .where(eq(takeFrames.shotId, shotId))
        .orderBy(desc(takeFrames.createdAt), desc(takeFrames.id))
        .all()
        .map(toFrame);
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

    lastTakeAt(projectId) {
      const shotIds = shotIdsOf(projectId);
      if (shotIds.length === 0) return {};

      const chosenIds = chosenTakesOf(shotIds);
      const latest: Record<string, number> = {};
      const chosen: Record<string, number> = {};
      for (const row of db
        .select({ id: takes.id, shotId: takes.shotId, at: takes.createdAt })
        .from(takes)
        .where(and(inArray(takes.shotId, shotIds), eq(takes.status, 'succeeded')))
        .all()) {
        latest[row.shotId] = Math.max(latest[row.shotId] ?? 0, row.at);
        if (chosenIds.get(row.shotId) === row.id) chosen[row.shotId] = row.at;
      }
      return { ...latest, ...chosen };
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
      // Dal più recente: la prima clip incontrata per un'inquadratura è la sua più recente. Ma se
      // l'utente ne ha scelto un'altra (e riuscita) vale quella.
      const chosenIds = chosenTakesOf(shotIds);
      const latest: Record<string, string> = {};
      const chosen: Record<string, string> = {};
      for (const row of rows) {
        if (row.assetId === null) continue;
        if (latest[row.shotId] === undefined) latest[row.shotId] = row.assetId;
        if (chosenIds.get(row.shotId) === row.id) chosen[row.shotId] = row.assetId;
      }
      return { ...latest, ...chosen };
    },
  };
}

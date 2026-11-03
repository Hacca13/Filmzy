import { randomUUID } from 'node:crypto';

import {
  shotStoryboardSchema,
  shotSpecSchema,
  storyboardModeSchema,
  sheetImageStatusSchema,
  storyboardAttemptSchema,
  type ShotSpec,
  type ShotStoryboard,
  type StoryboardMode,
} from '@filmzy/contracts';
import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm';

import type { AttemptPatch } from './location-store.js';
import type { FilmzyDb } from './open.js';
import {
  shotPlans,
  shots,
  storyboardAttempts,
  takes,
  type ShotPlanRow,
  type ShotRow,
  type StoryboardAttemptRow,
} from './schema.js';

/** Il piano di una scena come si salva: da dove è nato, chi l'ha pensato e le inquadrature. */
export interface NewShotPlan {
  projectId: string;
  sceneNumber: number;
  /** Un'impronta del testo della scena quando è stato pensato: se cambia, il piano è vecchio. */
  sceneHash: string;
  /** La versione della stesura da cui è nato. */
  screenplayId: string;
  /** Lo scontrino della chiamata dell'aiuto regista. */
  generationId?: string;
  /** Ciò che l'aiuto regista ha spiegato (per esempio perché cambia la fotografia). */
  notes?: string;
  shots: ShotSpec[];
}

export interface StoredShotPlan extends Omit<NewShotPlan, 'projectId'> {
  createdAt: string;
}

/** Un'inquadratura con il film e la scena a cui appartiene. */
export interface StoredShot {
  projectId: string;
  sceneNumber: number;
  spec: ShotSpec;
}

/**
 * Le inquadrature dei film (T3.9, architettura §6). Un piano per scena: pensarlo di nuovo lo
 * **sostituisce** (le inquadrature vecchie non restano), tutto in una sola operazione, così una
 * scena non resta mai a metà fra due piani.
 */
export interface ShotStore {
  replaceScene: (plan: NewShotPlan) => StoredShotPlan;
  /** I piani del film, per numero di scena. */
  plans: (projectId: string) => StoredShotPlan[];
  plan: (projectId: string, sceneNumber: number) => StoredShotPlan | undefined;
  /** Il piano della scena pensata più vicina **prima** di questa, se c'è (per l'uscita da cui si riparte). */
  planBefore: (projectId: string, sceneNumber: number) => StoredShotPlan | undefined;
  get: (shotId: string) => StoredShot | undefined;
  /** Cambia la scheda di un'inquadratura (per esempio il movimento di macchina); `false` se non c'è più. */
  updateSpec: (shotId: string, spec: ShotSpec) => boolean;
  /** Apre un nuovo tentativo (in coda) dello storyboard o dell'ultimo fotogramma e ne dà il numero. */
  startStoryboard: (shotId: string, mode: StoryboardMode, modelLabel?: string) => number;
  finishStoryboard: (
    shotId: string,
    mode: StoryboardMode,
    attempt: number,
    patch: AttemptPatch,
  ) => void;
  /**
   * I tentativi di un modo dal più recente. La variante scelta (`chosenAssetId`) c'è solo per lo
   * storyboard: quella dell'ultimo fotogramma è l'immagine impostata nella scheda (`images`).
   */
  storyboard: (shotId: string, mode: StoryboardMode) => ShotStoryboard;
  /** Sceglie la variante che resta come riferimento visivo dell'inquadratura, o la toglie con `undefined`. */
  chooseStoryboard: (shotId: string, assetId: string | undefined) => void;
  /** La variante scelta di ogni inquadratura del film che ne ha una. */
  chosenStoryboards: (projectId: string) => Record<string, string>;
  /** Cosa si sta disegnando adesso (tentativo in coda o in lavorazione) per ogni inquadratura del film; l'ultimo fotogramma vince sullo storyboard. */
  drawing: (projectId: string, since: Date) => Record<string, StoryboardMode>;
}

export interface ShotStoreOptions {
  now?: () => Date;
}

/** I tentativi di un'inquadratura per un modo (storyboard o ultimo fotogramma). */
const inMode = (shotId: string, mode: StoryboardMode) =>
  and(eq(storyboardAttempts.shotId, shotId), eq(storyboardAttempts.mode, mode));

const toSpec = (row: ShotRow): ShotSpec => shotSpecSchema.parse(JSON.parse(row.spec));

function toAttempt(row: StoryboardAttemptRow) {
  const assetIds: unknown = JSON.parse(row.assetIds);
  return storyboardAttemptSchema.parse({
    attempt: row.attempt,
    status: sheetImageStatusSchema.parse(row.status),
    createdAt: new Date(row.createdAt).toISOString(),
    assetIds,
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
    ...(row.modelLabel === null ? {} : { modelLabel: row.modelLabel }),
    ...(row.costUsd === null ? {} : { costUsd: row.costUsd }),
  });
}

function toPlan(row: ShotPlanRow, planShots: ShotRow[]): StoredShotPlan {
  return {
    sceneNumber: row.sceneNumber,
    sceneHash: row.sceneHash,
    screenplayId: row.screenplayId,
    ...(row.generationId === null ? {} : { generationId: row.generationId }),
    ...(row.notes === null ? {} : { notes: row.notes }),
    shots: planShots.map(toSpec),
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export function createShotStore(db: FilmzyDb, options: ShotStoreOptions = {}): ShotStore {
  const now = options.now ?? (() => new Date());

  const shotRows = (projectId: string, sceneNumber: number): ShotRow[] =>
    db
      .select()
      .from(shots)
      .where(and(eq(shots.projectId, projectId), eq(shots.sceneNumber, sceneNumber)))
      .orderBy(asc(shots.position))
      .all();

  const planRow = (projectId: string, sceneNumber: number): ShotPlanRow | undefined =>
    db
      .select()
      .from(shotPlans)
      .where(and(eq(shotPlans.projectId, projectId), eq(shotPlans.sceneNumber, sceneNumber)))
      .get();

  return {
    replaceScene(plan) {
      return db.transaction((tx) => {
        const scene = and(
          eq(shots.projectId, plan.projectId),
          eq(shots.sceneNumber, plan.sceneNumber),
        );
        // Le inquadrature di prima spariscono con i loro tentativi di storyboard e i loro take: i file restano.
        const removed = tx
          .select({ id: shots.id })
          .from(shots)
          .where(scene)
          .all()
          .map((shot) => shot.id);
        if (removed.length > 0) {
          tx.delete(storyboardAttempts).where(inArray(storyboardAttempts.shotId, removed)).run();
          tx.delete(takes).where(inArray(takes.shotId, removed)).run();
        }
        tx.delete(shots).where(scene).run();
        tx.delete(shotPlans)
          .where(
            and(
              eq(shotPlans.projectId, plan.projectId),
              eq(shotPlans.sceneNumber, plan.sceneNumber),
            ),
          )
          .run();

        const saved = tx
          .insert(shotPlans)
          .values({
            projectId: plan.projectId,
            sceneNumber: plan.sceneNumber,
            sceneHash: plan.sceneHash,
            screenplayId: plan.screenplayId,
            generationId: plan.generationId ?? null,
            notes: plan.notes ?? null,
            createdAt: now().getTime(),
          })
          .returning()
          .get();
        const rows = plan.shots.map((spec, position) =>
          tx
            .insert(shots)
            .values({
              id: spec.id,
              projectId: plan.projectId,
              sceneNumber: plan.sceneNumber,
              position,
              spec: JSON.stringify(spec),
            })
            .returning()
            .get(),
        );
        return toPlan(saved, rows);
      });
    },

    plans(projectId) {
      return db
        .select()
        .from(shotPlans)
        .where(eq(shotPlans.projectId, projectId))
        .orderBy(asc(shotPlans.sceneNumber))
        .all()
        .map((row) => toPlan(row, shotRows(projectId, row.sceneNumber)));
    },

    plan(projectId, sceneNumber) {
      const row = planRow(projectId, sceneNumber);
      return row === undefined ? undefined : toPlan(row, shotRows(projectId, sceneNumber));
    },

    planBefore(projectId, sceneNumber) {
      const row = db
        .select()
        .from(shotPlans)
        .where(and(eq(shotPlans.projectId, projectId), lt(shotPlans.sceneNumber, sceneNumber)))
        .orderBy(desc(shotPlans.sceneNumber))
        .limit(1)
        .get();
      return row === undefined ? undefined : toPlan(row, shotRows(projectId, row.sceneNumber));
    },

    get(shotId) {
      const row = db.select().from(shots).where(eq(shots.id, shotId)).get();
      return row === undefined
        ? undefined
        : { projectId: row.projectId, sceneNumber: row.sceneNumber, spec: toSpec(row) };
    },

    updateSpec(shotId, spec) {
      const { changes } = db
        .update(shots)
        .set({ spec: JSON.stringify(spec) })
        .where(eq(shots.id, shotId))
        .run();
      return changes > 0;
    },

    startStoryboard(shotId, mode, modelLabel) {
      return db.transaction((tx) => {
        const last = tx
          .select({ attempt: storyboardAttempts.attempt })
          .from(storyboardAttempts)
          .where(inMode(shotId, mode))
          .orderBy(desc(storyboardAttempts.attempt))
          .limit(1)
          .get();
        const attempt = (last?.attempt ?? 0) + 1;
        const at = now().getTime();
        tx.insert(storyboardAttempts)
          .values({
            id: randomUUID(),
            shotId,
            mode,
            attempt,
            status: 'queued',
            assetIds: '[]',
            ...(modelLabel === undefined ? {} : { modelLabel }),
            createdAt: at,
            updatedAt: at,
          })
          .run();
        return attempt;
      });
    },

    finishStoryboard(shotId, mode, attempt, patch) {
      db.update(storyboardAttempts)
        .set({
          status: patch.status,
          assetIds: JSON.stringify(patch.assetIds ?? []),
          receiptId: patch.receiptId ?? null,
          errorCode: patch.errorCode ?? null,
          costUsd: patch.costUsd ?? null,
          ...(patch.modelLabel === undefined ? {} : { modelLabel: patch.modelLabel }),
          updatedAt: now().getTime(),
        })
        .where(and(inMode(shotId, mode), eq(storyboardAttempts.attempt, attempt)))
        .run();
    },

    storyboard(shotId, mode) {
      const attempts = db
        .select()
        .from(storyboardAttempts)
        .where(inMode(shotId, mode))
        .orderBy(desc(storyboardAttempts.attempt))
        .all()
        .map(toAttempt);
      const chosen =
        mode === 'storyboard'
          ? db.select().from(shots).where(eq(shots.id, shotId)).get()?.chosenAssetId
          : undefined;
      return shotStoryboardSchema.parse({
        shotId,
        attempts,
        ...(chosen === null || chosen === undefined ? {} : { chosenAssetId: chosen }),
      });
    },

    chooseStoryboard(shotId, assetId) {
      db.update(shots)
        .set({ chosenAssetId: assetId ?? null })
        .where(eq(shots.id, shotId))
        .run();
    },

    drawing(projectId, since) {
      const shotIds = db
        .select({ id: shots.id })
        .from(shots)
        .where(eq(shots.projectId, projectId))
        .all()
        .map((shot) => shot.id);
      if (shotIds.length === 0) return {};

      const rows = db
        .select()
        .from(storyboardAttempts)
        .where(
          and(
            inArray(storyboardAttempts.shotId, shotIds),
            inArray(storyboardAttempts.status, ['queued', 'running']),
            gte(storyboardAttempts.createdAt, since.getTime()),
          ),
        )
        .all();
      const drawing: Record<string, StoryboardMode> = {};
      for (const row of rows) {
        // Un modo che non conosciamo si salta: è solo un'indicazione per la card, non deve rompere il piano.
        const mode = storyboardModeSchema.safeParse(row.mode);
        if (!mode.success) continue;
        if (drawing[row.shotId] === undefined || mode.data === 'end_frame') {
          drawing[row.shotId] = mode.data;
        }
      }
      return drawing;
    },

    chosenStoryboards(projectId) {
      const rows = db.select().from(shots).where(eq(shots.projectId, projectId)).all();
      return Object.fromEntries(
        rows.flatMap((row) => (row.chosenAssetId === null ? [] : [[row.id, row.chosenAssetId]])),
      );
    },
  };
}

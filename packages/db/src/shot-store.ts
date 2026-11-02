import { shotSpecSchema, type ShotSpec } from '@filmzy/contracts';
import { and, asc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { shotPlans, shots, type ShotPlanRow, type ShotRow } from './schema.js';

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
  get: (shotId: string) => StoredShot | undefined;
  /** Cambia la scheda di un'inquadratura (per esempio il movimento di macchina). */
  updateSpec: (shotId: string, spec: ShotSpec) => void;
}

export interface ShotStoreOptions {
  now?: () => Date;
}

const toSpec = (row: ShotRow): ShotSpec => shotSpecSchema.parse(JSON.parse(row.spec));

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

    get(shotId) {
      const row = db.select().from(shots).where(eq(shots.id, shotId)).get();
      return row === undefined
        ? undefined
        : { projectId: row.projectId, sceneNumber: row.sceneNumber, spec: toSpec(row) };
    },

    updateSpec(shotId, spec) {
      db.update(shots)
        .set({ spec: JSON.stringify(spec) })
        .where(eq(shots.id, shotId))
        .run();
    },
  };
}

import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

import {
  colorSchema,
  moodReferenceSchema,
  moodboardRunSchema,
  type Color,
  type Moodboard,
  type MoodboardPart,
  type MoodboardRun,
  type MoodReference,
} from '@filmzy/contracts';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import type { FilmzyDb } from './open.js';
import {
  moodboardReferences,
  moodboardRuns,
  moodboardScenes,
  moodboards,
  type MoodboardReferenceRow,
  type MoodboardRunRow,
} from './schema.js';

/** Palette e consigli di una parte (film o scena): le immagini sono a parte. */
export interface MoodboardText {
  palette: Color[];
  notes: string;
}

/** Quando palette e consigli sono cambiati l'ultima volta (ms): serve alla regola R9 (D37). */
export interface MoodboardChanges {
  film?: number;
  scenes: Record<string, number>;
}

/**
 * Il moodboard nel database (T4.10, D37): una riga per il film e una per ogni scena che ha una parte
 * sua, più i riferimenti. Una parte senza colori, consigli né immagini non esiste: per una scena
 * vuol dire che vale quella del film. Palette e consigli si correggono a mano (\`saveText\`), i
 * riferimenti si aggiungono e si tolgono uno alla volta.
 */
export interface MoodboardStore {
  get: (projectId: string) => Moodboard;
  /** Sostituisce palette e consigli della parte (anche vuoti: la riga resta, ricorda il cambiamento). `sceneId` assente = il film. */
  saveText: (projectId: string, sceneId: string | undefined, text: MoodboardText) => void;
  addReference: (
    projectId: string,
    sceneId: string | undefined,
    reference: MoodReference,
  ) => StoredReference;
  /** Toglie un riferimento del film; `true` se c'era. */
  removeReference: (projectId: string, referenceId: string) => boolean;
  /** Un riferimento con il suo id, se è di quel film. */
  findReference: (projectId: string, referenceId: string) => StoredReference | undefined;
  changes: (projectId: string) => MoodboardChanges;
  /** Apre una richiesta di immagini (in coda) e ne dà l'id. */
  startRun: (projectId: string, sceneId: string | undefined, modelLabel: string) => string;
  updateRun: (runId: string, patch: RunPatch) => void;
  /** L'ultima richiesta del film. */
  latestRun: (projectId: string) => MoodboardRun | undefined;
  /** Una richiesta, per riprendere un lavoro rimasto a metà dopo un riavvio. */
  getRun: (runId: string) => MoodboardRun | undefined;
}

/** Cosa cambia di una richiesta mentre lavora e quando finisce. */
export interface RunPatch {
  status?: MoodboardRun['status'];
  images?: number;
  errorCode?: string;
  costUsd?: number;
}

/** Un riferimento con la parte a cui appartiene e il suo id. */
export interface StoredReference {
  id: string;
  sceneId?: string;
  reference: MoodReference;
}

export interface MoodboardStoreOptions {
  now?: () => Date;
}

const paletteSchema = z.array(colorSchema);

const parsePalette = (json: string): Color[] => paletteSchema.parse(JSON.parse(json));

const toReference = (row: MoodboardReferenceRow): MoodReference =>
  moodReferenceSchema.parse({
    id: row.id,
    assetId: row.assetId,
    origin: row.origin,
    analysisOnly: row.analysisOnly,
    description: row.description,
    moodTags: z.array(z.string()).parse(JSON.parse(row.moodTags)),
    palette: parsePalette(row.palette),
    ...(row.generationId === null ? {} : { generationId: row.generationId }),
  });

const toRun = (row: MoodboardRunRow): MoodboardRun =>
  moodboardRunSchema.parse({
    id: row.id,
    ...(row.sceneId === null ? {} : { sceneId: row.sceneId }),
    status: row.status,
    images: row.images,
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
    ...(row.modelLabel === null ? {} : { modelLabel: row.modelLabel }),
    ...(row.costUsd === null ? {} : { costUsd: row.costUsd }),
    createdAt: new Date(row.createdAt).toISOString(),
  });

export function createMoodboardStore(
  db: FilmzyDb,
  options: MoodboardStoreOptions = {},
): MoodboardStore {
  const now = options.now ?? (() => new Date());

  const referencesOf = (projectId: string, sceneId: string | undefined): MoodReference[] =>
    db
      .select()
      .from(moodboardReferences)
      .where(
        and(
          eq(moodboardReferences.projectId, projectId),
          sceneId === undefined
            ? isNull(moodboardReferences.sceneId)
            : eq(moodboardReferences.sceneId, sceneId),
        ),
      )
      .orderBy(asc(moodboardReferences.createdAt), asc(moodboardReferences.id))
      .all()
      .map(toReference);

  return {
    get(projectId) {
      const filmRow = db.select().from(moodboards).where(eq(moodboards.projectId, projectId)).get();
      const film: MoodboardPart = {
        palette: filmRow === undefined ? [] : parsePalette(filmRow.palette),
        notes: filmRow?.notes ?? '',
        references: referencesOf(projectId, undefined),
      };

      const sceneRows = db
        .select()
        .from(moodboardScenes)
        .where(eq(moodboardScenes.projectId, projectId))
        .all();
      const withReferences = db
        .select({ sceneId: moodboardReferences.sceneId })
        .from(moodboardReferences)
        .where(eq(moodboardReferences.projectId, projectId))
        .all()
        .flatMap((row) => (row.sceneId === null ? [] : [row.sceneId]));
      // Una parte di scena svuotata resta in tabella (si ricorda quando è cambiata) ma non si mostra: vale quella del film.
      const withText = sceneRows
        .filter((row) => parsePalette(row.palette).length > 0 || row.notes !== '')
        .map((row) => row.sceneId);
      const sceneIds = [...new Set([...withText, ...withReferences])].sort();

      return {
        projectId,
        film,
        scenes: sceneIds.map((sceneId) => {
          const row = sceneRows.find((candidate) => candidate.sceneId === sceneId);
          return {
            sceneId,
            palette: row === undefined ? [] : parsePalette(row.palette),
            notes: row?.notes ?? '',
            references: referencesOf(projectId, sceneId),
          };
        }),
      };
    },

    saveText(projectId, sceneId, text) {
      const notes = text.notes.trim();
      const values = {
        palette: JSON.stringify(text.palette),
        notes,
        updatedAt: now().getTime(),
      };
      const sameAs = (row: { palette: string; notes: string } | undefined): boolean =>
        (row?.notes ?? '') === notes &&
        isDeepStrictEqual(row === undefined ? [] : parsePalette(row.palette), text.palette);

      // Salvare senza cambiare niente non è un cambiamento: la data resta, e le regole (R9) non avvisano.
      // Una parte svuotata invece resta in tabella: palette e consigli sono cambiati, e le regole lo ricordano.
      if (sceneId === undefined) {
        const film = db.select().from(moodboards).where(eq(moodboards.projectId, projectId)).get();
        if (sameAs(film)) return;
        db.insert(moodboards)
          .values({ projectId, ...values })
          .onConflictDoUpdate({ target: moodboards.projectId, set: values })
          .run();
        return;
      }

      const where = and(
        eq(moodboardScenes.projectId, projectId),
        eq(moodboardScenes.sceneId, sceneId),
      );
      const existing = db.select().from(moodboardScenes).where(where).get();
      if (sameAs(existing)) return;
      if (existing === undefined) {
        db.insert(moodboardScenes)
          .values({ id: randomUUID(), projectId, sceneId, ...values })
          .run();
      } else {
        db.update(moodboardScenes).set(values).where(where).run();
      }
    },

    addReference(projectId, sceneId, reference) {
      const id = randomUUID();
      db.insert(moodboardReferences)
        .values({
          id,
          projectId,
          sceneId: sceneId ?? null,
          assetId: reference.assetId,
          origin: reference.origin,
          analysisOnly: reference.analysisOnly,
          description: reference.description,
          moodTags: JSON.stringify(reference.moodTags),
          palette: JSON.stringify(reference.palette),
          generationId: reference.generationId ?? null,
          createdAt: now().getTime(),
        })
        .run();
      return { id, ...(sceneId === undefined ? {} : { sceneId }), reference };
    },

    findReference(projectId, referenceId) {
      const row = db
        .select()
        .from(moodboardReferences)
        .where(
          and(
            eq(moodboardReferences.projectId, projectId),
            eq(moodboardReferences.id, referenceId),
          ),
        )
        .get();
      return row === undefined
        ? undefined
        : {
            id: row.id,
            ...(row.sceneId === null ? {} : { sceneId: row.sceneId }),
            reference: toReference(row),
          };
    },

    removeReference(projectId, referenceId) {
      return (
        db
          .delete(moodboardReferences)
          .where(
            and(
              eq(moodboardReferences.projectId, projectId),
              eq(moodboardReferences.id, referenceId),
            ),
          )
          .run().changes > 0
      );
    },

    startRun(projectId, sceneId, modelLabel) {
      const id = randomUUID();
      const at = now().getTime();
      db.insert(moodboardRuns)
        .values({
          id,
          projectId,
          sceneId: sceneId ?? null,
          status: 'queued',
          images: 0,
          modelLabel,
          createdAt: at,
          updatedAt: at,
        })
        .run();
      return id;
    },

    updateRun(runId, patch) {
      db.update(moodboardRuns)
        .set({
          ...(patch.status === undefined ? {} : { status: patch.status }),
          ...(patch.images === undefined ? {} : { images: patch.images }),
          ...(patch.errorCode === undefined ? {} : { errorCode: patch.errorCode }),
          ...(patch.costUsd === undefined ? {} : { costUsd: patch.costUsd }),
          updatedAt: now().getTime(),
        })
        .where(eq(moodboardRuns.id, runId))
        .run();
    },

    getRun(runId) {
      const row = db.select().from(moodboardRuns).where(eq(moodboardRuns.id, runId)).get();
      return row === undefined ? undefined : toRun(row);
    },

    latestRun(projectId) {
      const row = db
        .select()
        .from(moodboardRuns)
        .where(eq(moodboardRuns.projectId, projectId))
        .orderBy(desc(moodboardRuns.createdAt), desc(moodboardRuns.id))
        .limit(1)
        .get();
      return row === undefined ? undefined : toRun(row);
    },

    changes(projectId) {
      const film = db.select().from(moodboards).where(eq(moodboards.projectId, projectId)).get();
      const scenes = db
        .select()
        .from(moodboardScenes)
        .where(eq(moodboardScenes.projectId, projectId))
        .all();
      return {
        ...(film === undefined ? {} : { film: film.updatedAt }),
        scenes: Object.fromEntries(scenes.map((row) => [row.sceneId, row.updatedAt])),
      };
    },
  };
}

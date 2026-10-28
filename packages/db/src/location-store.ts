import { randomUUID } from 'node:crypto';

import {
  locationAttemptSchema,
  locationImagesSchema,
  locationSchema,
  sheetImageStatusSchema,
  type Location,
  type LocationImages,
  type SheetImageStatus,
} from '@filmzy/contracts';
import { desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import {
  locationAttempts,
  locations,
  type LocationAttemptRow,
  type LocationRow,
} from './schema.js';

/** Un luogo nuovo: tutto tranne ciò che assegna il database e l'immagine scelta. */
export type NewLocation = Omit<Location, 'id' | 'references'>;

/** Cosa si può dire di un tentativo mentre il lavoro avanza. */
export interface AttemptPatch {
  status: SheetImageStatus;
  assetIds?: string[];
  receiptId?: string;
  errorCode?: string;
}

/**
 * I luoghi del film e le immagini del loro set (T3.7, architettura §6). Un luogo nasce da una
 * proposta della bozza; ogni richiesta di immagini è un **tentativo** (più immagini da una chiamata
 * sola); l'utente sceglie un'immagine fra tutti i tentativi e quella è il riferimento del luogo
 * (`Location.references`).
 */
export interface LocationStore {
  create: (projectId: string, input: NewLocation) => Location;
  get: (id: string) => Location | undefined;
  /** Nell'ordine in cui sono stati aggiunti. */
  list: (projectId: string) => Location[];
  /** Toglie il luogo e i suoi tentativi; `true` se c'era. */
  remove: (id: string) => boolean;
  startAttempt: (locationId: string) => number;
  finishAttempt: (locationId: string, attempt: number, patch: AttemptPatch) => void;
  images: (locationId: string) => LocationImages;
  /** Sceglie l'immagine di riferimento, o la toglie con `undefined`. */
  choose: (locationId: string, assetId: string | undefined) => void;
}

export interface LocationStoreOptions {
  now?: () => Date;
}

function toLocation(row: LocationRow): Location {
  return locationSchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    prompt: row.prompt,
    references: row.chosenAssetId === null ? [] : [{ assetId: row.chosenAssetId }],
    ...(row.proposalId === null ? {} : { proposalId: row.proposalId }),
  });
}

function toAttempt(row: LocationAttemptRow) {
  const assetIds: unknown = JSON.parse(row.assetIds);
  return locationAttemptSchema.parse({
    attempt: row.attempt,
    status: sheetImageStatusSchema.parse(row.status),
    createdAt: new Date(row.createdAt).toISOString(),
    assetIds,
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
  });
}

export function createLocationStore(
  db: FilmzyDb,
  options: LocationStoreOptions = {},
): LocationStore {
  const now = options.now ?? (() => new Date());

  const row = (id: string): LocationRow | undefined =>
    db.select().from(locations).where(eq(locations.id, id)).get();

  return {
    create(projectId, input) {
      const at = now().getTime();
      const created = db
        .insert(locations)
        .values({
          id: randomUUID(),
          projectId,
          name: input.name,
          description: input.description,
          prompt: input.prompt,
          proposalId: input.proposalId ?? null,
          createdAt: at,
          updatedAt: at,
        })
        .returning()
        .get();
      return toLocation(created);
    },

    get(id) {
      const found = row(id);
      return found === undefined ? undefined : toLocation(found);
    },

    list(projectId) {
      return db
        .select()
        .from(locations)
        .where(eq(locations.projectId, projectId))
        .orderBy(locations.createdAt, locations.id)
        .all()
        .map(toLocation);
    },

    remove(id) {
      return db.transaction((tx) => {
        tx.delete(locationAttempts).where(eq(locationAttempts.locationId, id)).run();
        return tx.delete(locations).where(eq(locations.id, id)).run().changes > 0;
      });
    },

    startAttempt(locationId) {
      return db.transaction((tx) => {
        const last = tx
          .select({ attempt: locationAttempts.attempt })
          .from(locationAttempts)
          .where(eq(locationAttempts.locationId, locationId))
          .orderBy(desc(locationAttempts.attempt))
          .limit(1)
          .get();
        const attempt = (last?.attempt ?? 0) + 1;
        const at = now().getTime();
        tx.insert(locationAttempts)
          .values({
            id: randomUUID(),
            locationId,
            attempt,
            status: 'queued',
            assetIds: '[]',
            createdAt: at,
            updatedAt: at,
          })
          .run();
        return attempt;
      });
    },

    finishAttempt(locationId, attempt, patch) {
      const target = db
        .select()
        .from(locationAttempts)
        .where(eq(locationAttempts.locationId, locationId))
        .all()
        .find((candidate) => candidate.attempt === attempt);
      if (target === undefined) return;

      db.update(locationAttempts)
        .set({
          status: patch.status,
          assetIds: JSON.stringify(patch.assetIds ?? []),
          receiptId: patch.receiptId ?? null,
          errorCode: patch.errorCode ?? null,
          updatedAt: now().getTime(),
        })
        .where(eq(locationAttempts.id, target.id))
        .run();
    },

    images(locationId) {
      const attempts = db
        .select()
        .from(locationAttempts)
        .where(eq(locationAttempts.locationId, locationId))
        .orderBy(desc(locationAttempts.attempt))
        .all()
        .map(toAttempt);
      const chosen = row(locationId)?.chosenAssetId ?? undefined;
      return locationImagesSchema.parse({
        locationId,
        attempts,
        ...(chosen === undefined ? {} : { chosenAssetId: chosen }),
      });
    },

    choose(locationId, assetId) {
      db.update(locations)
        .set({ chosenAssetId: assetId ?? null, updatedAt: now().getTime() })
        .where(eq(locations.id, locationId))
        .run();
    },
  };
}

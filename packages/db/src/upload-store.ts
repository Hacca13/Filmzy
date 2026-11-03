import { randomUUID } from 'node:crypto';

import { uploadedImageSchema, type UploadedImage, type UploadKind } from '@filmzy/contracts';
import { asc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { uploads, type UploadRow } from './schema.js';

/** Una foto da salvare: il file è già tra gli `assets`. */
export interface NewUpload {
  projectId: string;
  assetId: string;
  kind: UploadKind;
  locationId?: string;
  name: string;
  checked: boolean;
  description?: string;
}

/**
 * Le immagini caricate dall'utente (T4.8, D19). Il film le elenca dalla più vecchia, così l'ordine
 * non cambia quando se ne aggiunge una. La stessa foto caricata due volte per lo stesso scopo è una
 * sola riga: il file è lo stesso (id = checksum).
 */
export interface UploadStore {
  add: (upload: NewUpload) => UploadedImage;
  list: (projectId: string) => UploadedImage[];
  /** Gli id dei file caricati per un luogo. */
  assetIdsOfLocation: (locationId: string) => string[];
}

export interface UploadStoreOptions {
  now?: () => Date;
}

function toUpload(row: UploadRow): UploadedImage {
  return uploadedImageSchema.parse({
    id: row.id,
    assetId: row.assetId,
    kind: row.kind,
    ...(row.locationId === null ? {} : { locationId: row.locationId }),
    name: row.name,
    checked: row.checked,
    ...(row.description === null ? {} : { description: row.description }),
    createdAt: new Date(row.createdAt).toISOString(),
  });
}

export function createUploadStore(db: FilmzyDb, options: UploadStoreOptions = {}): UploadStore {
  const now = options.now ?? (() => new Date());

  return {
    add(upload) {
      // Lo stesso file, per lo stesso film e luogo, non si ripete: si rilegge quello che c'è già.
      const same = db
        .select()
        .from(uploads)
        .where(eq(uploads.projectId, upload.projectId))
        .all()
        .find(
          (row) =>
            row.assetId === upload.assetId &&
            row.kind === upload.kind &&
            row.locationId === (upload.locationId ?? null),
        );
      if (same !== undefined) return toUpload(same);

      const row: UploadRow = {
        id: randomUUID(),
        projectId: upload.projectId,
        assetId: upload.assetId,
        kind: upload.kind,
        locationId: upload.locationId ?? null,
        name: upload.name,
        checked: upload.checked,
        description: upload.description ?? null,
        createdAt: now().getTime(),
      };
      db.insert(uploads).values(row).run();
      return toUpload(row);
    },

    list(projectId) {
      return db
        .select()
        .from(uploads)
        .where(eq(uploads.projectId, projectId))
        .orderBy(asc(uploads.createdAt), asc(uploads.id))
        .all()
        .map(toUpload);
    },

    assetIdsOfLocation(locationId) {
      return db
        .select({ assetId: uploads.assetId })
        .from(uploads)
        .where(eq(uploads.locationId, locationId))
        .orderBy(asc(uploads.createdAt), asc(uploads.id))
        .all()
        .map((row) => row.assetId);
    },
  };
}

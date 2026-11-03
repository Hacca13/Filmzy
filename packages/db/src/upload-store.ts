import { randomUUID } from 'node:crypto';

import { uploadedImageSchema, type UploadedImage, type UploadKind } from '@filmzy/contracts';
import { and, asc, eq, isNull } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { uploads, type UploadRow } from './schema.js';

/** Dove sta una foto: il file, cosa è e di quale luogo. */
export interface UploadPlace {
  assetId: string;
  kind: UploadKind;
  locationId?: string | undefined;
}

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
  /** Salva una foto. Se c'è già (stesso file, film e luogo) resta quella, ma passare il controllo la aggiorna. */
  add: (upload: NewUpload) => UploadedImage;
  /** La foto già caricata con questo file per questo film e luogo, se c'è. */
  find: (projectId: string, place: UploadPlace) => UploadedImage | undefined;
  /** Toglie le foto di un luogo (quando il luogo esce dal film); i file restano. */
  removeForLocation: (locationId: string) => void;
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

  const findRow = (projectId: string, place: UploadPlace): UploadRow | undefined =>
    db
      .select()
      .from(uploads)
      .where(
        and(
          eq(uploads.projectId, projectId),
          eq(uploads.assetId, place.assetId),
          eq(uploads.kind, place.kind),
          place.locationId === undefined
            ? isNull(uploads.locationId)
            : eq(uploads.locationId, place.locationId),
        ),
      )
      .get();

  return {
    find(projectId, place) {
      const row = findRow(projectId, place);
      return row === undefined ? undefined : toUpload(row);
    },

    removeForLocation(locationId) {
      db.delete(uploads).where(eq(uploads.locationId, locationId)).run();
    },

    add(upload) {
      // Lo stesso file, per lo stesso film e luogo, non si ripete. Se prima era stato salvato senza
      // controllo e ora il controllo è passato, la riga si aggiorna: ora ha la sua descrizione.
      const same = findRow(upload.projectId, upload);
      if (same !== undefined) {
        if (!upload.checked || same.checked) return toUpload(same);
        db.update(uploads)
          .set({ checked: true, description: upload.description ?? null })
          .where(eq(uploads.id, same.id))
          .run();
        return toUpload({ ...same, checked: true, description: upload.description ?? null });
      }

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

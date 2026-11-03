import { uploadedImageSchema, uploadsSchema, type UploadKind } from '@filmzy/contracts';

import { getJson, sendJson } from './client';

/** Le foto che l'utente carica (T4.8, D19): l'elenco con lo stato della funzione, e il caricamento. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/uploads`;

export function fetchUploads(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), uploadsSchema, { signal });
}

export interface UploadTarget {
  kind: UploadKind;
  /** Il luogo a cui appartiene la foto; solo per `kind: 'location'`. */
  locationId?: string;
  name?: string;
}

/** Manda il file così com'è: il server ne riconosce il tipo dai primi byte e lo controlla. */
export function uploadImage(filmId: string, target: UploadTarget, file: Blob) {
  const query = new URLSearchParams({ kind: target.kind });
  if (target.locationId !== undefined) query.set('locationId', target.locationId);
  if (target.name !== undefined) query.set('name', target.name);
  return sendJson('POST', `${base(filmId)}?${query.toString()}`, uploadedImageSchema, file);
}

import { API_PREFIX, projectSchema } from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** La copia di un film (T6.3): salvarla, e aprirla su un altro computer. Non costa niente. */

export function filmCopyUrl(filmId: string): string {
  return `/${API_PREFIX}/projects/${encodeURIComponent(filmId)}/copy`;
}

/** Si può salvare adesso? Con un lavoro aperto no: lo si dice prima di far partire il download. */
export function checkFilmCopy(filmId: string) {
  return getJson(`/projects/${encodeURIComponent(filmId)}/copy/check`, z.undefined());
}

/** Manda la copia così com'è: è un file, anche grande. */
export function importFilmCopy(file: Blob) {
  return sendJson('POST', '/projects/import', projectSchema, file);
}

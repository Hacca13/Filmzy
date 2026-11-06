import { API_PREFIX, projectSchema } from '@filmzy/contracts';

import { sendJson } from './client';

/** La copia di un film (T6.3): salvarla, e aprirla su un altro computer. Non costa niente. */

export function filmCopyUrl(filmId: string): string {
  return `/${API_PREFIX}/projects/${encodeURIComponent(filmId)}/copy`;
}

/** Manda la copia così com'è: è un file, anche grande. `replace` sostituisce un film che c'è già. */
export function importFilmCopy(file: Blob, replace: boolean) {
  return sendJson('POST', `/projects/import${replace ? '?replace=1' : ''}`, projectSchema, file);
}

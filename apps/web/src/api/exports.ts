import { API_PREFIX, exportViewSchema, type StartExportBody } from '@filmzy/contracts';
import { z } from 'zod';

import { getJson, sendJson } from './client';

/** L'esportazione del film (T5.8): a che punto è, «Esporta il film» e la cartella. Non costa niente. */

const base = (filmId: string) => `/projects/${encodeURIComponent(filmId)}/exports`;

export function fetchExport(filmId: string, signal?: AbortSignal) {
  return getJson(base(filmId), exportViewSchema, { signal });
}

export function startExport(filmId: string, body: StartExportBody) {
  return sendJson('POST', base(filmId), exportViewSchema, body);
}

export function openExportFolder(filmId: string) {
  return sendJson('POST', `${base(filmId)}/folder`, z.undefined());
}

/** Dove si scarica il file finale: il server lo manda come allegato, col suo nome. */
export function exportFileUrl(filmId: string, exportId: string): string {
  return `/${API_PREFIX}${base(filmId)}/${encodeURIComponent(exportId)}/file`;
}

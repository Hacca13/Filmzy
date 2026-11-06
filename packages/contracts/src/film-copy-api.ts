import { z } from 'zod';

/**
 * La copia di un film (T6.3, D92): un file solo, `.filmzy`, da conservare o da riaprire su un altro computer.
 * Dentro c'è uno zip con questo indice e i file del film sotto `files/`, con lo stesso percorso che hanno
 * nella cartella dei dati.
 */
export const FILM_COPY_EXTENSION = '.filmzy';

/** Il nome dell'indice dentro lo zip. */
export const FILM_COPY_MANIFEST = 'filmzy-film.json';

/** Cambia solo se cambia la forma dell'indice; le tabelle seguono la versione dello schema. */
export const FILM_COPY_FORMAT_VERSION = 1;

export const filmCopyManifestSchema = z.object({
  format: z.literal('filmzy-film'),
  formatVersion: z.literal(FILM_COPY_FORMAT_VERSION),
  /** Quante migrazioni aveva il programma che l'ha fatta: un programma più vecchio non la apre. */
  schemaVersion: z.number().int().nonnegative(),
  appVersion: z.string().min(1),
  exportedAt: z.iso.datetime(),
  projectId: z.string().min(1),
  /** Le righe del film, tabella per tabella, così come stanno nel database. */
  tables: z.record(z.string().min(1), z.array(z.record(z.string(), z.unknown()))),
});

export type FilmCopyManifest = z.infer<typeof filmCopyManifestSchema>;

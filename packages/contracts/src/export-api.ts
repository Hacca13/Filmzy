import { z } from 'zod';

import { idSchema } from './ids.js';
import { sheetImageStatusSchema } from './sheet-api.js';

/**
 * L'esportazione del film (T5.8, architettura §9): dal film montato fa il file finale, alla qualità scelta,
 * nella cartella del film. Non chiama nessun fornitore, quindi non costa niente. Si lavora in coda, perché
 * rifare un film a un'altra qualità è lungo (regola 9).
 */

/**
 * Le qualità più basse che si possono chiedere, come misura del lato corto in pixel. Sopra la misura del film
 * non si va: il file peserebbe di più senza vedersi meglio. Il lato corto vale anche per un film verticale.
 */
export const EXPORT_SHORT_SIDES = [1080, 720, 480] as const;

const shortSideSchema = z.number().int().positive();

export const filmExportSchema = z.object({
  id: idSchema,
  status: sheetImageStatusSchema,
  shortSide: shortSideSchema,
  errorCode: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export type FilmExport = z.infer<typeof filmExportSchema>;

/** Il film che si può esportare: l'ultimo montato, con le qualità possibili dalla più alta. */
export const exportSourceSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  qualities: z.array(shortSideSchema).min(1),
});

export type ExportSource = z.infer<typeof exportSourceSchema>;

/** Il file che l'ultima esportazione riuscita ha lasciato nella cartella. */
export const exportedFileSchema = z.object({
  id: idSchema,
  shortSide: shortSideSchema,
  /** Dov'è, per intero: l'utente lo legge per ritrovarlo. */
  path: z.string().min(1),
  /** Viene dall'ultimo film montato; se è falso è di un montaggio di prima. */
  current: z.boolean(),
});

export type ExportedFile = z.infer<typeof exportedFileSchema>;

/**
 * A che punto è l'esportazione. Un film non ancora montato non ha `source`; un file tolto dalla cartella non
 * compare in `file`, così l'interfaccia non offre qualcosa che non c'è più.
 */
export const exportViewSchema = z.object({
  source: exportSourceSchema.optional(),
  /** L'ultimo tentativo, com'è andato. */
  latest: filmExportSchema.optional(),
  file: exportedFileSchema.optional(),
});

export type ExportView = z.infer<typeof exportViewSchema>;

/** «Esporta il film». Il server controlla che la qualità sia una di quelle possibili per questo film. */
export const startExportBodySchema = z.object({ shortSide: shortSideSchema }).strict();

export type StartExportBody = z.infer<typeof startExportBodySchema>;

/** Cosa porta in coda il lavoro «esporta il film» (`film_export`). */
export const exportJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  exportId: idSchema,
});

export type ExportJobPayload = z.infer<typeof exportJobPayloadSchema>;

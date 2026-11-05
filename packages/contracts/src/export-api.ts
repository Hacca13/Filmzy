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

/**
 * I formati in cui si può esportare un film nato in un altro formato. L'immagine non si taglia e non si
 * deforma: le parti vuote diventano bande nere. Tagliare porterebbe via anche la dicitura AI dei titoli (D28).
 */
export const EXPORT_ASPECTS = ['16:9', '9:16', '1:1', '4:3', '21:9'] as const;

export const exportAspectSchema = z.enum(EXPORT_ASPECTS);

export type ExportAspect = z.infer<typeof exportAspectSchema>;

/** I tipi di file. Il nome è anche l'estensione del file. */
export const EXPORT_CONTAINERS = ['mp4', 'mov', 'webm'] as const;

export const exportContainerSchema = z.enum(EXPORT_CONTAINERS);

export type ExportContainer = z.infer<typeof exportContainerSchema>;

/** Le due parti di un formato, per fare i conti: `9:16` è largo 9 e alto 16. */
export function aspectParts(aspect: ExportAspect): { width: number; height: number } {
  const [width = 1, height = 1] = aspect.split(':').map(Number);
  return { width, height };
}

/** Quanto può scostarsi un film da un formato ed essere ancora quello: le misure pari arrotondano un po'. */
const ASPECT_TOLERANCE = 0.02;

/** Le misure hanno questo formato, a meno degli arrotondamenti. */
export function hasAspect(
  { width, height }: { width: number; height: number },
  aspect: { width: number; height: number },
): boolean {
  return Math.abs(width / height - aspect.width / aspect.height) < ASPECT_TOLERANCE;
}

export const filmExportSchema = z.object({
  id: idSchema,
  status: sheetImageStatusSchema,
  shortSide: shortSideSchema,
  /** Manca se è il formato del film. */
  aspect: exportAspectSchema.optional(),
  container: exportContainerSchema,
  errorCode: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export type FilmExport = z.infer<typeof filmExportSchema>;

/** Il film che si può esportare: l'ultimo montato, con le qualità possibili dalla più alta. */
export const exportSourceSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  qualities: z.array(shortSideSchema).min(1),
  /** Gli altri formati possibili: quello del film non c'è, perché è la scelta di partenza. */
  aspects: z.array(exportAspectSchema),
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

/** «Esporta il film». Il server controlla che qualità e formato siano possibili per questo film. */
export const startExportBodySchema = z
  .object({
    shortSide: shortSideSchema,
    /** Da lasciare fuori per tenere il formato del film. */
    aspect: exportAspectSchema.optional(),
    container: exportContainerSchema.default('mp4'),
  })
  .strict();

export type StartExportBody = z.infer<typeof startExportBodySchema>;

/** Cosa porta in coda il lavoro «esporta il film» (`film_export`). */
export const exportJobPayloadSchema = z.object({
  projectId: z.string().min(1),
  exportId: idSchema,
});

export type ExportJobPayload = z.infer<typeof exportJobPayloadSchema>;

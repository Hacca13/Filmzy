import { z } from 'zod';

import { assetIdSchema, locationIdSchema, uploadIdSchema } from './ids.js';

/**
 * Le immagini caricate dall'utente (T4.8, D19): luoghi e oggetti, **mai persone**. Con la prudenza
 * accesa, un servizio che legge le immagini controlla ogni foto prima di salvarla: una foto con persone
 * (o con un marchio, un personaggio noto, un minore) si rifiuta con un messaggio semplice, e non resta
 * sul disco. Tutto il controllo sta nel server (regola 8): l'interfaccia invia il file e mostra l'esito.
 */

/** Cosa si carica: la foto di un luogo (che può diventare il riferimento del luogo) o di un oggetto. */
export const UPLOAD_KINDS = ['location', 'object'] as const;

export const uploadKindSchema = z.enum(UPLOAD_KINDS);

export type UploadKind = z.infer<typeof uploadKindSchema>;

/** I tipi di immagine accettati: quelli che i servizi leggono e che il browser mostra senza rischi (niente SVG). */
export const UPLOAD_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Quanto può pesare una foto (byte): abbastanza per una foto buona, non per riempire il disco. */
export const UPLOAD_MAX_BYTES = 12 * 1024 * 1024;

/** Perché un'immagine si rifiuta (`image_rejected`): l'interfaccia ha una frase semplice per ognuno. */
export const IMAGE_PROBLEMS = [
  'people',
  'brand',
  'known_character',
  'minor',
  'explicit',
  'other',
] as const;

export const imageProblemSchema = z.enum(IMAGE_PROBLEMS);

export type ImageProblem = z.infer<typeof imageProblemSchema>;

/** Le domande del caricamento (`POST /projects/:id/uploads?…`): il file è il corpo della richiesta. */
export const uploadQuerySchema = z.strictObject({
  kind: uploadKindSchema,
  /** Il luogo a cui appartiene la foto; solo per `kind: location`. */
  locationId: locationIdSchema.optional(),
  /** Un nome per ritrovarla (facoltativo): senza, la foto prende quello del file. */
  name: z.string().trim().min(1).max(80).optional(),
});

export type UploadQuery = z.infer<typeof uploadQuerySchema>;

export const uploadedImageSchema = z.object({
  id: uploadIdSchema,
  assetId: assetIdSchema,
  kind: uploadKindSchema,
  locationId: locationIdSchema.optional(),
  name: z.string().min(1),
  /** La foto è passata dal controllo (con la prudenza spenta si salva senza). */
  checked: z.boolean(),
  /** Cosa si vede, come l'ha letto il servizio (in inglese): serve ai servizi che la useranno. */
  description: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
});

export type UploadedImage = z.infer<typeof uploadedImageSchema>;

/** `GET /projects/:id/uploads`: le foto del film e se si possono caricare. */
export const uploadsSchema = z.object({
  /** La funzione `image_upload` è accesa. Spenta, l'interfaccia non offre il caricamento. */
  enabled: z.boolean(),
  /** La prudenza sulle immagini è accesa: ogni foto passa dal controllo prima di essere salvata. */
  checking: z.boolean(),
  uploads: z.array(uploadedImageSchema),
});

export type Uploads = z.infer<typeof uploadsSchema>;

import { z } from 'zod';

import {
  cameraMovementSchema,
  characterTagSchema,
  cinematographyPresetSchema,
  genreSchema,
  stylePresetSchema,
  toneSchema,
} from '../presets.js';
import { connectionSchema } from './connections.js';
import { featuresSchema, limitsSchema } from './features.js';
import { modelEntrySchema } from './models.js';
import { roleConfigEntrySchema } from './roles.js';

/**
 * Il contenuto di una **release** della troupe (architettura §4.3, §4.5): connessioni, catalogo,
 * ruoli, preset, funzioni e limiti, tutti insieme in un documento solo.
 *
 * È lo stesso oggetto che il caricatore dei file di seme costruisce leggendo `config/`, e quello
 * che il database salva come JSON quando si pubblica. Averlo come schema serve a chi lo rilegge dal
 * disco: una riga rovinata si ferma al confine, non dentro il router (regola d'oro 3).
 *
 * I preset qui sono quelli del **dominio**, in camelCase (`cameraMovements`), non quelli dei file
 * in snake_case: la conversione la fa il caricatore (§5.3).
 */
export const troupePresetsSchema = z.object({
  styles: z.array(stylePresetSchema),
  cinematography: z.array(cinematographyPresetSchema),
  cameraMovements: z.array(cameraMovementSchema),
  characterTags: z.array(characterTagSchema),
  genres: z.array(genreSchema),
  tones: z.array(toneSchema),
});

export type TroupePresetsData = z.infer<typeof troupePresetsSchema>;

export const troupeConfigSchema = z.object({
  connections: z.record(z.string().min(1), connectionSchema),
  models: z.record(z.string().min(1), modelEntrySchema),
  roles: z.record(z.string().min(1), roleConfigEntrySchema),
  features: featuresSchema,
  limits: limitsSchema,
  presets: troupePresetsSchema,
});

export type TroupeConfigData = z.infer<typeof troupeConfigSchema>;

/**
 * Una release pubblicata: immutabile. `hash` è l'impronta della configurazione (§4.5) e finisce
 * negli scontrini; `note` e `author` dicono perché e chi. `activatedAt` è l'ultima volta che è
 * stata messa in uso: la release attiva è quella attivata più di recente, e un ripristino è una
 * pubblicazione nuova, così lo storico resta lineare.
 */
export const troupeReleaseSchema = z.object({
  id: z.string().min(1),
  config: troupeConfigSchema,
  hash: z.string().min(1),
  note: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
  activatedAt: z.iso.datetime().optional(),
});

export type TroupeRelease = z.infer<typeof troupeReleaseSchema>;

/** La bozza: l'unica copia modificabile (§4.5 punto 1). Ce n'è una sola. */
export const troupeDraftSchema = z.object({
  config: troupeConfigSchema,
  updatedAt: z.iso.datetime(),
  /** Da quale release è nata, se è nata da una: serve a dire «hai modifiche non pubblicate». */
  fromReleaseId: z.string().min(1).optional(),
});

export type TroupeDraft = z.infer<typeof troupeDraftSchema>;

/**
 * Una versione di istruzioni salvata nel database (§4.4, D38). Quelle del programma arrivano con
 * l'installazione (`origin: 'bundled'`), quelle caricate dall'utente restano sue (`'user'`). Una
 * versione pubblicata non si modifica: si crea la successiva.
 */
export const INSTRUCTION_ORIGINS = ['bundled', 'user'] as const;

export const instructionOriginSchema = z.enum(INSTRUCTION_ORIGINS);

export type InstructionOrigin = z.infer<typeof instructionOriginSchema>;

export const instructionVersionSchema = z.object({
  /** L'id delle istruzioni, cioè il ruolo: `cinematographer`. */
  instructionsId: z.string().min(1),
  version: z.number().int().positive(),
  /** La variante per famiglia, se è una variante (`seedance`); assente per la base. */
  family: z.string().min(1).optional(),
  origin: instructionOriginSchema,
  /** Il testo del template, come sta nel file `.md`. */
  body: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type InstructionVersion = z.infer<typeof instructionVersionSchema>;

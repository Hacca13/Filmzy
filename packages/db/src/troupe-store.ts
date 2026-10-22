import { randomUUID } from 'node:crypto';

import {
  instructionVersionSchema,
  troupeConfigSchema,
  userSettingsSchema,
  type InstructionVersion,
  type TroupeConfigData,
  type TroupeDraft,
  type TroupeRelease,
  type UserSettings,
} from '@filmzy/contracts';
import { and, desc, eq, isNotNull } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import {
  DRAFT_ID,
  instructionVersions,
  settings,
  troupeDrafts,
  troupeReleases,
  USER_SETTINGS_ID,
  type InstructionVersionRow,
  type TroupeReleaseRow,
} from './schema.js';

/**
 * La configurazione della troupe dentro il database (architettura §4.5): bozza, pubblicazione,
 * storico, versioni delle istruzioni e scelte dell'utente.
 *
 * Qui si legge e si scrive, non si decide: la validazione del *contenuto* (riferimenti rotti,
 * parametri non accettati, istruzioni che non rendono) è del validatore della troupe, che gira
 * prima di pubblicare. Questo magazzino controlla solo che il JSON letto dal disco abbia la forma
 * giusta: una riga rovinata si ferma qui (regola d'oro 3).
 */

export interface PublishInput {
  config: TroupeConfigData;
  /** L'impronta della configurazione, calcolata da chi pubblica (finisce negli scontrini, §4.5). */
  hash: string;
  note?: string;
  author?: string;
}

/** Una riga che non si è potuta leggere: si dice quale e perché, invece di far finta di niente. */
export interface UnreadableRow {
  id: string;
  message: string;
}

export interface ActiveRelease {
  /** La release attiva più recente che si è potuta leggere. */
  release?: TroupeRelease;
  /** Le release più recenti di quella, scartate perché illeggibili: si tiene la precedente. */
  skipped: UnreadableRow[];
}

export interface StoredSettings {
  settings?: UserSettings;
  /** Se le scelte dell'utente non si leggono: chi chiama deve fermarsi, non tirare a indovinare. */
  problem?: string;
}

export interface TroupeStore {
  getDraft: () => TroupeDraft | undefined;
  saveDraft: (config: TroupeConfigData, fromReleaseId?: string) => TroupeDraft;
  deleteDraft: () => void;
  /** Pubblica e attiva: la release diventa quella in uso (§4.5 punto 3). */
  publish: (input: PublishInput) => TroupeRelease;
  activeRelease: () => ActiveRelease;
  getRelease: (id: string) => TroupeRelease | undefined;
  listReleases: (limit?: number) => TroupeRelease[];
  getSettings: () => StoredSettings;
  saveSettings: (value: UserSettings) => void;
  addInstructionVersion: (version: InstructionVersion) => void;
  listInstructionVersions: (instructionsId?: string) => InstructionVersion[];
  getInstructionVersion: (
    instructionsId: string,
    version: number,
    family?: string,
  ) => InstructionVersion | undefined;
}

export interface TroupeStoreOptions {
  now?: () => Date;
}

export function createTroupeStore(db: FilmzyDb, options: TroupeStoreOptions = {}): TroupeStore {
  const now = options.now ?? (() => new Date());

  return {
    getDraft() {
      const [row] = db.select().from(troupeDrafts).where(eq(troupeDrafts.id, DRAFT_ID)).all();
      if (row === undefined) return undefined;

      const config = troupeConfigSchema.safeParse(JSON.parse(row.config) as unknown);
      if (!config.success) return undefined;

      return {
        config: config.data,
        updatedAt: new Date(row.updatedAt).toISOString(),
        ...(row.fromReleaseId === null ? {} : { fromReleaseId: row.fromReleaseId }),
      };
    },

    saveDraft(config, fromReleaseId) {
      const at = now().getTime();
      const row = {
        id: DRAFT_ID,
        config: JSON.stringify(config),
        fromReleaseId: fromReleaseId ?? null,
        updatedAt: at,
      };

      db.insert(troupeDrafts)
        .values(row)
        .onConflictDoUpdate({
          target: troupeDrafts.id,
          set: { config: row.config, fromReleaseId: row.fromReleaseId, updatedAt: at },
        })
        .run();

      return {
        config,
        updatedAt: new Date(at).toISOString(),
        ...(fromReleaseId === undefined ? {} : { fromReleaseId }),
      };
    },

    deleteDraft() {
      db.delete(troupeDrafts).where(eq(troupeDrafts.id, DRAFT_ID)).run();
    },

    publish(input) {
      const at = now().getTime();
      const row = {
        id: randomUUID(),
        config: JSON.stringify(input.config),
        hash: input.hash,
        note: input.note ?? null,
        author: input.author ?? null,
        createdAt: at,
        activatedAt: at,
      };

      db.insert(troupeReleases).values(row).run();
      return {
        id: row.id,
        config: input.config,
        hash: input.hash,
        ...(input.note === undefined ? {} : { note: input.note }),
        ...(input.author === undefined ? {} : { author: input.author }),
        createdAt: new Date(at).toISOString(),
        activatedAt: new Date(at).toISOString(),
      };
    },

    activeRelease() {
      // Dalla più recente indietro: se la prima non si legge si tiene la precedente, come chiede
      // il piano, invece di lasciare il programma senza configurazione.
      const rows = db
        .select()
        .from(troupeReleases)
        .where(isNotNull(troupeReleases.activatedAt))
        .orderBy(desc(troupeReleases.seq))
        .limit(20)
        .all();

      const skipped: UnreadableRow[] = [];
      for (const row of rows) {
        const release = toRelease(row);
        if (release !== undefined) return { release, skipped };
        skipped.push({ id: row.id, message: 'la configurazione salvata non ha la forma giusta' });
      }
      return { skipped };
    },

    getRelease(id) {
      const [row] = db.select().from(troupeReleases).where(eq(troupeReleases.id, id)).all();
      return row === undefined ? undefined : toRelease(row);
    },

    listReleases(limit = 50) {
      return db
        .select()
        .from(troupeReleases)
        .orderBy(desc(troupeReleases.seq))
        .limit(limit)
        .all()
        .flatMap((row) => {
          const release = toRelease(row);
          return release === undefined ? [] : [release];
        });
    },

    getSettings() {
      const [row] = db.select().from(settings).where(eq(settings.id, USER_SETTINGS_ID)).all();
      if (row === undefined) return {};

      const parsed = userSettingsSchema.safeParse(JSON.parse(row.value) as unknown);
      return parsed.success
        ? { settings: parsed.data }
        : { problem: 'le scelte salvate non hanno la forma giusta' };
    },

    saveSettings(value) {
      const at = now().getTime();
      const row = { id: USER_SETTINGS_ID, value: JSON.stringify(value), updatedAt: at };

      db.insert(settings)
        .values(row)
        .onConflictDoUpdate({ target: settings.id, set: { value: row.value, updatedAt: at } })
        .run();
    },

    addInstructionVersion(version) {
      // Una versione pubblicata non si modifica: si crea la successiva (§4.4). Se c'è già, la
      // riscrittura non passa.
      db.insert(instructionVersions)
        .values({
          id: randomUUID(),
          instructionsId: version.instructionsId,
          version: version.version,
          family: version.family ?? '',
          origin: version.origin,
          body: version.body,
          createdAt: new Date(version.createdAt).getTime(),
        })
        .run();
    },

    listInstructionVersions(instructionsId) {
      return db
        .select()
        .from(instructionVersions)
        .where(
          instructionsId === undefined
            ? undefined
            : eq(instructionVersions.instructionsId, instructionsId),
        )
        .orderBy(instructionVersions.instructionsId, instructionVersions.version)
        .all()
        .flatMap((row) => {
          const parsed = toInstructionVersion(row);
          return parsed === undefined ? [] : [parsed];
        });
    },

    getInstructionVersion(instructionsId, version, family) {
      const [row] = db
        .select()
        .from(instructionVersions)
        .where(
          and(
            eq(instructionVersions.instructionsId, instructionsId),
            eq(instructionVersions.version, version),
            eq(instructionVersions.family, family ?? ''),
          ),
        )
        .all();

      return row === undefined ? undefined : toInstructionVersion(row);
    },
  };
}

/** Dalla riga alla release, se il JSON ha la forma giusta. */
function toRelease(row: TroupeReleaseRow): TroupeRelease | undefined {
  const config = troupeConfigSchema.safeParse(JSON.parse(row.config) as unknown);
  if (!config.success) return undefined;

  return {
    id: row.id,
    config: config.data,
    hash: row.hash,
    ...(row.note === null ? {} : { note: row.note }),
    ...(row.author === null ? {} : { author: row.author }),
    createdAt: new Date(row.createdAt).toISOString(),
    ...(row.activatedAt === null ? {} : { activatedAt: new Date(row.activatedAt).toISOString() }),
  };
}

function toInstructionVersion(row: InstructionVersionRow): InstructionVersion | undefined {
  const parsed = instructionVersionSchema.safeParse({
    instructionsId: row.instructionsId,
    version: row.version,
    ...(row.family === '' ? {} : { family: row.family }),
    origin: row.origin,
    body: row.body,
    createdAt: new Date(row.createdAt).toISOString(),
  });

  return parsed.success ? parsed.data : undefined;
}

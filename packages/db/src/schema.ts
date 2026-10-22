import type { InstructionOrigin, JobStatus } from '@filmzy/contracts';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Le tabelle del database locale (architettura §6). Arrivano un pezzo per volta, insieme al task
 * che le usa: qui ci sono quelle di T2.1, cioè le informazioni sul database stesso e la coda dei
 * lavori. I campi JSON sono testo validato con Zod al confine (D29).
 *
 * I tempi sono millisecondi epoch (`integer`): SQLite non ha un tipo data, e un numero si ordina
 * e si confronta senza sorprese di fuso orario. Verso l'esterno diventano date ISO (contratti).
 */

/** Informazioni sul database: versione dello schema e versione del programma che l'ha aperto. */
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const jobs = sqliteTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    status: text('status').notNull().$type<JobStatus>(),
    /** Il dato del lavoro, in JSON: lo valida il modulo che lo esegue, non la coda. */
    payload: text('payload').notNull(),
    projectId: text('project_id'),
    /** Unica: un lavoro ripetuto non entra due volte (regola d'oro 10). Può mancare. */
    idempotencyKey: text('idempotency_key'),
    priority: integer('priority').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    /** Non prima di questo momento: è l'attesa crescente fra due tentativi. */
    runAfter: integer('run_after').notNull(),
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    startedAt: integer('started_at'),
    finishedAt: integer('finished_at'),
  },
  (table) => [
    // Quello che fa l'esecutore mille volte: «dammi i prossimi lavori da fare».
    index('jobs_da_fare').on(table.status, table.runAfter, table.priority),
    uniqueIndex('jobs_idempotenza').on(table.idempotencyKey),
    index('jobs_per_film').on(table.projectId),
  ],
);

export type JobRow = typeof jobs.$inferSelect;

/**
 * La configurazione della troupe (architettura §4.5). La **bozza** è una sola, ed è l'unica copia
 * modificabile: la riga ha sempre lo stesso id. Le **release** sono immutabili e non si cancellano:
 * la attiva è quella attivata più di recente, e un ripristino è una pubblicazione nuova, così lo
 * storico resta lineare.
 */
export const DRAFT_ID = 'bozza';

export const troupeDrafts = sqliteTable('troupe_drafts', {
  id: text('id').primaryKey(),
  config: text('config').notNull(),
  fromReleaseId: text('from_release_id'),
  updatedAt: integer('updated_at').notNull(),
});

export type TroupeDraftRow = typeof troupeDrafts.$inferSelect;

export const troupeReleases = sqliteTable(
  'troupe_releases',
  {
    /**
     * Il numero di pubblicazione, che cresce da sé: è quello che dice qual è l'ultima. Due
     * pubblicazioni nello stesso millisecondo hanno la stessa data, quindi ordinare per data non
     * basterebbe a sapere quale viene dopo.
     */
    seq: integer('seq').primaryKey({ autoIncrement: true }),
    id: text('id').notNull().unique(),
    config: text('config').notNull(),
    hash: text('hash').notNull(),
    note: text('note'),
    author: text('author'),
    createdAt: integer('created_at').notNull(),
    activatedAt: integer('activated_at'),
  },
  (table) => [index('troupe_releases_attivazione').on(table.activatedAt)],
);

export type TroupeReleaseRow = typeof troupeReleases.$inferSelect;

/**
 * Le versioni delle istruzioni (§4.4, D38): quelle del programma e quelle caricate dall'utente.
 * `family` vuoto significa «la base», non una variante: in SQLite due NULL sono considerati
 * diversi, quindi un indice unico con NULL non impedirebbe i doppioni.
 */
export const instructionVersions = sqliteTable(
  'instruction_versions',
  {
    id: text('id').primaryKey(),
    instructionsId: text('instructions_id').notNull(),
    version: integer('version').notNull(),
    family: text('family').notNull().default(''),
    origin: text('origin').notNull().$type<InstructionOrigin>(),
    body: text('body').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('instruction_versions_una_sola').on(
      table.instructionsId,
      table.version,
      table.family,
    ),
  ],
);

export type InstructionVersionRow = typeof instructionVersions.$inferSelect;

/**
 * Le scelte dell'utente (D36): servizi attivati, predefiniti, regolazioni dei ruoli e tetti di
 * spesa. Valgono subito, senza pubblicare niente, quindi stanno fuori dalle release. Una riga
 * sola, in JSON: è un oggetto che si legge e si riscrive tutto insieme.
 */
export const USER_SETTINGS_ID = 'utente';

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type SettingsRow = typeof settings.$inferSelect;

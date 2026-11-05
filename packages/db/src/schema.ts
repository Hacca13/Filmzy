import type { InstructionOrigin, JobStatus } from '@filmzy/contracts';
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

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

/** Le preferenze dell'app (audio dei take, controllo aggiornamenti): non riguardano la troupe. */
export const APP_PREFERENCES_ID = 'preferenze';

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type SettingsRow = typeof settings.$inferSelect;

/**
 * Gli scontrini (architettura §4.11, §6): uno per ogni chiamata a un fornitore, anche fallita. Lo
 * scontrino intero sta in `receipt` (JSON); le colonne accanto servono a cercare e a sommare senza
 * leggerlo tutto (la spesa si calcola da qui, D30). Lo stesso scontrino si riscrive durante la sua
 * vita (`queued` → `running` → `succeeded`): la riga è sempre una, per `id`, così una chiamata
 * ripetuta non si conta due volte (CLAUDE.md regola 10).
 */
export const generations = sqliteTable(
  'generations',
  {
    id: text('id').primaryKey(),
    purpose: text('purpose').notNull(),
    role: text('role').notNull(),
    modelId: text('model_id').notNull(),
    status: text('status').notNull(),
    estimatedCostUsd: real('estimated_cost_usd').notNull(),
    actualCostUsd: real('actual_cost_usd'),
    /** Il fornitore: serve a sommare la spesa del mese per ognuno (D30) senza leggere ogni scontrino. */
    connectionId: text('connection_id').notNull().default(''),
    /** Il film, se la chiamata era per un film: serve al limite per film. */
    projectId: text('project_id'),
    createdAt: integer('created_at').notNull(),
    receipt: text('receipt').notNull(),
  },
  (table) => [
    index('generations_per_scopo').on(table.purpose, table.createdAt),
    index('generations_per_fornitore').on(table.connectionId, table.createdAt),
    index('generations_per_film').on(table.projectId),
  ],
);

export type GenerationRow = typeof generations.$inferSelect;

/**
 * I film (architettura §3.1, §6): l'idea scelta nel wizard e la fase a cui sono arrivati. Stile e
 * fotografia sono gli id dei preset; la durata è quella scelta, in secondi. Date in millisecondi.
 */
export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    idea: text('idea').notNull(),
    genre: text('genre').notNull(),
    tone: text('tone').notNull(),
    style: text('style').notNull(),
    cinematography: text('cinematography').notNull(),
    language: text('language').notNull(),
    durationS: integer('duration_s').notNull(),
    phase: text('phase').notNull(),
    /** Quando la fotografia del film è stata cambiata l'ultima volta, dopo la creazione (T5.1, R4). */
    cinematographyChangedAt: integer('cinematography_changed_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('projects_per_modifica').on(table.updatedAt)],
);

export type ProjectRow = typeof projects.$inferSelect;

/**
 * Le versioni della sceneggiatura (architettura §6): una riga per ogni versione di un film, per
 * tappa (`draft` o `final`). Non si cambiano e non si cancellano: ogni richiesta ne scrive una
 * nuova. `content` è la sceneggiatura intera in JSON; `request` la richiesta dell'utente che l'ha
 * prodotta; `generation_id` lo scontrino della chiamata. Il numero di versione è unico per film e
 * tappa.
 */
export const screenplays = sqliteTable(
  'screenplays',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    stage: text('stage').notNull(),
    version: integer('version').notNull(),
    content: text('content').notNull(),
    request: text('request'),
    generationId: text('generation_id'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('screenplays_per_versione').on(table.projectId, table.stage, table.version),
  ],
);

export type ScreenplayRow = typeof screenplays.$inferSelect;

/**
 * I personaggi del film (architettura §6): quelli che l'utente ha aggiunto dalle proposte del
 * casting. `project_id` vuoto sarà il cast riutilizzabile fra film (più avanti). `profile` e
 * `appearance` sono JSON; `proposal_id` collega il personaggio alla proposta della bozza da cui
 * viene (D18). Le immagini della scheda arrivano con T3.6, in una tabella loro.
 */
export const characters = sqliteTable(
  'characters',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id'),
    name: text('name').notNull(),
    tag: text('tag').notNull(),
    role: text('role').notNull(),
    description: text('description').notNull(),
    profile: text('profile'),
    appearance: text('appearance').notNull(),
    voiceId: text('voice_id'),
    proposalId: text('proposal_id'),
    /** Il tentativo della scheda su cui il volto è bloccato (T3.6); vuoto se non lo è. */
    lockedAttempt: integer('locked_attempt'),
    /** Quando la scheda è cambiata l'ultima volta, cioè il volto bloccato o sbloccato (T5.1, R3). */
    sheetChangedAt: integer('sheet_changed_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('characters_per_film').on(table.projectId, table.createdAt)],
);

export type CharacterRow = typeof characters.$inferSelect;

/**
 * I file dei fornitori, copiati subito nella cartella del film (regola d'oro 11, architettura §6):
 * una riga per file. L'id è il checksum (lo stesso file non si salva due volte); `path` è relativo
 * alla cartella dei dati, così i dati si possono spostare.
 */
export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  path: text('path').notNull(),
  contentType: text('content_type').notNull(),
  bytes: integer('bytes').notNull(),
  projectId: text('project_id'),
  /** Lo scontrino della chiamata che l'ha prodotto (D36). */
  generationId: text('generation_id'),
  createdAt: integer('created_at').notNull(),
});

export type AssetRow = typeof assets.$inferSelect;

/**
 * Le immagini della scheda dei personaggi (T3.6): una riga per angolazione e per tentativo. Lo
 * stato segue il lavoro in coda che le fa; `asset_id` c'è quando l'immagine è pronta.
 */
export const characterSheetImages = sqliteTable(
  'character_sheet_images',
  {
    id: text('id').primaryKey(),
    characterId: text('character_id').notNull(),
    attempt: integer('attempt').notNull(),
    angle: text('angle').notNull(),
    status: text('status').notNull(),
    assetId: text('asset_id'),
    receiptId: text('receipt_id'),
    errorCode: text('error_code'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('sheet_images_per_angolo').on(table.characterId, table.attempt, table.angle),
  ],
);

export type CharacterSheetImageRow = typeof characterSheetImages.$inferSelect;

/**
 * I luoghi del film (architettura §6): quelli che l'utente ha aggiunto dalle proposte della bozza.
 * `prompt` è la descrizione in inglese scritta dallo sceneggiatore; `proposal_id` collega il luogo
 * alla proposta da cui viene (D18); `chosen_asset_id` è l'immagine scelta come riferimento (T3.7).
 */
/**
 * Il moodboard del film (T4.10, D37): palette e consigli, in JSON, e una riga sola per film. Una riga
 * che non c'è vuol dire «nessun moodboard»; `updatedAt` serve alla regola R9 (i take girati prima
 * del cambiamento ricevono un avviso leggero).
 */
export const moodboards = sqliteTable('moodboards', {
  projectId: text('project_id').primaryKey(),
  palette: text('palette').notNull(),
  notes: text('notes').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

/** Palette e consigli di una scena: se manca, per quella scena vale il moodboard del film. */
export const moodboardScenes = sqliteTable(
  'moodboard_scenes',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    sceneId: text('scene_id').notNull(),
    palette: text('palette').notNull(),
    notes: text('notes').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [uniqueIndex('moodboard_scenes_per_scena').on(table.projectId, table.sceneId)],
);

/**
 * Le immagini di riferimento del moodboard (generate o caricate). Il file sta tra gli `assets`; qui la
 * lettura del servizio, i colori calcolati dal codice e se l'immagine entra `solo per l'analisi` (D38).
 */
export const moodboardReferences = sqliteTable(
  'moodboard_references',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    sceneId: text('scene_id'),
    assetId: text('asset_id').notNull(),
    origin: text('origin').notNull(),
    analysisOnly: integer('analysis_only', { mode: 'boolean' }).notNull(),
    description: text('description').notNull(),
    moodTags: text('mood_tags').notNull(),
    palette: text('palette').notNull(),
    generationId: text('generation_id'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('moodboard_references_per_film').on(table.projectId, table.createdAt)],
);

export type MoodboardReferenceRow = typeof moodboardReferences.$inferSelect;

/** Una richiesta di immagini di riferimento (T4.10): un lavoro in coda con il suo stato, come un tentativo. */
export const moodboardRuns = sqliteTable(
  'moodboard_runs',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    sceneId: text('scene_id'),
    status: text('status').notNull(),
    images: integer('images').notNull(),
    errorCode: text('error_code'),
    modelLabel: text('model_label'),
    costUsd: real('cost_usd'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('moodboard_runs_per_film').on(table.projectId, table.createdAt)],
);

export type MoodboardRunRow = typeof moodboardRuns.$inferSelect;

/**
 * I gialli che l'utente ha scelto di ignorare (T5.3). I gialli si ricalcolano, quindi si salva solo la
 * scelta: la chiave dice di quale situazione si parla, e se la situazione cambia la chiave è un'altra.
 */
export const ignoredFlags = sqliteTable(
  'ignored_flags',
  {
    projectId: text('project_id').notNull(),
    flagKey: text('flag_key').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.flagKey] })],
);

export type IgnoredFlagRow = typeof ignoredFlags.$inferSelect;

/**
 * Il controllo della storia (T5.2): la segretaria di edizione legge la stesura finale e le inquadrature
 * pensate. Per film ne vale uno solo, l'ultimo. `fingerprint` riassume ciò che ha letto (la stesura e le
 * inquadrature): se cambia, il controllo è vecchio.
 */
export const scriptChecks = sqliteTable(
  'script_checks',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    fingerprint: text('fingerprint').notNull(),
    /** Lo scontrino della chiamata. */
    generationId: text('generation_id').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('script_checks_per_film').on(table.projectId, table.createdAt)],
);

export type ScriptCheckRow = typeof scriptChecks.$inferSelect;

/** Una cosa che non torna, nell'ordine in cui la segretaria l'ha detta. */
export const scriptIssues = sqliteTable(
  'script_issues',
  {
    id: text('id').primaryKey(),
    checkId: text('check_id').notNull(),
    position: integer('position').notNull(),
    sceneId: text('scene_id'),
    shotId: text('shot_id'),
    code: text('code').notNull(),
    light: integer('light', { mode: 'boolean' }).notNull(),
    reason: text('reason').notNull(),
  },
  (table) => [index('script_issues_per_controllo').on(table.checkId, table.position)],
);

export type ScriptIssueRow = typeof scriptIssues.$inferSelect;

/**
 * Le immagini caricate dall'utente (T4.8, D19): luoghi e oggetti del film. Il file sta tra gli `assets`
 * (id = checksum); qui il film, cosa sono e cosa ha detto il controllo.
 */
export const uploads = sqliteTable(
  'uploads',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    assetId: text('asset_id').notNull(),
    kind: text('kind').notNull(),
    locationId: text('location_id'),
    name: text('name').notNull(),
    checked: integer('checked', { mode: 'boolean' }).notNull(),
    description: text('description'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('uploads_per_film').on(table.projectId, table.createdAt)],
);

export type UploadRow = typeof uploads.$inferSelect;

export const locations = sqliteTable(
  'locations',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    prompt: text('prompt').notNull(),
    proposalId: text('proposal_id'),
    chosenAssetId: text('chosen_asset_id'),
    /** Quando l'immagine di riferimento è cambiata (T4.9, R6): le inquadrature fatte prima ingialliscono. */
    referenceChangedAt: integer('reference_changed_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('locations_per_film').on(table.projectId, table.createdAt)],
);

export type LocationRow = typeof locations.$inferSelect;

/**
 * I tentativi di immagini del set di un luogo (T3.7): ogni richiesta è una chiamata sola che dà
 * più immagini, quindi lo stato è uno solo e i file stanno in `asset_ids` (JSON).
 */
export const locationAttempts = sqliteTable(
  'location_attempts',
  {
    id: text('id').primaryKey(),
    locationId: text('location_id').notNull(),
    attempt: integer('attempt').notNull(),
    status: text('status').notNull(),
    assetIds: text('asset_ids').notNull(),
    receiptId: text('receipt_id'),
    errorCode: text('error_code'),
    /** Il servizio e il costo vero: li mostra l'intestazione del tentativo. */
    modelLabel: text('model_label'),
    costUsd: real('cost_usd'),
    /** Se è un ritocco (T4.9): l'immagine, l'operazione e le parole dell'utente, in JSON. */
    retouch: text('retouch'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [uniqueIndex('location_attempts_per_tentativo').on(table.locationId, table.attempt)],
);

export type LocationAttemptRow = typeof locationAttempts.$inferSelect;

/**
 * Il piano delle inquadrature di una scena (T3.9): una riga per scena di un film. Dice da quale
 * versione della stesura e da quale testo della scena (`scene_hash`) è nato, così si vede quando la
 * scena cambia dopo; `generation_id` è lo scontrino dell'aiuto regista e `notes` ciò che ha
 * spiegato. Rifare la scena sostituisce il piano.
 */
export const shotPlans = sqliteTable(
  'shot_plans',
  {
    projectId: text('project_id').notNull(),
    sceneNumber: integer('scene_number').notNull(),
    sceneHash: text('scene_hash').notNull(),
    screenplayId: text('screenplay_id').notNull(),
    generationId: text('generation_id'),
    notes: text('notes'),
    /** L'uscita della scena prima da cui è partito (JSON), se c'era: se poi cambia, la prima inquadratura è gialla (R2). */
    previousExit: text('previous_exit'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.sceneNumber] })],
);

export type ShotPlanRow = typeof shotPlans.$inferSelect;

/**
 * Le inquadrature di una scena (T3.9, architettura §6): `spec` è la scheda inquadratura (ShotSpec)
 * in JSON, validata con Zod quando si legge; `position` è l'ordine nella scena.
 */
export const shots = sqliteTable(
  'shots',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    sceneNumber: integer('scene_number').notNull(),
    position: integer('position').notNull(),
    spec: text('spec').notNull(),
    /** La variante di storyboard scelta: il riferimento visivo della card (T4.1). */
    chosenAssetId: text('chosen_asset_id'),
    /** Il take che l'utente ha scelto di tenere (T4.6): quello che la card fa vedere. */
    chosenTakeId: text('chosen_take_id'),
    /** Quando il primo o l'ultimo fotogramma (o la scelta tra generarlo e caricarlo) è cambiato l'ultima volta (T5.1, R5). */
    framesChangedAt: integer('frames_changed_at'),
  },
  (table) => [index('shots_per_scena').on(table.projectId, table.sceneNumber, table.position)],
);

export type ShotRow = typeof shots.$inferSelect;

/**
 * I tentativi di storyboard di un'inquadratura (T4.1): come per i luoghi, ogni richiesta è una
 * chiamata sola che dà più varianti, quindi lo stato è uno solo e i file stanno in `asset_ids` (JSON).
 */
export const storyboardAttempts = sqliteTable(
  'storyboard_attempts',
  {
    id: text('id').primaryKey(),
    shotId: text('shot_id').notNull(),
    /** `storyboard` o `end_frame` (T4.2): ogni modo ha i suoi tentativi, numerati a parte. */
    mode: text('mode').notNull().default('storyboard'),
    attempt: integer('attempt').notNull(),
    status: text('status').notNull(),
    assetIds: text('asset_ids').notNull(),
    receiptId: text('receipt_id'),
    errorCode: text('error_code'),
    modelLabel: text('model_label'),
    costUsd: real('cost_usd'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('storyboard_attempts_per_tentativo').on(table.shotId, table.mode, table.attempt),
  ],
);

export type StoryboardAttemptRow = typeof storyboardAttempts.$inferSelect;

/**
 * I take video di un'inquadratura (T4.3): ogni «Genera» è una riga, una clip fatta da un servizio.
 * Porta il servizio con il suo nome amichevole (lo scontrino lo dice, ma la card non deve leggerlo da
 * lì), lo scontrino del video e il costo reale preso da lì quando il take è riuscito.
 */
export const takes = sqliteTable(
  'takes',
  {
    id: text('id').primaryKey(),
    shotId: text('shot_id').notNull(),
    status: text('status').notNull(),
    modelId: text('model_id').notNull(),
    modelLabel: text('model_label').notNull(),
    assetId: text('asset_id'),
    receiptId: text('receipt_id'),
    costUsd: real('cost_usd'),
    errorCode: text('error_code'),
    /** L'audio originale del take è acceso (T5.6): parte spento, e si cambia senza rigenerare (D43). */
    nativeAudio: integer('native_audio', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  // I take si leggono per inquadratura, a ogni apertura del piano e a ogni controllo della pagina.
  (table) => [index('takes_per_inquadratura').on(table.shotId, table.createdAt)],
);

export type TakeRow = typeof takes.$inferSelect;

/**
 * Le tracce audio di un film (T5.5, D24, architettura §5.5): una per tipo, con muto e volume. Il suono
 * sta qui e non nei video, così cambiarlo non tocca le clip.
 */
export const audioTracks = sqliteTable(
  'audio_tracks',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    kind: text('kind').notNull(),
    muted: integer('muted', { mode: 'boolean' }).notNull(),
    volume: real('volume').notNull(),
  },
  (table) => [uniqueIndex('audio_tracks_per_tipo').on(table.projectId, table.kind)],
);

export type AudioTrackRow = typeof audioTracks.$inferSelect;

/**
 * Le clip sulle tracce: la musica sta su una scena, un effetto su un'inquadratura (`start_s` conta da lì).
 * `scene_id` e `shot_id` sono quelli del piano: una musica sopravvive se il piano si rifà.
 */
export const audioClips = sqliteTable(
  'audio_clips',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    trackId: text('track_id').notNull(),
    sceneId: text('scene_id').notNull(),
    shotId: text('shot_id'),
    startS: real('start_s').notNull(),
    durationS: real('duration_s').notNull(),
    volume: real('volume').notNull(),
    fadeInS: real('fade_in_s').notNull(),
    fadeOutS: real('fade_out_s').notNull(),
    description: text('description').notNull(),
    mood: text('mood'),
    chosenVariantId: text('chosen_variant_id'),
    source: text('source').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('audio_clips_per_film').on(table.projectId, table.createdAt)],
);

export type AudioClipRow = typeof audioClips.$inferSelect;

/**
 * Le varianti di una clip: ogni «Genera» è una riga, come un take. Hanno uno scontrino, quindi anche il
 * servizio usato. Un file caricato ha una riga sola, senza servizio (D27).
 */
export const audioVariants = sqliteTable(
  'audio_variants',
  {
    id: text('id').primaryKey(),
    clipId: text('clip_id').notNull(),
    status: text('status').notNull(),
    modelId: text('model_id'),
    modelLabel: text('model_label'),
    assetId: text('asset_id'),
    receiptId: text('receipt_id'),
    costUsd: real('cost_usd'),
    errorCode: text('error_code'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('audio_variants_per_clip').on(table.clipId, table.createdAt)],
);

export type AudioVariantRow = typeof audioVariants.$inferSelect;

/**
 * I fotogrammi presi da un take (T4.6): «Usa questo fotogramma come punto di partenza». Restano dopo
 * che l'utente sceglie altro, così si possono riprendere; il file è un'immagine normale (`assets`).
 */
export const takeFrames = sqliteTable(
  'take_frames',
  {
    id: text('id').primaryKey(),
    shotId: text('shot_id').notNull(),
    takeId: text('take_id').notNull(),
    atS: real('at_s').notNull(),
    assetId: text('asset_id').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('take_frames_per_inquadratura').on(table.shotId, table.createdAt)],
);

export type TakeFrameRow = typeof takeFrames.$inferSelect;

/**
 * I montaggi di un film (T5.7): il film si rifà da capo ogni volta, e vale l'ultimo. `fingerprint` è
 * l'impronta di ciò che è entrato: se cambia, il film montato è indietro.
 */
export const filmAssemblies = sqliteTable(
  'film_assemblies',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    status: text('status').notNull(),
    fingerprint: text('fingerprint').notNull(),
    assetId: text('asset_id'),
    durationS: real('duration_s'),
    errorCode: text('error_code'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('film_assemblies_per_film').on(table.projectId, table.createdAt)],
);

export type FilmAssemblyRow = typeof filmAssemblies.$inferSelect;

/**
 * Le esportazioni di un film (T5.8): il file finale, fatto dal film montato alla qualità scelta. Non si
 * salva il percorso intero ma il nome del file: la cartella si può spostare (architettura §6.1).
 */
export const filmExports = sqliteTable(
  'film_exports',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    status: text('status').notNull(),
    sourceAssetId: text('source_asset_id').notNull(),
    shortSide: integer('short_side').notNull(),
    fileName: text('file_name'),
    errorCode: text('error_code'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('film_exports_per_film').on(table.projectId, table.createdAt)],
);

export type FilmExportRow = typeof filmExports.$inferSelect;

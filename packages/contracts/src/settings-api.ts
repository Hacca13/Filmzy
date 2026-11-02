import { z } from 'zod';

import { configIssueSchema } from './config/issues.js';
import { troupeConfigSchema } from './config/release.js';

/**
 * Le richieste e le risposte delle Impostazioni (T2.3): bozza della configurazione, chiavi dei
 * fornitori, preferenze dell'app e controllo degli aggiornamenti. Il server le controlla in
 * ingresso e l'interfaccia in uscita (regola d'oro 3).
 */

/** Una release in breve: abbastanza per dire «versione attiva» senza portarsi dietro tutto. */
export const releaseSummarySchema = z.object({
  id: z.string().min(1),
  /** Il numero di pubblicazione: «Versione 7». */
  number: z.number().int().positive().optional(),
  hash: z.string().min(1),
  note: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
  activatedAt: z.iso.datetime().optional(),
});

export type ReleaseSummary = z.infer<typeof releaseSummarySchema>;

/**
 * `GET /troupe/draft`: la copia di lavoro. Se non c'è una bozza, `config` è quella della release
 * attiva (si parte da lì) e `hasDraft` è falso. `hasUnpublishedChanges` dice se la bozza differisce
 * dalla release attiva («Hai modifiche non pubblicate»).
 */
export const draftViewSchema = z.object({
  config: troupeConfigSchema,
  hasDraft: z.boolean(),
  hasUnpublishedChanges: z.boolean(),
  activeRelease: releaseSummarySchema.optional(),
  issues: z.array(configIssueSchema),
});

export type DraftView = z.infer<typeof draftViewSchema>;

/** `PUT /troupe/draft`: la bozza si salva anche con problemi, che tornano nella risposta. */
export const saveDraftBodySchema = z.object({ config: troupeConfigSchema });

export type SaveDraftBody = z.infer<typeof saveDraftBodySchema>;

/** `POST /troupe/publish`: la nota è obbligatoria (architettura §4.5), così lo storico si capisce. */
export const publishBodySchema = z.object({ note: z.string().trim().min(1).max(500) });

export type PublishBody = z.infer<typeof publishBodySchema>;

/** Senza `release` non si è pubblicato niente: i `issues` dicono perché. */
export const publishResponseSchema = z.object({
  release: releaseSummarySchema.optional(),
  issues: z.array(configIssueSchema),
});

export type PublishResponse = z.infer<typeof publishResponseSchema>;

/**
 * Lo stato di una chiave. **Mai il valore** (D25): solo se c'è, da dove viene e a quali
 * connessioni serve.
 */
export const secretStatusSchema = z.object({
  name: z.string().min(1),
  source: z.enum(['env', 'secret']),
  present: z.boolean(),
  connectionIds: z.array(z.string().min(1)),
});

export type SecretStatus = z.infer<typeof secretStatusSchema>;

/** `writable` è falso finché non c'è il portachiavi del sistema (Electron, M6; D45). */
export const secretsViewSchema = z.object({
  secrets: z.array(secretStatusSchema),
  writable: z.boolean(),
});

export type SecretsView = z.infer<typeof secretsViewSchema>;

/** `PUT /secrets/:name`: in sola scrittura, la chiave non si rilegge mai. */
export const setSecretBodySchema = z.object({ value: z.string().trim().min(1).max(4096) });

export type SetSecretBody = z.infer<typeof setSecretBodySchema>;

/**
 * Le preferenze dell'app: non sono affari della troupe, quindi stanno fuori da `UserSettings`.
 * `takeAudio` è la preferenza di partenza per generare le clip con l'audio (D43, spenta);
 * `checkForUpdates` accende il controllo all'avvio (D44).
 */
export const appPreferencesSchema = z.object({
  takeAudio: z.boolean(),
  checkForUpdates: z.boolean(),
});

export type AppPreferences = z.infer<typeof appPreferencesSchema>;

export const DEFAULT_APP_PREFERENCES: AppPreferences = { takeAudio: false, checkForUpdates: true };

/** `POST /updates/check`: l'esito del controllo, a richiesta (D44). */
export const updateCheckResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('up_to_date') }),
  z.object({ status: z.literal('available'), version: z.string().min(1) }),
  // Il controllo vero arriva con l'app installata (T6.4): finché non c'è, lo dice.
  z.object({ status: z.literal('unavailable') }),
]);

export type UpdateCheckResult = z.infer<typeof updateCheckResultSchema>;

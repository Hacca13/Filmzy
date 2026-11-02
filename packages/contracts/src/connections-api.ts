import { z } from 'zod';

import { modelPricingSchema, modelStatusSchema } from './config/models.js';
import { connectionIdSchema, modelIdSchema } from './ids.js';
import { modelGroupSchema, modelKindSchema } from './model-kind.js';

/**
 * Fornitori, servizi e chiavi per le impostazioni (T2.7, architettura §4.3, §5.6, D36): quali
 * fornitori sono collegati, quali servizi l'utente ha attivato, il predefinito di ogni gruppo e di
 * ogni fornitore, il limite di spesa mensile. Le scelte valgono subito (tabella `settings`), senza
 * pubblicare una release.
 */

/** Perché un servizio, oggi, non si può usare. */
export const UNUSABLE_REASONS = ['retired', 'connection_disabled', 'key_missing'] as const;

export const unusableReasonSchema = z.enum(UNUSABLE_REASONS);

export type UnusableReason = z.infer<typeof unusableReasonSchema>;

export const serviceStateSchema = z.object({
  modelId: modelIdSchema,
  /** Il nome che vede l'utente (D36). */
  label: z.string().min(1),
  kind: modelKindSchema,
  status: modelStatusSchema,
  price: modelPricingSchema,
  /** Può leggere le immagini: è ciò che lo fa entrare nel gruppo «Lettura immagini». */
  vision: z.boolean(),
  /** L'utente l'ha attivato (o, senza scelte salvate, vale quanto dice la release). */
  enabled: z.boolean(),
  /** Si può usare adesso. Se non si può, `unusableReason` dice perché. */
  usable: z.boolean(),
  unusableReason: unusableReasonSchema.optional(),
  /** È il servizio predefinito di questo fornitore. */
  isProviderDefault: z.boolean(),
});

export type ServiceState = z.infer<typeof serviceStateSchema>;

/** La chiave di un fornitore: **mai il valore**, solo se c'è e dove (D25). */
export const providerKeySchema = z.object({
  name: z.string().min(1),
  present: z.boolean(),
  foundIn: z.enum(['env', 'stored']).optional(),
});

export const providerStateSchema = z.object({
  connectionId: connectionIdSchema,
  /** Il nome per l'utente («fal.ai»). */
  label: z.string().min(1),
  adapter: z.string().min(1),
  enabled: z.boolean(),
  /** Il fornitore finto, un modello sul proprio computer e simili non vogliono nessuna chiave. */
  keyRequired: z.boolean(),
  key: providerKeySchema.optional(),
  /** Si può scrivere una chiave solo con il portachiavi del sistema (Electron, D45). */
  keyWritable: z.boolean(),
  monthlyCapUsd: z.number().positive().optional(),
  /** L'adapter sa provare la connessione senza spendere. */
  canTest: z.boolean(),
  services: z.array(serviceStateSchema),
  /** I ruoli che usano questo fornitore (nel modello principale o fra i candidati). */
  usedBy: z.array(z.object({ roleId: z.string().min(1), label: z.string().min(1) })),
});

export type ProviderState = z.infer<typeof providerStateSchema>;

export const groupStateSchema = z.object({
  group: modelGroupSchema,
  /** Solo i fornitori che hanno almeno un servizio di questo gruppo, con quei servizi. */
  providers: z.array(providerStateSchema),
  /** Il fornitore e il servizio predefiniti del gruppo, se l'utente li ha scelti. */
  defaultConnectionId: connectionIdSchema.optional(),
  defaultModelId: modelIdSchema.optional(),
});

export type GroupState = z.infer<typeof groupStateSchema>;

/** `GET /connections`. `hasChoices` è falso finché l'utente non ha scelto niente (valgono i valori della release). */
export const connectionsOverviewSchema = z.object({
  groups: z.array(groupStateSchema),
  hasChoices: z.boolean(),
  /** I limiti di spesa che non sono di un fornitore. Facoltativi: nessuno è preimpostato (D36). */
  limits: z.object({ filmBudgetUsd: z.number().positive().optional() }),
});

export type ConnectionsOverview = z.infer<typeof connectionsOverviewSchema>;

/** `PUT /connections/:id/services`: quali servizi di questo fornitore sono attivati. */
export const setServicesBodySchema = z.object({ modelIds: z.array(modelIdSchema) });

export type SetServicesBody = z.infer<typeof setServicesBodySchema>;

/** `PUT /connections/:id/default-service`. */
export const setProviderDefaultBodySchema = z.object({ modelId: modelIdSchema });

export type SetProviderDefaultBody = z.infer<typeof setProviderDefaultBodySchema>;

/** `PUT /groups/:group/default`: il fornitore predefinito del gruppo (si parte dal suo servizio predefinito). */
export const setGroupDefaultBodySchema = z.object({ connectionId: connectionIdSchema });

export type SetGroupDefaultBody = z.infer<typeof setGroupDefaultBodySchema>;

/** `PUT /connections/:id/monthly-cap`: `null` toglie il limite. Nessun limite è preimpostato (D36). */
export const setMonthlyCapBodySchema = z.object({
  usd: z.number().positive().max(1_000_000).nullable(),
});

export type SetMonthlyCapBody = z.infer<typeof setMonthlyCapBodySchema>;

/** `PUT /limits/film-budget`: il limite di spesa per film; `null` lo toglie. Stessa forma del limite mensile. */
export const setFilmBudgetBodySchema = setMonthlyCapBodySchema;

export type SetFilmBudgetBody = SetMonthlyCapBody;

/** `POST /connections/:id/test`: la prova che non costa. Un fallimento è un errore del dominio. */
export const connectionTestResultSchema = z.object({ ok: z.literal(true) });

export type ConnectionTestResult = z.infer<typeof connectionTestResultSchema>;

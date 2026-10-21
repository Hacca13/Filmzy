import { z } from 'zod';

import { configKeySchema, connectionIdSchema } from '../ids.js';

/**
 * Una data senza ora (`checked: 2026-10-19`), normalizzata a `YYYY-MM-DD`. Accetta anche un
 * `Date`, perché i parser YAML non concordano: con js-yaml una data non quotata diventa un
 * oggetto `Date`, con `yaml` resta una stringa. Così la scelta del parser (T0.4) non cambia la
 * validazione.
 */
export const isoDaySchema = z
  .union([z.iso.date(), z.date()])
  .transform((value) => (typeof value === 'string' ? value : value.toISOString().slice(0, 10)));

/**
 * Un intervallo numerico accettato da un parametro (`config/ai/models.yaml`). È `strictObject`
 * perché ha tutti i campi facoltativi: senza, un elenco di valori (`{ values: [...] }`) passerebbe
 * come intervallo vuoto e il controllo dei limiti (§4.6 punto 3) leggerebbe la forma sbagliata.
 */
export const paramRangeSchema = z.strictObject({
  min: z.number().optional(),
  max: z.number().optional(),
});

/** I valori ammessi da un parametro, quando non è un intervallo. */
export const paramValuesSchema = z.strictObject({
  values: z.array(z.union([z.string(), z.number(), z.boolean()])).min(1),
});

export const paramSpecSchema = z.union([paramRangeSchema, paramValuesSchema]);

export type ParamSpec = z.infer<typeof paramSpecSchema>;

/** I parametri che un modello accetta, con i loro limiti (architettura §4.3, §4.6 punto 3). */
export const modelParamsSchema = z.record(z.string().min(1), paramSpecSchema);

/** Prezzo per milione di token, con eventuali fasce oltre una soglia di prompt. */
export const pricingPerMtokSchema = z.object({
  unit: z.literal('per_mtok'),
  input: z.number().nonnegative(),
  output: z.number().nonnegative(),
  tiers: z
    .array(
      z.object({
        above_prompt_tokens: z.number().int().positive(),
        input: z.number().nonnegative(),
        output: z.number().nonnegative(),
      }),
    )
    .optional(),
  checked: isoDaySchema,
});

function pricingPerUnitSchema<Unit extends string>(unit: Unit) {
  return z.object({
    unit: z.literal(unit),
    value: z.number().nonnegative(),
    note: z.string().min(1).optional(),
    checked: isoDaySchema,
  });
}

/** Prezzo di un servizio (architettura §4.3): un'unità diversa per ogni tipo di modello. */
export const modelPricingSchema = z.discriminatedUnion('unit', [
  pricingPerMtokSchema,
  pricingPerUnitSchema('per_image'),
  pricingPerUnitSchema('per_second'),
]);

export type ModelPricing = z.infer<typeof modelPricingSchema>;

/** `true | false | unknown`: "unknown" conta come "no" per il router (architettura §4.3). */
export const trueFalseUnknownSchema = z.union([z.boolean(), z.literal('unknown')]);

/** Se il fornitore accetta volti reali (architettura §4.3, §3): solo video. */
export const realFacesSchema = z.enum(['no', 'verified_assets', 'allowed', 'unknown']);

/** Combinazioni di ingressi che un punto d'accesso video accetta (architettura §4.3, D20). */
export const INPUT_MODES = [
  'references',
  'first_frame',
  'first_frame+last_frame',
  'references+first_frame',
] as const;

export const inputModeSchema = z.enum(INPUT_MODES);

export const MODEL_STATUSES = ['active', 'testing', 'retired'] as const;

export const modelStatusSchema = z.enum(MODEL_STATUSES);

export type ModelStatus = z.infer<typeof modelStatusSchema>;

export const llmCapabilitiesSchema = z.array(configKeySchema);

/**
 * `max_reference_images: 0` è un dato vero, non un errore: molti fornitori hanno un punto
 * d'accesso che scrive da testo e non riceve nessuna immagine (verificato in T1.7). Il router lo
 * usa per escludere quella voce quando la richiesta porta dei riferimenti.
 */
export const imageCapabilitiesSchema = z.object({
  max_reference_images: z.number().int().nonnegative(),
  image_edit: trueFalseUnknownSchema,
  mask_edit: trueFalseUnknownSchema,
});

export const videoCapabilitiesSchema = z.object({
  durations_s: z.object({ min: z.number().positive().optional(), max: z.number().positive() }),
  input_modes: z.array(inputModeSchema),
  max_reference_images: z.number().int().nonnegative(),
  max_characters: z.number().int().positive(),
  native_audio: z.boolean(),
  real_faces: realFacesSchema,
  minors: z.boolean(),
});

/** Capacità di musica, effetti e voci: non ancora dettagliate dall'architettura (§13). */
export const audioCapabilitiesSchema = z.object({ commercial_use: z.boolean().optional() });

function modelEntryFields<Kind extends string, Capabilities extends z.ZodType>(
  kind: Kind,
  capabilities: Capabilities,
) {
  return {
    label: z.string().min(1),
    kind: z.literal(kind),
    connection: connectionIdSchema,
    provider_model: z.string().min(1),
    family: configKeySchema.optional(),
    capabilities,
    params: modelParamsSchema.optional(),
    request_fields: z.record(z.string().min(1), z.string().min(1)).optional(),
    pricing: modelPricingSchema,
    quality: z.record(z.string(), z.unknown()).optional(),
    status: modelStatusSchema,
    monthly_cap_usd: z.number().positive().optional(),
  };
}

export const llmModelEntrySchema = z.object(modelEntryFields('llm', llmCapabilitiesSchema));
export const imageModelEntrySchema = z.object(modelEntryFields('image', imageCapabilitiesSchema));
export const videoModelEntrySchema = z.object(modelEntryFields('video', videoCapabilitiesSchema));
export const musicModelEntrySchema = z.object(modelEntryFields('music', audioCapabilitiesSchema));
export const sfxModelEntrySchema = z.object(modelEntryFields('sfx', audioCapabilitiesSchema));
export const voiceModelEntrySchema = z.object(modelEntryFields('voice', audioCapabilitiesSchema));

const placeholderPattern = /^<.*>$/;

/**
 * Una voce del catalogo (architettura §4.3): un punto d'accesso presso un fornitore. Un
 * identificativo segnaposto (`<...>`) è ammesso solo con `status: testing` (§4.6 punto 7): la
 * chiamata reale resta bloccata finché non viene verificato.
 */
export const modelEntrySchema = z
  .discriminatedUnion('kind', [
    llmModelEntrySchema,
    imageModelEntrySchema,
    videoModelEntrySchema,
    musicModelEntrySchema,
    sfxModelEntrySchema,
    voiceModelEntrySchema,
  ])
  .refine((entry) => !placeholderPattern.test(entry.provider_model) || entry.status === 'testing', {
    message: 'Un id segnaposto (<...>) è ammesso solo con status "testing" (architettura §4.6 punto 7)',
    path: ['provider_model'],
  });

export type ModelEntry = z.infer<typeof modelEntrySchema>;

/** Il file di seme `config/ai/models.yaml`: `version` più il catalogo per chiave. */
export const modelsFileSchema = z.object({
  version: z.literal(1),
  models: z.record(configKeySchema, modelEntrySchema),
});

export type ModelsFile = z.infer<typeof modelsFileSchema>;

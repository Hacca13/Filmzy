import { z } from 'zod';

/**
 * Dagli schemi Zod dei contratti ai campi di un modulo (T2.3). Lo schema Zod diventa JSON Schema
 * (`z.toJSONSchema`), e da lì si capisce che campo disegnare: testo, numero, interruttore,
 * elenco, gruppo, mappa, scelta fra varianti. Così un campo nuovo nei contratti compare da solo
 * nelle impostazioni avanzate, senza toccare l'interfaccia.
 *
 * La **validazione** non passa da qui: si fa con lo schema Zod vero (`issues.ts`), che sa anche i
 * controlli che il JSON Schema non può dire.
 */

export interface JsonSchema {
  /** Una lista quando lo schema ammette più tipi semplici (`string | number | boolean`). */
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  propertyNames?: JsonSchema;
  items?: JsonSchema;
  prefixItems?: JsonSchema[];
  enum?: unknown[];
  const?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  format?: string;
  pattern?: string;
}

export function toFormSchema(schema: z.ZodType): JsonSchema {
  // `io: 'input'`: i campi sono quelli che si scrivono, non quelli che escono dopo le conversioni.
  // `unrepresentable: 'any'`: ciò che il JSON Schema non sa dire (una data JS) diventa «qualsiasi
  // cosa» e `classify` lo scarta dalle scelte.
  return z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as JsonSchema;
}

const formSchemas = new WeakMap<z.ZodType, JsonSchema>();

/** Come `toFormSchema`, ma ricorda il risultato: lo schema non cambia, il disegno sì spesso. */
export function formSchemaOf(schema: z.ZodType): JsonSchema {
  let form = formSchemas.get(schema);
  if (form === undefined) {
    form = toFormSchema(schema);
    formSchemas.set(schema, form);
  }
  return form;
}

export type Scalar = string | number | boolean;

export interface GroupField {
  name: string;
  schema: JsonSchema;
  required: boolean;
}

export type FieldKind =
  | { kind: 'text' }
  | { kind: 'number'; integer: boolean; min?: number; max?: number }
  | { kind: 'switch' }
  | { kind: 'choice'; options: Scalar[] }
  | { kind: 'fixed'; value: unknown }
  | { kind: 'group'; fields: GroupField[]; closed: boolean }
  | { kind: 'map'; value: JsonSchema; keys?: string[] }
  | { kind: 'list'; item: JsonSchema }
  | { kind: 'variants'; variants: JsonSchema[] }
  // Tutto il resto (un valore libero, come `quality`) si modifica come JSON.
  | { kind: 'raw' };

/** Il limite che Zod mette ai numeri interi per dire «nessun massimo»: non è un limite vero. */
const SAFE_LIMIT = Number.MAX_SAFE_INTEGER;

function isEmpty(schema: JsonSchema): boolean {
  return Object.keys(schema).length === 0;
}

function isScalar(value: unknown): value is Scalar {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function classify(schema: JsonSchema): FieldKind {
  const alternatives = schema.anyOf ?? schema.oneOf;
  if (alternatives !== undefined) {
    // Un `{}` fra le alternative è un tipo che il JSON Schema non sa dire: non si sceglie.
    const variants = alternatives.filter((variant) => !isEmpty(variant));
    if (variants.length === 0) return { kind: 'raw' };
    const [only] = variants;
    return variants.length === 1 && only !== undefined
      ? classify(only)
      : { kind: 'variants', variants };
  }

  if ('const' in schema) return { kind: 'fixed', value: schema.const };
  if (schema.enum !== undefined) return { kind: 'choice', options: schema.enum.filter(isScalar) };

  if (Array.isArray(schema.type)) {
    const variants = schema.type.map((type): JsonSchema => ({ ...schema, type }));
    const [only] = variants;
    return variants.length === 1 && only !== undefined
      ? classify(only)
      : { kind: 'variants', variants };
  }

  switch (schema.type) {
    case 'string':
      return { kind: 'text' };
    case 'boolean':
      return { kind: 'switch' };
    case 'number':
    case 'integer':
      return numberKind(schema);
    case 'array':
      return schema.items === undefined || schema.prefixItems !== undefined
        ? { kind: 'raw' }
        : { kind: 'list', item: schema.items };
    case 'object':
      return objectKind(schema);
    default:
      return { kind: 'raw' };
  }
}

function numberKind(schema: JsonSchema): FieldKind {
  const real = (limit: number | undefined) =>
    limit !== undefined && Math.abs(limit) < SAFE_LIMIT ? limit : undefined;
  const min = real(schema.minimum);
  const max = real(schema.maximum);
  return {
    kind: 'number',
    integer: schema.type === 'integer',
    ...(min === undefined ? {} : { min }),
    ...(max === undefined ? {} : { max }),
  };
}

function objectKind(schema: JsonSchema): FieldKind {
  const names = Object.keys(schema.properties ?? {});
  if (names.length > 0) {
    const required = new Set(schema.required ?? []);
    return {
      kind: 'group',
      closed: schema.additionalProperties === false,
      fields: Object.entries(schema.properties ?? {}).map(([name, field]) => ({
        name,
        schema: field,
        required: required.has(name),
      })),
    };
  }

  if (typeof schema.additionalProperties === 'object' || schema.propertyNames !== undefined) {
    const keys = schema.propertyNames?.enum?.filter(
      (key): key is string => typeof key === 'string',
    );
    return {
      kind: 'map',
      value: typeof schema.additionalProperties === 'object' ? schema.additionalProperties : {},
      ...(keys === undefined ? {} : { keys }),
    };
  }
  return { kind: 'raw' };
}

/** Un valore di partenza per una voce nuova: ciò che serve perché i campi si vedano. */
export function defaultValue(schema: JsonSchema): unknown {
  const kind = classify(schema);
  switch (kind.kind) {
    case 'text':
      return '';
    case 'number':
      return kind.min !== undefined
        ? kind.min
        : schema.exclusiveMinimum !== undefined
          ? schema.exclusiveMinimum + 1
          : 0;
    case 'switch':
      return false;
    case 'choice':
      return kind.options[0];
    case 'fixed':
      return kind.value;
    case 'group':
      return Object.fromEntries(
        kind.fields
          .filter((field) => field.required)
          .map((field) => [field.name, defaultValue(field.schema)]),
      );
    case 'map':
      return {};
    case 'list':
      return [];
    case 'variants': {
      const [first] = kind.variants;
      return first === undefined ? undefined : defaultValue(first);
    }
    case 'raw':
      return {};
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Quanto una variante si adatta a un valore: -1 per niente, più alto è meglio. */
function fit(schema: JsonSchema, value: unknown): number {
  const kind = classify(schema);
  switch (kind.kind) {
    case 'fixed':
      return Object.is(kind.value, value) ? 1000 : -1;
    case 'choice':
      return isScalar(value) && kind.options.includes(value) ? 1 : -1;
    case 'text':
      return typeof value === 'string' ? 1 : -1;
    case 'number':
      return typeof value === 'number' ? 1 : -1;
    case 'switch':
      return typeof value === 'boolean' ? 1 : -1;
    case 'list':
      return Array.isArray(value) ? 1 : -1;
    case 'map':
      return isPlainObject(value) ? 1 : -1;
    case 'raw':
      return 0;
    case 'group':
      return fitGroup(kind.fields, kind.closed, value);
    case 'variants':
      return Math.max(-1, ...kind.variants.map((variant) => fit(variant, value)));
  }
}

function fitGroup(fields: GroupField[], closed: boolean, value: unknown): number {
  if (!isPlainObject(value)) return -1;

  const known = new Map(fields.map((field) => [field.name, field.schema]));
  let score = 1;
  for (const [name, item] of Object.entries(value)) {
    const field = known.get(name);
    if (field === undefined) {
      if (closed) return -1;
      continue;
    }
    // Un campo con valore fisso (`kind: 'llm'`) decide: se non combacia, non è questa la variante.
    if (classify(field).kind === 'fixed' && fit(field, item) < 0) return -1;
    score += 1;
  }
  return score;
}

/** Quale variante sta mostrando un valore: la più adatta, a parità la prima. */
export function pickVariant(variants: JsonSchema[], value: unknown): number {
  let best = 0;
  let bestScore = -2;
  variants.forEach((variant, index) => {
    const score = fit(variant, value);
    if (score > bestScore) {
      best = index;
      bestScore = score;
    }
  });
  return best;
}

/** Il nome di una variante per la tendina: il valore fisso che la distingue, o i suoi campi. */
export function variantLabel(variant: JsonSchema, index: number): string {
  const kind = classify(variant);
  if (kind.kind === 'text') return 'Testo';
  if (kind.kind === 'number') return 'Numero';
  if (kind.kind === 'switch') return 'Sì o no';
  if (kind.kind !== 'group') return `Opzione ${String(index + 1)}`;

  const fixed = kind.fields.find((field) => classify(field.schema).kind === 'fixed');
  if (fixed !== undefined) return String(fixed.schema.const);
  return kind.fields.map((field) => field.name).join(' · ');
}

/** Una copia dell'oggetto con un campo cambiato; con `undefined` il campo sparisce. */
export function withField(
  value: Record<string, unknown>,
  name: string,
  next: unknown,
): Record<string, unknown> {
  // Cambiando un campo che c'è già l'ordine non si sposta: le righe di una mappa non devono
  // rimescolarsi mentre si scrive.
  if (next !== undefined) return { ...value, [name]: next };
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== name));
}

export { isPlainObject };

import {
  cameraMovementSchema,
  characterTagSchema,
  cinematographyPresetSchema,
  connectionSchema,
  featuresSchema,
  genreSchema,
  limitsSchema,
  modelEntrySchema,
  roleConfigEntrySchema,
  stylePresetSchema,
  toneSchema,
  type ConfigIssue,
  type ModelPricing,
  type TroupeConfigData,
} from '@filmzy/contracts';
import type { z } from 'zod';

import { defaultValue, formSchemaOf, isPlainObject, withField } from '../../forms/json-schema';
import { valueLabel } from '../../forms/labels';

/**
 * Le sezioni di «Avanzate» (T2.3): per ognuna, quali voci ha, con quale schema si modificano, come
 * si riassumono in una riga e come si cambia la configurazione quando una voce cambia. Non c'è
 * niente da disegnare qui: i campi li ricava `SchemaField` dagli schemi dei contratti.
 *
 * Le voci in modifica possono essere a metà (un campo vuoto, un valore sbagliato): per questo i
 * riassunti leggono i dati con cautela e non danno mai per scontata la forma.
 */

export interface Item {
  /** Per le mappe è la chiave della voce, per gli elenchi `categoria:posizione`. */
  id: string;
  value: unknown;
  schema: z.ZodType;
  summary: string;
  removable: boolean;
}

export interface AddTarget {
  label: string;
  /** Aggiunge una voce nuova col nome dato (l'id, nei preset). */
  add: (config: TroupeConfigData, name: string) => TroupeConfigData;
}

export interface SectionDef {
  id: string;
  title: string;
  /** La sezione che il validatore nomina nei suoi problemi. */
  issueSection: NonNullable<ConfigIssue['section']>;
  items: (config: TroupeConfigData) => Item[];
  replace: (config: TroupeConfigData, itemId: string, value: unknown) => TroupeConfigData;
  remove?: (config: TroupeConfigData, itemId: string) => TroupeConfigData;
  addTargets: AddTarget[];
}

function text(value: unknown, field: string): string {
  const found = isPlainObject(value) ? value[field] : undefined;
  return typeof found === 'string' ? found : '';
}

function formatPrice(pricing: ModelPricing | undefined): string {
  if (pricing === undefined) return 'senza prezzo';
  switch (pricing.unit) {
    case 'per_second':
      return `${String(pricing.value)} $ al secondo`;
    case 'per_image':
      return `${String(pricing.value)} $ a immagine`;
    case 'per_mtok':
      return `${String(pricing.input)} / ${String(pricing.output)} $ per milione di token`;
  }
}

/** Le tre sezioni fatte di una mappa nome → voce. */
type RecordKey = 'connections' | 'models' | 'roles';

function recordSection(options: {
  key: RecordKey;
  title: string;
  schema: z.ZodType;
  summary: (id: string, value: unknown) => string;
  editableList: boolean;
  addLabel?: string;
}): SectionDef {
  const { key, schema } = options;
  const entries = (config: TroupeConfigData): Record<string, unknown> => config[key];
  const withEntries = (config: TroupeConfigData, next: Record<string, unknown>) => ({
    ...config,
    [key]: next,
  });

  return {
    id: key,
    title: options.title,
    issueSection: key,
    items: (config) =>
      Object.entries(entries(config)).map(([id, value]) => ({
        id,
        value,
        schema,
        summary: options.summary(id, value),
        removable: options.editableList,
      })),
    replace: (config, id, value) => withEntries(config, withField(entries(config), id, value)),
    ...(options.editableList
      ? {
          remove: (config: TroupeConfigData, id: string) =>
            withEntries(config, withField(entries(config), id, undefined)),
        }
      : {}),
    addTargets: options.editableList
      ? [
          {
            label: options.addLabel ?? 'voce',
            add: (config, name) =>
              withEntries(
                config,
                withField(entries(config), name, defaultValue(formSchemaOf(schema))),
              ),
          },
        ]
      : [],
  };
}

type PresetCategory = keyof TroupeConfigData['presets'];

const PRESET_CATEGORIES: {
  key: PresetCategory;
  label: string;
  singular: string;
  schema: z.ZodType;
}[] = [
  { key: 'styles', label: 'Stili', singular: 'stile', schema: stylePresetSchema },
  { key: 'genres', label: 'Generi', singular: 'genere', schema: genreSchema },
  { key: 'tones', label: 'Toni', singular: 'tono', schema: toneSchema },
  {
    key: 'cinematography',
    label: 'Fotografia',
    singular: 'fotografia',
    schema: cinematographyPresetSchema,
  },
  { key: 'characterTags', label: 'Tag personaggi', singular: 'tag', schema: characterTagSchema },
  {
    key: 'cameraMovements',
    label: 'Movimenti macchina',
    singular: 'movimento',
    schema: cameraMovementSchema,
  },
];

function presetList(config: TroupeConfigData, key: PresetCategory): unknown[] {
  return config.presets[key];
}

function withPresetList(config: TroupeConfigData, key: PresetCategory, next: unknown[]) {
  return { ...config, presets: { ...config.presets, [key]: next } };
}

/** Nei preset l'id di una voce è `categoria:posizione`: il nome vero (`id`) si può modificare. */
function parsePresetItemId(itemId: string): { key: PresetCategory; index: number } | undefined {
  const [key, position] = itemId.split(':');
  const category = PRESET_CATEGORIES.find((candidate) => candidate.key === key);
  const index = Number(position);
  return category === undefined || !Number.isInteger(index)
    ? undefined
    : { key: category.key, index };
}

const presetsSection: SectionDef = {
  id: 'presets',
  title: 'Preset',
  issueSection: 'presets',
  items: (config) =>
    PRESET_CATEGORIES.flatMap(({ key, label, schema }) =>
      presetList(config, key).map((value, index) => ({
        id: `${key}:${String(index)}`,
        value,
        schema,
        summary: `${label} · ${text(value, 'label') || text(value, 'id')}`,
        removable: true,
      })),
    ),
  replace: (config, itemId, value) => {
    const target = parsePresetItemId(itemId);
    if (target === undefined) return config;
    return withPresetList(
      config,
      target.key,
      presetList(config, target.key).map((old, at) => (at === target.index ? value : old)),
    );
  },
  remove: (config, itemId) => {
    const target = parsePresetItemId(itemId);
    if (target === undefined) return config;
    return withPresetList(
      config,
      target.key,
      presetList(config, target.key).filter((_, at) => at !== target.index),
    );
  },
  addTargets: PRESET_CATEGORIES.map(({ key, singular, schema }) => ({
    label: singular,
    add: (config, name) =>
      withPresetList(config, key, [
        ...presetList(config, key),
        withField(defaultValue(formSchemaOf(schema)) as Record<string, unknown>, 'id', name),
      ]),
  })),
};

const FEATURES_AND_LIMITS = [
  { key: 'features', summary: 'Funzioni', schema: featuresSchema },
  { key: 'limits', summary: 'Limiti', schema: limitsSchema },
] as const;

const featuresSection: SectionDef = {
  id: 'features',
  title: 'Funzioni e limiti',
  issueSection: 'features',
  items: (config) =>
    FEATURES_AND_LIMITS.map(({ key, summary, schema }) => ({
      id: key,
      value: config[key],
      schema,
      summary,
      removable: false,
    })),
  replace: (config, itemId, value) =>
    FEATURES_AND_LIMITS.some(({ key }) => key === itemId) ? { ...config, [itemId]: value } : config,
  addTargets: [],
};

export const SECTIONS: SectionDef[] = [
  recordSection({
    key: 'connections',
    title: 'Connessioni',
    schema: connectionSchema,
    editableList: true,
    addLabel: 'connessione',
    summary: (id, value) =>
      `${id} · ${text(value, 'adapter')} · ${isPlainObject(value) && value.enabled === false ? 'Spenta' : 'Attiva'}`,
  }),
  recordSection({
    key: 'models',
    title: 'Modelli',
    schema: modelEntrySchema,
    editableList: true,
    addLabel: 'modello',
    summary: (id, value) => {
      const pricing = isPlainObject(value)
        ? (value.pricing as ModelPricing | undefined)
        : undefined;
      return [
        text(value, 'label') || id,
        text(value, 'connection'),
        valueLabel(text(value, 'kind')),
        formatPrice(pricing),
        valueLabel(text(value, 'status')),
      ].join(' · ');
    },
  }),
  recordSection({
    key: 'roles',
    title: 'Ruoli',
    schema: roleConfigEntrySchema,
    // I ruoli sono quelli che il codice conosce: si cambiano, non si aggiungono né si tolgono.
    editableList: false,
    summary: (id, value) => {
      const role = isPlainObject(value) ? value : {};
      const routing = isPlainObject(role.routing) ? role.routing : undefined;
      const who =
        typeof role.model === 'string'
          ? role.model
          : Array.isArray(routing?.candidates)
            ? (routing.candidates as unknown[]).join(', ')
            : 'nessun servizio';
      const instructions =
        typeof role.instructions === 'string' ? role.instructions : 'senza istruzioni';
      return `${text(value, 'label') || id} · ${who} · ${instructions}`;
    },
  }),
  presetsSection,
  featuresSection,
];

/** I problemi del validatore che riguardano una voce (per chiave o per ruolo), e quelli generali. */
export function splitIssues(
  section: SectionDef,
  items: Item[],
  issues: readonly ConfigIssue[],
): { byItem: ReadonlyMap<string, ConfigIssue[]>; general: ConfigIssue[] } {
  const ids = new Set(items.map((item) => item.id));
  const byItem = new Map<string, ConfigIssue[]>();
  const general: ConfigIssue[] = [];

  for (const issue of issues) {
    // Le istruzioni che non rendono nominano il ruolo: si mostrano sul ruolo, non in una lista a parte.
    const belongsHere =
      issue.section === section.issueSection ||
      (section.id === 'roles' && issue.section === 'instructions');
    if (!belongsHere) continue;

    const owner = [issue.key, issue.role].find((id) => id !== undefined && ids.has(id));
    if (owner === undefined) {
      general.push(issue);
    } else {
      byItem.set(owner, [...(byItem.get(owner) ?? []), issue]);
    }
  }
  return { byItem, general };
}

/** I problemi che nessuna sezione sa mostrare: istruzioni di un ruolo sconosciuto, prove, ecc. */
export function orphanIssues(issues: readonly ConfigIssue[]): ConfigIssue[] {
  const known = new Set<string | undefined>([
    ...SECTIONS.map((section) => section.issueSection),
    'instructions',
  ]);
  return issues.filter((issue) => !known.has(issue.section));
}

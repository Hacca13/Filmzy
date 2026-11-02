import type { ConfigChange, TroupeConfigData } from '@filmzy/contracts';

import { canonicalJson } from './hash.js';

/**
 * Le differenze fra due configurazioni (architettura §4.5): cosa si aggiunge, cosa si toglie, cosa
 * cambia e in quali campi. Serve a «Pubblica» (cosa cambia rispetto alla release attiva) e a
 * «Ripristina» (cosa tornerebbe com'era). La confronta il server, non l'interfaccia (regola 8).
 *
 * Il confronto è sul contenuto, non sull'ordine: due configurazioni uguali scritte con le chiavi
 * in ordine diverso non hanno differenze (lo stesso criterio dell'impronta, `canonicalJson`).
 */
export function diffConfigs(before: TroupeConfigData, after: TroupeConfigData): ConfigChange[] {
  return [
    ...diffEntries('connections', before.connections, after.connections),
    ...diffEntries('models', before.models, after.models),
    ...diffEntries('roles', before.roles, after.roles),
    ...diffPresets(before.presets, after.presets),
    ...diffValues('features', before.features, after.features),
    ...diffValues('limits', before.limits, after.limits),
  ];
}

type Entry = Record<string, unknown>;

function differs(a: unknown, b: unknown): boolean {
  return canonicalJson(a) !== canonicalJson(b);
}

/** Il nome che la voce stessa si dà (`label`), se ne ha uno: altrimenti la sua chiave. */
function labelOf(entry: unknown, key: string): string {
  const label = typeof entry === 'object' && entry !== null ? (entry as Entry).label : undefined;
  return typeof label === 'string' && label !== '' ? label : key;
}

function changedFields(a: unknown, b: unknown): string[] {
  const left = (a ?? {}) as Entry;
  const right = (b ?? {}) as Entry;
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].filter((field) =>
    differs(left[field], right[field]),
  );
}

/** Mappe nome → voce (connessioni, modelli, ruoli). */
function diffEntries(
  section: ConfigChange['section'],
  before: Partial<Record<string, unknown>>,
  after: Partial<Record<string, unknown>>,
): ConfigChange[] {
  return compareByKey(section, new Map(Object.entries(before)), new Map(Object.entries(after)));
}

/** Elenchi di preset: ogni voce si riconosce dal suo `id`, dentro la sua categoria. */
function diffPresets(
  before: TroupeConfigData['presets'],
  after: TroupeConfigData['presets'],
): ConfigChange[] {
  return (Object.keys(before) as (keyof typeof before)[]).flatMap((category) =>
    compareByKey('presets', byId(category, before[category]), byId(category, after[category])),
  );
}

function byId(category: string, list: readonly { id: string }[]): Map<string, unknown> {
  return new Map(list.map((item) => [`${category}:${item.id}`, item]));
}

/** Funzioni e limiti: ogni valore è una voce a sé, e cambia o no. */
function diffValues(
  section: 'features' | 'limits',
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): ConfigChange[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => differs(before[key], after[key]))
    .map((key) => ({ section, key, label: key, kind: 'changed' as const, fields: [] }));
}

function compareByKey(
  section: ConfigChange['section'],
  before: Map<string, unknown>,
  after: Map<string, unknown>,
): ConfigChange[] {
  const changes: ConfigChange[] = [];

  for (const [key, entry] of before) {
    if (!after.has(key)) {
      changes.push({ section, key, label: labelOf(entry, key), kind: 'removed', fields: [] });
    }
  }
  for (const [key, entry] of after) {
    if (!before.has(key)) {
      changes.push({ section, key, label: labelOf(entry, key), kind: 'added', fields: [] });
    } else if (differs(before.get(key), entry)) {
      changes.push({
        section,
        key,
        label: labelOf(entry, key),
        kind: 'changed',
        fields: changedFields(before.get(key), entry),
      });
    }
  }
  return changes;
}

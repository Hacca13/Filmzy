import type { ConfigChange } from '@filmzy/contracts';

import { fieldLabel } from '../../forms/labels';

/**
 * Una differenza fra due configurazioni, in parole per chi la legge (T2.6): «Modello · Kling
 * Standard · modificato: Prezzo». Le differenze le calcola il server; qui si dice solo come
 * mostrarle.
 */

const SECTION_LABELS = {
  connections: 'Connessione',
  models: 'Modello',
  roles: 'Ruolo',
  presets: 'Preset',
  features: 'Funzione',
  limits: 'Limite',
} as const;

/** Le categorie dei preset, come le chiama il server nelle chiavi (`styles:realistico`). */
const PRESET_CATEGORIES: Record<string, string> = {
  styles: 'Stili',
  genres: 'Generi',
  tones: 'Toni',
  cinematography: 'Fotografia',
  characterTags: 'Tag personaggi',
  cameraMovements: 'Movimenti macchina',
};

const KIND_LABELS = { added: 'nuovo', removed: 'tolto' } as const;

function titleOf(change: ConfigChange): string {
  const section = SECTION_LABELS[change.section];

  if (change.section === 'presets') {
    const category = change.key.split(':')[0] ?? '';
    return `${section} · ${PRESET_CATEGORIES[category] ?? category} · ${change.label}`;
  }
  // Funzioni e limiti non hanno un nome loro: si usa quello del campo.
  if (change.section === 'features' || change.section === 'limits') {
    return `${section} · ${fieldLabel(change.key)}`;
  }
  return `${section} · ${change.label}`;
}

function kindText(change: ConfigChange): string {
  if (change.kind !== 'changed') return KIND_LABELS[change.kind];
  return change.fields.length === 0
    ? 'modificato'
    : `modificato: ${change.fields.map(fieldLabel).join(', ')}`;
}

export function describeChange(change: ConfigChange): string {
  return `${titleOf(change)} · ${kindText(change)}`;
}

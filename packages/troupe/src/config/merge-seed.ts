import type { TroupeConfigData } from '@filmzy/contracts';

import { canonicalJson } from './hash.js';

type Entries = Readonly<Record<string, unknown>>;

const same = (a: unknown, b: unknown) => canonicalJson(a) === canonicalJson(b);

/**
 * Il seme di una versione nuova sopra la configurazione dell'utente (architettura §6.2, D95), voce per voce:
 * - una voce nuova si aggiunge, a meno che l'utente non l'avesse tolta;
 * - una voce che l'utente non ha cambiato prende il valore nuovo;
 * - una voce che l'utente ha cambiato resta sua;
 * - una voce che il seme non ha più resta: magari un ruolo la usa ancora.
 * `base` è il seme applicato l'ultima volta: dice cosa è dell'utente e cosa del programma.
 */
export function mergeSeed(
  base: TroupeConfigData | undefined,
  current: TroupeConfigData,
  seed: TroupeConfigData,
): TroupeConfigData {
  return {
    connections: mergeEntries(base?.connections, current.connections, seed.connections),
    models: mergeEntries(base?.models, current.models, seed.models),
    roles: mergeEntries(base?.roles, current.roles, seed.roles),
    features: mergeEntries(base?.features, current.features, seed.features),
    limits: mergeEntries(base?.limits, current.limits, seed.limits),
    presets: {
      styles: mergeById(base?.presets.styles, current.presets.styles, seed.presets.styles),
      cinematography: mergeById(
        base?.presets.cinematography,
        current.presets.cinematography,
        seed.presets.cinematography,
      ),
      cameraMovements: mergeById(
        base?.presets.cameraMovements,
        current.presets.cameraMovements,
        seed.presets.cameraMovements,
      ),
      characterTags: mergeById(
        base?.presets.characterTags,
        current.presets.characterTags,
        seed.presets.characterTags,
      ),
      genres: mergeById(base?.presets.genres, current.presets.genres, seed.presets.genres),
      tones: mergeById(base?.presets.tones, current.presets.tones, seed.presets.tones),
    },
  };
}

function mergeEntries<T extends Entries>(base: T | undefined, current: T, seed: T): T {
  const merged: Record<string, unknown> = { ...current };
  for (const [key, fresh] of Object.entries(seed)) {
    const wasInBase = base !== undefined && key in base;
    if (!(key in current)) {
      if (!wasInBase) merged[key] = fresh;
      continue;
    }
    if (wasInBase && same(current[key], base[key])) merged[key] = fresh;
  }
  return merged as T;
}

/** I preset sono elenchi: si confrontano per id, e l'ordine resta quello dell'utente, con i nuovi in fondo. */
function mergeById<T extends { id: string }>(
  base: readonly T[] | undefined,
  current: readonly T[],
  seed: readonly T[],
): T[] {
  const byId = (items: readonly T[]) => Object.fromEntries(items.map((item) => [item.id, item]));
  const merged = mergeEntries(base === undefined ? undefined : byId(base), byId(current), byId(seed));
  const order = [...current.map(({ id }) => id), ...seed.map(({ id }) => id)];
  return [...new Set(order)].flatMap((id) => (merged[id] === undefined ? [] : [merged[id]]));
}

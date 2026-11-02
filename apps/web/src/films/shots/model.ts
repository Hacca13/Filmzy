import type { ContinuityState, ScenePlan } from '@filmzy/contracts';

import { namesOf } from '../story/model';

/**
 * Le piccole decisioni della schermata «Le inquadrature» (T3.9), fuori dai componenti così si
 * provano a parte. Cosa c'è nel piano lo dice il server; qui si dice solo come mostrarlo.
 */

interface Named {
  id: string;
  name: string;
}

/** Chi e cosa c'è nel film, per scrivere nomi e non id. */
export interface Names {
  characters: readonly Named[];
  locations: readonly Named[];
}

/** I piani più comuni, con il nome che si usa sul set; per gli altri si adatta l'id. */
const FRAMING_LABELS: Record<string, string> = {
  extreme_wide: 'Campo lunghissimo',
  wide: 'Campo lungo',
  long: 'Campo lungo',
  full: 'Figura intera',
  medium: 'Piano medio',
  medium_close_up: 'Mezzo primo piano',
  close_up: 'Primo piano',
  extreme_close_up: 'Primissimo piano',
  over_the_shoulder: 'Sopra la spalla',
  two_shot: 'Due personaggi',
  insert: 'Dettaglio',
};

/** «close_up» → «Close up»: per gli id che non conosciamo, una forma leggibile. */
export function humanize(id: string): string {
  const words = id.replace(/[_-]+/g, ' ').trim();
  return words === '' ? id : words.charAt(0).toUpperCase() + words.slice(1);
}

export const framingLabel = (framing: string): string =>
  FRAMING_LABELS[framing] ?? humanize(framing);

/** Lo stato di una scena in due parole: da pensare, da rifare, o quante inquadrature ha. */
export function sceneStatus(scene: ScenePlan): string {
  if (!scene.planned) return 'Da pensare';
  if (scene.stale) return 'Da rifare: la scena è cambiata';
  return scene.shots.length === 1 ? '1 inquadratura' : `${String(scene.shots.length)} inquadrature`;
}

/** «La piazza · sera · con Anna, Marco»: dove, quando e chi, per l'entrata o l'uscita di un'inquadratura. */
export function continuityLine(state: ContinuityState, names: Names): string {
  const place = namesOf([state.locationId], names.locations);
  const people = namesOf(state.present, names.characters);
  return [
    place.length === 0 ? undefined : place.join(', '),
    state.timeOfDay,
    people.length === 0 ? undefined : `con ${people.join(', ')}`,
  ]
    .filter((part) => part !== undefined)
    .join(' · ');
}

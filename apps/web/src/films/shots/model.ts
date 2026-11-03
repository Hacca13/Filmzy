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

/** «close_up» → «Close up»: per gli id che non conosciamo, una forma leggibile. */
export function humanize(id: string): string {
  const words = id.replace(/[_-]+/g, ' ').trim();
  return words === '' ? id : words.charAt(0).toUpperCase() + words.slice(1);
}

/** Lo stato di una scena in due parole: da pensare, da rifare, o quante inquadrature ha. */
export function sceneStatus(scene: ScenePlan): string {
  if (!scene.planned) return 'Da pensare';
  if (scene.stale) return 'Da rifare: è cambiato qualcosa';
  return scene.shots.length === 1 ? '1 inquadratura' : `${String(scene.shots.length)} inquadrature`;
}

/** Il chip dello stato di una scena: confermato se ha le inquadrature, da controllare se è da pensare o da rifare. */
export function sceneChip(scene: ScenePlan): { label: string; tone: 'confirmed' | 'warning' } {
  return {
    label: sceneStatus(scene),
    tone: scene.planned && !scene.stale ? 'confirmed' : 'warning',
  };
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

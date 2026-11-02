import type { ShotStore, StoredShot } from '@filmzy/db';

import { domainError } from '../../http/domain-error.js';
import type { ScreenplayService } from '../screenplay/screenplay.service.js';
import { isStale, type KnownIds } from './plan-shots.js';

/**
 * Le due cose che ogni lavoro su un'inquadratura chiede prima di cominciare (storyboard, immagini,
 * take), scritte una volta sola: trovare l'inquadratura **di quel film**, e controllare che il suo
 * piano sia ancora buono.
 */

/** L'inquadratura di quel film, o «non trovato»: un id di un altro film non si distingue da uno inventato. */
export function shotOf(store: ShotStore, projectId: string, shotId: string): StoredShot {
  const stored = store.get(shotId);
  if (stored?.projectId !== projectId) {
    throw domainError(404, 'not_found', { details: { field: 'shotId' } });
  }
  return stored;
}

/** Un piano vecchio (scena cambiata, personaggio o luogo tolto) non si gira: si rifà prima. */
export function assertPlanCurrent(args: {
  store: ShotStore;
  screenplays: ScreenplayService;
  known: KnownIds;
  projectId: string;
  stored: StoredShot;
}): void {
  const { store, screenplays, known, projectId, stored } = args;
  const plan = store.plan(projectId, stored.sceneNumber);
  const scene = screenplays
    .latest(projectId, 'final')
    .screenplay.scenes.find((candidate) => candidate.number === stored.sceneNumber);
  if (plan === undefined || scene === undefined || isStale(scene, plan, known)) {
    throw domainError(409, 'invalid_request', { details: { field: 'plan' } });
  }
}

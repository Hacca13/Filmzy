import { and, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { filmSceneExclusions } from './schema.js';

/**
 * Quali scene l'utente ha tolto dal film (D85). Togliere una scena non tocca né i suoi video né i suoi suoni:
 * si salva solo la scelta, così rimetterla li riporta tutti.
 */
export interface SceneChoiceStore {
  excluded: (projectId: string) => Set<number>;
  setIncluded: (projectId: string, sceneNumber: number, included: boolean) => void;
}

export function createSceneChoiceStore(db: FilmzyDb): SceneChoiceStore {
  return {
    excluded(projectId) {
      const rows = db
        .select({ sceneNumber: filmSceneExclusions.sceneNumber })
        .from(filmSceneExclusions)
        .where(eq(filmSceneExclusions.projectId, projectId))
        .all();
      return new Set(rows.map(({ sceneNumber }) => sceneNumber));
    },

    setIncluded(projectId, sceneNumber, included) {
      if (included) {
        db.delete(filmSceneExclusions)
          .where(
            and(
              eq(filmSceneExclusions.projectId, projectId),
              eq(filmSceneExclusions.sceneNumber, sceneNumber),
            ),
          )
          .run();
        return;
      }
      db.insert(filmSceneExclusions).values({ projectId, sceneNumber }).onConflictDoNothing().run();
    },
  };
}

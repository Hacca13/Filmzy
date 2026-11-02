import type { ScreenplayScene } from '@filmzy/contracts';

import { namesOf, sceneMeta } from './model';

interface Named {
  id: string;
  name: string;
}

interface Props {
  scenes: readonly ScreenplayScene[];
  /** Chi può comparire: le proposte della bozza, o il cast del film nella stesura ufficiale. */
  people: readonly Named[];
  /** Dove si svolgono le scene; nella bozza i luoghi sono solo proposte e non si mostrano. */
  places?: readonly Named[];
}

/**
 * Le scene come si leggono (T3.4, T3.8): intestazione, durata e momento, riassunto, i passaggi
 * (`beats`, ci sono solo nella stesura ufficiale), chi ci sta e dove. Un id che non si riconosce
 * si salta.
 */
export function SceneList({ scenes, people, places }: Props) {
  return (
    <ol className="scenes">
      {scenes.map((scene) => {
        const who = namesOf(scene.characterIds, people);
        const where = namesOf(
          scene.locationId === undefined ? [] : [scene.locationId],
          places ?? [],
        );
        return (
          <li key={scene.number} className="scene">
            <strong>{scene.heading}</strong>
            <span className="hint">{sceneMeta(scene)}</span>
            <p>{scene.summary}</p>
            {scene.beats.length === 0 ? null : (
              <ul className="beats">
                {scene.beats.map((beat) => (
                  <li key={beat}>{beat}</li>
                ))}
              </ul>
            )}
            {who.length === 0 ? null : <p className="hint">Con {who.join(', ')}</p>}
            {where.length === 0 ? null : <p className="hint">Luogo: {where.join(', ')}</p>}
          </li>
        );
      })}
    </ol>
  );
}

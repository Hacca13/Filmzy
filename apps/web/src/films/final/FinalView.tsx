import type { Screenplay } from '@filmzy/contracts';

import { namesOf, sceneMeta, totalDuration } from '../story/model';

interface Named {
  id: string;
  name: string;
}

/**
 * La sceneggiatura finale come si legge (T3.8): titolo, trama, scene con chi ci sta e dove. I nomi
 * vengono dal cast e dai luoghi del film, perché nella stesura le scene citano solo quelli.
 */
export function FinalView({
  screenplay,
  characters,
  locations,
}: {
  screenplay: Screenplay;
  characters: readonly Named[];
  locations: readonly Named[];
}) {
  return (
    <article className="screenplay">
      <h3>{screenplay.title}</h3>
      <p>{screenplay.logline}</p>
      <p className="hint">
        {screenplay.scenes.length} scene · circa {totalDuration(screenplay)}
      </p>
      <ol className="scenes">
        {screenplay.scenes.map((scene) => {
          const people = namesOf(scene.characterIds, characters);
          const place = namesOf(
            scene.locationId === undefined ? [] : [scene.locationId],
            locations,
          );
          return (
            <li key={scene.number} className="scene">
              <strong>{scene.heading}</strong>
              <span className="hint">{sceneMeta(scene)}</span>
              <p>{scene.summary}</p>
              {people.length === 0 ? null : <p className="hint">Con {people.join(', ')}</p>}
              {place.length === 0 ? null : <p className="hint">Luogo: {place.join(', ')}</p>}
            </li>
          );
        })}
      </ol>
    </article>
  );
}

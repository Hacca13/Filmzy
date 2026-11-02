import type { Screenplay } from '@filmzy/contracts';

import { SceneList } from '../story/SceneList';
import { totalDuration } from '../story/model';

interface Named {
  id: string;
  name: string;
}

/**
 * La sceneggiatura finale come si legge (T3.8): titolo, trama, scene con i passaggi, chi ci sta e
 * dove, e le note dello sceneggiatore (per esempio perché ha adattato la storia alle scelte). I
 * nomi vengono dal cast e dai luoghi del film, perché nella stesura le scene citano solo quelli.
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
      <SceneList scenes={screenplay.scenes} people={characters} places={locations} />
      {screenplay.notes === undefined ? null : (
        <section>
          <h4>Note dello sceneggiatore</h4>
          <p>{screenplay.notes}</p>
        </section>
      )}
    </article>
  );
}

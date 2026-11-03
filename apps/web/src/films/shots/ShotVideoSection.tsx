import type { ShotTakes } from '@filmzy/contracts';
import { useCallback } from 'react';

import { assetUrl } from '../../api/sheet';
import { fetchTakeOptions, fetchTakes, startTake } from '../../api/takes';
import { Notice } from '../../components/ui';
import { GenerateBar, useGeneration } from '../generation';
import { useOnIncrease } from '../use-on-increase';
import { useWatched } from '../use-watched';
import { takeCaption, takeText, takesAreWorking } from './takes-model';

/**
 * Il video di un'inquadratura (T4.3, §7): «Genera» gira una clip con le immagini impostate
 * (T4.2), con «Cambia servizio» accanto e la stima in vista (D36, D30). Ogni take dice con quale
 * servizio è stato fatto e quanto è costato davvero, così rigenerare con un altro servizio dà un
 * secondo take che si riconosce. Se un servizio rifiuta o fallisce lo dice, e decide l'utente: non si
 * prova un altro servizio da soli. `onSettled` fa rileggere il piano perché la card mostri la clip.
 */
export function ShotVideoSection({
  filmId,
  shotId,
  onSettled,
}: {
  filmId: string;
  shotId: string;
  onSettled: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => fetchTakes(filmId, shotId, signal),
    [filmId, shotId],
  );
  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchTakeOptions(filmId, shotId, signal),
    [filmId, shotId],
  );
  const watched = useWatched<ShotTakes>(load, takesAreWorking, {
    kinds: ['take_generate'],
    subjectId: shotId,
  });
  const { value: takes, setValue: setTakes, problem: loadProblem, working } = watched;
  // Un take che finisce porta una clip nuova: la card la mostra, quindi il piano si rilegge.
  useOnIncrease(takes?.takes.filter((take) => take.status === 'succeeded').length, onSettled);
  const generation = useGeneration<ShotTakes>({
    loadOptions,
    start: (body) => startTake(filmId, shotId, body),
    onStarted: setTakes,
  });

  return (
    <section className="sheet" aria-label="Video">
      <h5>Video</h5>
      <p className="hint">
        Gira l&apos;inquadratura con le immagini che hai impostato. Ogni volta che lo rifai nasce un
        nuovo take: i precedenti restano, e ognuno dice con quale servizio è stato fatto.
      </p>

      <GenerateBar generation={generation} createVerb="Genera il video" disabled={working}>
        {loadProblem === undefined ? null : <Notice tone="error">{loadProblem}</Notice>}
      </GenerateBar>

      {takes === undefined ? null : (
        <ul className="attempts">
          {takes.takes.map((take, index) => (
            <li key={take.id} className="attempt">
              <strong>{`Take ${String(takes.takes.length - index)}`}</strong>
              {take.assetId === undefined ? (
                <div className="sheet-placeholder wide">{takeText(take)}</div>
              ) : (
                <video
                  className="take-video"
                  controls
                  preload="metadata"
                  src={assetUrl(take.assetId)}
                />
              )}
              <p className="hint">{takeCaption(take)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

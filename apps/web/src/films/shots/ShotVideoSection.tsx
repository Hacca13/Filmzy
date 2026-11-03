import type { ShotTakes } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { chooseTake, fetchTakeOptions, fetchTakes, startTake, useTakeFrame } from '../../api/takes';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { FailureActions } from '../FailureActions';
import { GenerateBar, useGeneration } from '../generation';
import { useOnIncrease } from '../use-on-increase';
import { useWatched } from '../use-watched';
import { TakeItem } from './TakeItem';
import { formatMoment, keptTake, takesAreWorking } from './takes-model';

/**
 * Il video di un'inquadratura (T4.3, T4.6, §7): «Genera» gira una clip con le immagini impostate
 * (T4.2), con «Cambia servizio» accanto e la stima in vista (D36, D30). Ogni take dice con quale
 * servizio è stato fatto e quanto è costato davvero, così rigenerare con un altro servizio dà un
 * secondo take che si riconosce, e **solo quello**: le altre inquadrature non si toccano. Fra i take
 * l'utente tiene quello che preferisce, oppure ripete l'inquadratura da un fotogramma di un take.
 * Se un servizio rifiuta o fallisce lo dice, e decide l'utente: non si prova un altro servizio da
 * soli. `onSettled` fa rileggere il piano perché la card mostri la clip; `onImagesChanged` fa
 * rileggere le immagini impostate quando un fotogramma ne prende il posto.
 */
export function ShotVideoSection({
  filmId,
  shotId,
  onSettled,
  onImagesChanged = () => undefined,
}: {
  filmId: string;
  shotId: string;
  onSettled: () => void;
  onImagesChanged?: () => void;
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

  // Tenere un take e prendere un fotogramma sono azioni dell'utente su un take già fatto: una alla volta.
  const action = useAction();
  const [frameUsed, setFrameUsed] = useState<number>();
  const keep = (takeId: string) => {
    setFrameUsed(undefined);
    action.run(async () => {
      setTakes(await chooseTake(filmId, shotId, takeId));
      onSettled();
    });
  };
  const useFrame = (takeId: string, atS: number) => {
    setFrameUsed(undefined);
    action.run(async () => {
      await useTakeFrame(filmId, shotId, takeId, atS);
      setFrameUsed(atS);
      onImagesChanged();
      onSettled();
    });
  };

  const kept = takes === undefined ? undefined : keptTake(takes);

  return (
    <section className="sheet" aria-label="Video">
      <h5>Video</h5>
      <p className="hint">
        Gira l&apos;inquadratura con le immagini che hai impostato. Ogni volta che lo rifai nasce un
        nuovo take: i precedenti restano, e ognuno dice con quale servizio è stato fatto. Tieni
        quello che ti piace di più, oppure rifai il video partendo da un suo fotogramma. Le altre
        inquadrature non cambiano.
      </p>

      <GenerateBar generation={generation} createVerb="Genera il video" disabled={working}>
        {loadProblem === undefined ? null : <Notice tone="error">{loadProblem}</Notice>}
      </GenerateBar>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      {frameUsed === undefined ? null : (
        <Notice tone="info" title="Fatto">
          Il fotogramma a {formatMoment(frameUsed)} è il primo fotogramma dell&apos;inquadratura.
          Genera il video per ripartire da lì.
        </Notice>
      )}

      {takes === undefined ? null : (
        <ul className="attempts">
          {takes.takes.map((take, index) => (
            <TakeItem
              key={take.id}
              take={take}
              title={`Take ${String(takes.takes.length - index)}`}
              kept={take.id === kept?.id}
              busy={action.busy || generation.busy}
              onKeep={() => {
                keep(take.id);
              }}
              onUseFrame={(atS) => {
                useFrame(take.id, atS);
              }}
            >
              {/* I take arrivano dal più recente: solo il primo offre cosa fare dopo un fallimento. */}
              {take.status === 'failed' && index === 0 ? (
                <FailureActions
                  code={take.errorCode}
                  generation={generation}
                  busy={generation.busy || working}
                />
              ) : null}
            </TakeItem>
          ))}
        </ul>
      )}
    </section>
  );
}

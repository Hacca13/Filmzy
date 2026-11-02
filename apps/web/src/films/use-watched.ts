import { useEffect, useState } from 'react';

import { subscribeEvents } from '../api/events';
import { describeError } from '../settings/messages';
import { matchesFilter, type LiveFilter } from './use-live-jobs';

/** Ogni quanto si guarda a che punto è un lavoro in coda finché lavora, se non ci sono gli eventi (ms). */
const WATCH_INTERVAL_MS = 1500;

/** Con gli eventi il server avvisa da solo: il controllo periodico resta solo come rete di sicurezza (ms). */
const SAFETY_INTERVAL_MS = 15_000;

/**
 * Legge un dato all'apertura e, finché qualcosa lavora, lo tiene aggiornato: l'utente vede le immagini
 * e i video comparire senza dover fare niente. Smette appena tutto è finito. `load` e `isWorking`
 * devono essere stabili (fuori dal componente, o con `useCallback`). Un errore di lettura non ferma
 * l'osservazione: finisce in `problem` e si riprova.
 *
 * Con `live` (T4.4) si rilegge **quando il server dice** che un lavoro di quel tipo ha cambiato stato
 * (SSE); il controllo periodico diventa lento e serve solo se un evento si perde. Senza `live` si
 * rilegge ogni poco, come prima.
 */
export function useWatched<T>(
  load: (signal: AbortSignal) => Promise<T>,
  isWorking: (value: T) => boolean,
  live?: LiveFilter,
) {
  const [value, setValue] = useState<T>();
  const [problem, setProblem] = useState<string>();
  const working = value === undefined || isWorking(value);
  const kinds = live?.kinds.join(',');
  const subjectId = live?.subjectId;
  const projectId = live?.projectId;

  useEffect(() => {
    if (!working) return undefined;
    const controller = new AbortController();
    const look = () => {
      load(controller.signal).then(
        (next) => {
          if (!controller.signal.aborted) {
            setValue(next);
            setProblem(undefined);
          }
        },
        (error: unknown) => {
          if (!controller.signal.aborted) setProblem(describeError(error));
        },
      );
    };
    look();

    const timer = setInterval(look, kinds === undefined ? WATCH_INTERVAL_MS : SAFETY_INTERVAL_MS);
    const stopListening =
      kinds === undefined
        ? undefined
        : subscribeEvents((event) => {
            const wanted: LiveFilter = {
              kinds: kinds === '' ? [] : kinds.split(','),
              ...(projectId === undefined ? {} : { projectId }),
              ...(subjectId === undefined ? {} : { subjectId }),
            };
            if (matchesFilter(event, wanted)) look();
          });

    return () => {
      controller.abort();
      clearInterval(timer);
      stopListening?.();
    };
  }, [load, working, kinds, projectId, subjectId]);

  return { value, setValue, problem, working };
}

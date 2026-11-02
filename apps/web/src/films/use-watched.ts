import { useEffect, useState } from 'react';

import { describeError } from '../settings/messages';

/** Ogni quanto si guarda a che punto è un lavoro in coda finché lavora (ms). */
const WATCH_INTERVAL_MS = 1500;

/**
 * Legge un dato all'apertura e, finché qualcosa lavora, lo rilegge ogni poco: l'utente vede le
 * immagini comparire senza dover fare niente (schede, luoghi, più avanti i take). Smette appena
 * tutto è finito. `load` e `isWorking` devono essere stabili (fuori dal componente, o con
 * `useCallback`). Un errore di lettura non ferma l'osservazione: finisce in `problem` e si riprova.
 */
export function useWatched<T>(
  load: (signal: AbortSignal) => Promise<T>,
  isWorking: (value: T) => boolean,
) {
  const [value, setValue] = useState<T>();
  const [problem, setProblem] = useState<string>();
  const working = value === undefined || isWorking(value);

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
    const timer = setInterval(look, WATCH_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [load, working]);

  return { value, setValue, problem, working };
}

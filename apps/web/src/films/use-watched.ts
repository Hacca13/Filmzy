import { useCallback, useEffect, useRef, useState } from 'react';

import { describeError } from '../settings/messages';
import { useLiveJobs, type LiveFilter } from './use-live-jobs';

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
 * (SSE); il controllo periodico diventa lento e serve solo se un evento si perde. L'ascolto dura finché
 * il componente c'è, non solo mentre lavora: così la connessione non si apre e si chiude a ogni
 * tentativo. Senza `live` si rilegge ogni poco, come prima.
 */
export function useWatched<T>(
  load: (signal: AbortSignal) => Promise<T>,
  isWorking: (value: T) => boolean,
  live?: LiveFilter,
) {
  const [value, setValue] = useState<T>();
  const [problem, setProblem] = useState<string>();
  const working = value === undefined || isWorking(value);

  // Un solo posto che legge: lo usano il controllo periodico e gli eventi. Si ferma se il componente se ne va.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  // Vale solo l'ultima lettura partita: una più vecchia che arriva dopo riporterebbe indietro la pagina.
  const lastRead = useRef(0);
  const read = useCallback(
    (signal: AbortSignal): Promise<void> => {
      lastRead.current += 1;
      const thisRead = lastRead.current;
      const current = () => alive.current && !signal.aborted && thisRead === lastRead.current;
      return load(signal).then(
        (next) => {
          if (current()) {
            setValue(next);
            setProblem(undefined);
          }
        },
        (error: unknown) => {
          if (current()) setProblem(describeError(error));
        },
      );
    },
    [load],
  );

  const everyMs = live === undefined ? WATCH_INTERVAL_MS : SAFETY_INTERVAL_MS;
  useEffect(() => {
    if (!working) return undefined;
    const controller = new AbortController();
    void read(controller.signal);
    const timer = setInterval(() => {
      void read(controller.signal);
    }, everyMs);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [read, working, everyMs]);

  // Un evento rilegge subito, anche se in quel momento niente sembrava lavorare (l'ha chiesto un'altra finestra).
  useLiveJobs(live, () => {
    void read(new AbortController().signal);
  });

  /** Rilegge adesso e finisce quando ha letto; un errore di lettura finisce in `problem`. */
  const reload = useCallback(() => read(new AbortController().signal), [read]);

  return { value, setValue, problem, working, reload };
}

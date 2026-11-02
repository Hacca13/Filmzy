import { useCallback, useEffect, useState } from 'react';

export type Resource<T> =
  { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'ready'; data: T };

/**
 * Carica un dato dal server quando la schermata si apre, con i tre stati che l'interfaccia deve
 * sempre saper mostrare: caricamento, errore, pronto (mai una schermata vuota). `load` deve essere
 * una funzione stabile (fuori dal componente): cambiare identità a ogni disegno rilancerebbe la
 * chiamata all'infinito.
 */
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<Resource<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'ready', data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error });
      },
    );
    return () => {
      controller.abort();
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);
  const setData = useCallback((data: T) => {
    setState({ status: 'ready', data });
  }, []);

  return { state, reload, setData };
}

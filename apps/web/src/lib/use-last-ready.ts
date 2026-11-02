import { useEffect, useState } from 'react';

import type { Resource } from './use-resource';

/**
 * L'ultimo dato arrivato di una risorsa, anche mentre la si ricarica. `useResource` torna a
 * «caricamento» a ogni `reload`: una schermata con testo appena digitato o risposte già date, se
 * si smontasse per far posto a «Un attimo…», le perderebbe. Con questo resta com'è finché il dato
 * nuovo non arriva. Va usato con una `key` che cambia quando cambia il film, per non mostrare il
 * dato di un altro.
 */
export function useLastReady<T>(state: Resource<T>): T | undefined {
  const [last, setLast] = useState<T>();

  useEffect(() => {
    if (state.status === 'ready') setLast(state.data);
  }, [state]);

  return state.status === 'ready' ? state.data : last;
}

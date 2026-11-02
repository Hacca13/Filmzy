import { useEffect, useRef } from 'react';

/**
 * Chiama `onIncrease` quando `count` sale (un tentativo o un take riuscito in più), ma non alla
 * prima lettura: quelli che c'erano già non sono una novità. Serve a dire a chi mostra il risultato
 * altrove (la card, «Imposta le immagini») di rileggerlo, senza rileggere a ogni controllo.
 */
export function useOnIncrease(count: number | undefined, onIncrease?: () => void): void {
  const seen = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (count === undefined) return;
    if (seen.current !== undefined && count > seen.current) onIncrease?.();
    seen.current = count;
  }, [count, onIncrease]);
}

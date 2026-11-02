import { useSyncExternalStore } from 'react';

/**
 * Il «percorso» della pagina, scritto dopo il `#` (`#/impostazioni/avanzate`). Basta per le poche
 * schermate di adesso: un router vero si sceglie quando arrivano quelle del film (M3).
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
  };
}

function currentPath(): string {
  return window.location.hash.slice(1) || '/';
}

export function useHashPath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

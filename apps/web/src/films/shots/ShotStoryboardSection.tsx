import { useCallback } from 'react';

import {
  chooseStoryboard,
  fetchStoryboard,
  fetchStoryboardOptions,
  startStoryboard,
} from '../../api/storyboard';
import { ImageAttemptsSection } from '../ImageAttemptsSection';

/**
 * Lo storyboard di un'inquadratura (T4.1): due o tre varianti dell'immagine, fatte con il volto
 * dei personaggi e il set come riferimenti. L'utente ne **sceglie** una, che diventa il riferimento
 * visivo della card; `onChosen` fa rileggere il piano perché la card la mostri.
 */
export function ShotStoryboardSection({
  filmId,
  shotId,
  onChosen,
}: {
  filmId: string;
  shotId: string;
  onChosen: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => fetchStoryboard(filmId, shotId, signal),
    [filmId, shotId],
  );
  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchStoryboardOptions(filmId, shotId, signal),
    [filmId, shotId],
  );

  return (
    <ImageAttemptsSection
      title="Storyboard"
      hint="Varianti dell'immagine di questa inquadratura, con il volto dei personaggi e il set. Scegline una: sarà il riferimento visivo dell'inquadratura."
      createVerb="Crea lo storyboard"
      workingText="Sto disegnando l'inquadratura…"
      imageLabel="Inquadratura"
      wide
      load={load}
      loadOptions={loadOptions}
      start={(body) => startStoryboard(filmId, shotId, body)}
      choose={(assetId) => chooseStoryboard(filmId, shotId, assetId)}
      onChosen={onChosen}
    />
  );
}

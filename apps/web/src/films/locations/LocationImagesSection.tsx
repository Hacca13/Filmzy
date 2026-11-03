import { useCallback } from 'react';

import {
  chooseLocationImage,
  fetchLocationImages,
  fetchLocationOptions,
  startLocationImages,
} from '../../api/locations';
import { ImageAttemptsSection } from '../ImageAttemptsSection';

/**
 * Le immagini del set di un luogo (T3.7, D19): senza persone, più per tentativo. L'utente
 * **sceglie** l'immagine che resta come riferimento del luogo nella Bibbia.
 */
export function LocationImagesSection({
  filmId,
  locationId,
}: {
  filmId: string;
  locationId: string;
}) {
  const load = useCallback(
    (signal: AbortSignal) => fetchLocationImages(filmId, locationId, signal),
    [filmId, locationId],
  );
  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchLocationOptions(filmId, locationId, signal),
    [filmId, locationId],
  );

  return (
    <ImageAttemptsSection
      title="Immagini del luogo"
      hint="Immagini del set, senza persone. Scegline una: sarà il riferimento di questo luogo in tutto il film."
      createVerb="Crea le immagini"
      workingText="Sto disegnando il set…"
      imageLabel="Set"
      load={load}
      live={{ kinds: ['location_images'], subjectId: locationId }}
      loadOptions={loadOptions}
      start={(body) => startLocationImages(filmId, locationId, body)}
      choose={(assetId) => chooseLocationImage(filmId, locationId, assetId)}
    />
  );
}

import { useCallback, useState } from 'react';

import {
  chooseLocationImage,
  fetchLocationImages,
  fetchLocationOptions,
  startLocationImages,
} from '../../api/locations';
import { ImageAttemptsSection } from '../ImageAttemptsSection';
import { UploadControl } from '../uploads/UploadControl';
import { RetouchEditor } from './RetouchEditor';

/**
 * Le immagini del set di un luogo (T3.7, D19): senza persone, più per tentativo. L'utente
 * **sceglie** l'immagine che resta come riferimento del luogo nella Bibbia. Può anche caricare una
 * foto sua del luogo (T4.8, D19): passa dal controllo e si sceglie come le altre. Ogni immagine si
 * può ritoccare col pennello (T4.9, D21).
 */
export function LocationImagesSection({
  filmId,
  locationId,
}: {
  filmId: string;
  locationId: string;
}) {
  // L'immagine che si sta ritoccando (T4.9): apre il pennello sotto il pulsante «Crea».
  const [retouching, setRetouching] = useState<string>();
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
      live={{ kinds: ['location_images', 'location_retouch'], subjectId: locationId }}
      onRetouch={setRetouching}
      loadOptions={loadOptions}
      start={(body) => startLocationImages(filmId, locationId, body)}
      choose={(assetId) => chooseLocationImage(filmId, locationId, assetId)}
      extra={(refresh) => (
        <>
          <UploadControl
            filmId={filmId}
            target={{ kind: 'location', locationId }}
            label="Carica una foto del luogo"
            onUploaded={refresh}
          />
          {retouching === undefined ? null : (
            <RetouchEditor
              key={retouching}
              filmId={filmId}
              locationId={locationId}
              assetId={retouching}
              onStarted={() => {
                void refresh();
              }}
              onClose={() => {
                setRetouching(undefined);
              }}
            />
          )}
        </>
      )}
    />
  );
}

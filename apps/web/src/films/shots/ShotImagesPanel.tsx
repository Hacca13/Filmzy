import type { ShotSpec } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { ShotImagesSection } from './ShotImagesSection';
import { ShotStoryboardSection } from './ShotStoryboardSection';
import { ShotVideoSection } from './ShotVideoSection';
import { hasFirstFrame } from './images-model';

/**
 * Il lavoro su un'inquadratura, aperto sotto la striscia (T4.1, T4.2, T4.3): prima lo storyboard,
 * poi «Imposta le immagini» (primo e ultimo fotogramma, ispirazione), se c'è il primo fotogramma
 * l'ultimo fotogramma da generare, e in fondo il video. `onChanged` fa rileggere il piano perché la card
 * mostri ciò che è cambiato.
 */
export function ShotImagesPanel({
  filmId,
  shot,
  onChanged,
  onClose,
}: {
  filmId: string;
  shot: ShotSpec;
  onChanged: () => void;
  onClose: () => void;
}) {
  // «Imposta le immagini» offre le varianti già fatte: si rilegge quando ne nascono o si sceglie.
  const [refresh, setRefresh] = useState(0);
  const refreshImages = useCallback(() => {
    setRefresh((value) => value + 1);
  }, []);
  const endFrameChosen = useCallback(() => {
    refreshImages();
    onChanged();
  }, [refreshImages, onChanged]);

  return (
    <div className="storyboard-panel">
      <div className="panel-head">
        <h4>Inquadratura {shot.order + 1} · storyboard, immagini e video</h4>
        <button type="button" className="icon-button" aria-label="Chiudi" onClick={onClose}>
          ×
        </button>
      </div>
      <ShotStoryboardSection
        filmId={filmId}
        shotId={shot.id}
        mode="storyboard"
        onChosen={onChanged}
        onSettled={refreshImages}
      />
      <ShotImagesSection
        filmId={filmId}
        shotId={shot.id}
        refreshKey={refresh}
        onChanged={onChanged}
      />
      {hasFirstFrame(shot.images) ? (
        <ShotStoryboardSection
          filmId={filmId}
          shotId={shot.id}
          mode="end_frame"
          onChosen={endFrameChosen}
          onSettled={refreshImages}
        />
      ) : null}
      <ShotVideoSection
        filmId={filmId}
        shotId={shot.id}
        onSettled={onChanged}
        onImagesChanged={refreshImages}
      />
    </div>
  );
}

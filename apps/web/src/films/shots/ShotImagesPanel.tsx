import type { ShotSpec } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { ShotImagesSection } from './ShotImagesSection';
import { ShotStoryboardSection } from './ShotStoryboardSection';
import { hasFirstFrame } from './images-model';

/**
 * Il lavoro sulle immagini di un'inquadratura, aperto sotto la striscia (T4.1, T4.2): prima lo
 * storyboard, poi «Imposta le immagini» (primo e ultimo fotogramma, ispirazione) e, se c'è il primo
 * fotogramma, l'ultimo fotogramma da generare. `onChanged` fa rileggere il piano perché la card
 * mostri ciò che è cambiato.
 */
export function ShotImagesPanel({
  filmId,
  shot,
  onChanged,
}: {
  filmId: string;
  shot: ShotSpec;
  onChanged: () => void;
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
      <h4>Inquadratura {shot.order + 1} · storyboard e immagini</h4>
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
    </div>
  );
}

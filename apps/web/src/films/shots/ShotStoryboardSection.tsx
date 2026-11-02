import type { StoryboardMode } from '@filmzy/contracts';
import { useCallback } from 'react';

import {
  chooseStoryboard,
  fetchStoryboard,
  fetchStoryboardOptions,
  startStoryboard,
} from '../../api/storyboard';
import { ImageAttemptsSection } from '../ImageAttemptsSection';

/** Le parole di ciascun modo: sono lo stesso lavoro, ma per l'utente sono due cose diverse. */
const WORDS: Record<
  StoryboardMode,
  {
    title: string;
    hint: string;
    createVerb: string;
    workingText: string;
    imageLabel: string;
    chosenText: string;
  }
> = {
  storyboard: {
    title: 'Storyboard',
    hint: "Varianti dell'immagine di questa inquadratura, con il volto dei personaggi e il set. Scegline una: sarà il riferimento visivo dell'inquadratura.",
    createVerb: 'Crea lo storyboard',
    workingText: "Sto disegnando l'inquadratura…",
    imageLabel: 'Inquadratura',
    chosenText: 'Scelta come riferimento',
  },
  end_frame: {
    title: 'Ultimo fotogramma',
    hint: "L'immagine in cui finisce l'inquadratura, fatta modificando il primo fotogramma secondo il movimento di macchina. Scegline una: sarà l'ultimo fotogramma.",
    createVerb: "Crea l'ultimo fotogramma",
    workingText: "Sto disegnando l'ultimo fotogramma…",
    imageLabel: 'Ultimo fotogramma',
    chosenText: 'Scelta come ultimo fotogramma',
  },
};

/**
 * Le immagini fatte per un'inquadratura (T4.1, T4.2): le varianti dello storyboard, dove l'utente
 * ne **sceglie** una (il riferimento visivo della card), oppure le varianti dell'ultimo fotogramma,
 * dove la scelta diventa l'ultimo fotogramma impostato. `onChosen` fa rileggere il piano perché la
 * card la mostri; `onSettled` dice a «Imposta le immagini» che ci sono immagini nuove.
 */
export function ShotStoryboardSection({
  filmId,
  shotId,
  mode,
  onChosen,
  onSettled,
}: {
  filmId: string;
  shotId: string;
  mode: StoryboardMode;
  onChosen: () => void;
  onSettled: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => fetchStoryboard(filmId, shotId, mode, signal),
    [filmId, shotId, mode],
  );
  const loadOptions = useCallback(
    (signal: AbortSignal) => fetchStoryboardOptions(filmId, shotId, mode, signal),
    [filmId, shotId, mode],
  );
  const words = WORDS[mode];

  return (
    <ImageAttemptsSection
      title={words.title}
      hint={words.hint}
      createVerb={words.createVerb}
      workingText={words.workingText}
      imageLabel={words.imageLabel}
      chosenText={words.chosenText}
      wide
      load={load}
      loadOptions={loadOptions}
      start={(body) => startStoryboard(filmId, shotId, mode, body)}
      choose={(assetId) => chooseStoryboard(filmId, shotId, mode, assetId)}
      onChosen={onChosen}
      onSettled={onSettled}
    />
  );
}

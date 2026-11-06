import { FILM_COPY_EXTENSION } from '@filmzy/contracts';
import { useRef, useState } from 'react';

import { ApiError } from '../api/client';
import { importFilmCopy } from '../api/film-copy';
import { Notice } from '../components/ui';
import { useAction } from '../settings/use-action';
import { filmHref } from './routes';

/** Il server dice che il film c'è già: si chiede prima di sostituirlo. */
const isFilmExists = (error: unknown) =>
  error instanceof ApiError &&
  error.serverCode === 'invalid_request' &&
  error.details?.field === 'filmExists';

/**
 * «Apri un film salvato» (T6.3, D92): una copia `.filmzy`, anche fatta su un altro computer. Se il film c'è
 * già si chiede: sostituirlo fa perdere quello che è stato fatto qui dopo.
 */
export function OpenSavedFilm() {
  const input = useRef<HTMLInputElement>(null);
  const [waiting, setWaiting] = useState<File>();
  const action = useAction();

  const open = (file: File, replace: boolean) => {
    action.run(async () => {
      try {
        const film = await importFilmCopy(file, replace);
        setWaiting(undefined);
        window.location.hash = filmHref(film.id);
      } catch (error) {
        if (isFilmExists(error)) {
          setWaiting(file);
          return;
        }
        throw error;
      }
    });
  };

  return (
    <OpenSavedFilmBody
      busy={action.busy}
      problem={action.problem}
      asking={waiting !== undefined}
      onPick={() => input.current?.click()}
      onReplace={() => {
        if (waiting !== undefined) open(waiting, true);
      }}
      onCancel={() => {
        setWaiting(undefined);
      }}
    >
      <input
        ref={input}
        type="file"
        accept={FILM_COPY_EXTENSION}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Svuotato, così si può scegliere di nuovo lo stesso file.
          event.target.value = '';
          if (file !== undefined) open(file, false);
        }}
      />
    </OpenSavedFilmBody>
  );
}

/** Quello che si vede: senza stato, così si prova da solo. */
export function OpenSavedFilmBody({
  busy,
  problem,
  asking,
  onPick,
  onReplace,
  onCancel,
  children,
}: {
  busy: boolean;
  problem: string | undefined;
  asking: boolean;
  onPick: () => void;
  onReplace: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="open-saved">
      {children}
      <button type="button" className="button" disabled={busy} onClick={onPick}>
        {busy ? 'Sto aprendo il film…' : 'Apri un film salvato'}
      </button>
      {asking ? (
        <Notice tone="info" title="Questo film c’è già">
          Vuoi sostituirlo con la copia? Quello che hai fatto qui dopo averla salvata andrà perso.
          <div className="actions">
            <button
              type="button"
              className="button"
              data-kind="danger"
              disabled={busy}
              onClick={onReplace}
            >
              Sì, sostituisci
            </button>
            <button type="button" className="button" disabled={busy} onClick={onCancel}>
              Annulla
            </button>
          </div>
        </Notice>
      ) : null}
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </div>
  );
}

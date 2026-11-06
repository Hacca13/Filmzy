import { FILM_COPY_EXTENSION } from '@filmzy/contracts';
import { useRef } from 'react';

import { checkFilmCopy, filmCopyUrl, importFilmCopy } from '../api/film-copy';
import { Notice } from '../components/ui';
import { useAction } from '../settings/use-action';
import { filmHref } from './routes';

/**
 * «Apri un film salvato» (T6.3, D92): una copia `.filmzy`, anche fatta su un altro computer. Un film che c'è
 * già non si tocca: il server lo dice, e il messaggio rimanda all'elenco dei film.
 */
export function OpenSavedFilm() {
  const input = useRef<HTMLInputElement>(null);
  const action = useAction();

  const open = (file: File) => {
    action.run(async () => {
      const film = await importFilmCopy(file);
      window.location.hash = filmHref(film.id);
    });
  };

  return (
    <OpenSavedFilmBody
      busy={action.busy}
      problem={action.problem}
      onPick={() => input.current?.click()}
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
          if (file !== undefined) open(file);
        }}
      />
    </OpenSavedFilmBody>
  );
}

/** Quello che si vede: senza stato, così si prova da solo. */
export function OpenSavedFilmBody({
  busy,
  problem,
  onPick,
  children,
}: {
  busy: boolean;
  problem: string | undefined;
  onPick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="open-saved">
      {children}
      <button type="button" className="button" disabled={busy} onClick={onPick}>
        {busy ? 'Sto aprendo il film…' : 'Apri un film salvato'}
      </button>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </div>
  );
}

/**
 * «Salva una copia del film»: per conservarlo o portarlo su un altro computer; le chiavi non ci sono. Prima si
 * chiede al server se si può, perché un download che finisce in un errore non si riesce a spiegare.
 */
export function SaveFilmCopy({ filmId }: { filmId: string }) {
  const action = useAction();
  return (
    <>
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={action.busy}
          onClick={() => {
            action.run(async () => {
              await checkFilmCopy(filmId);
              startDownload(filmCopyUrl(filmId));
            });
          }}
        >
          Salva una copia del film
        </button>
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </>
  );
}

/** Il nome del file lo dà il server; il browser, o il programma installato, chiede dove metterlo. */
function startDownload(url: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  link.click();
}

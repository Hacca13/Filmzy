import type { FilmAssembly } from '@filmzy/contracts';
import { useState } from 'react';

import { earlierFilmUrl, removeEarlierFilm } from '../../api/assembly';
import { assetUrl } from '../../api/sheet';
import { Notice } from '../../components/ui';
import { useAction } from '../../settings/use-action';
import { earlierFilmLabel, removeFilmFailureText } from './assembly-model';

/**
 * I film montati prima dell'ultimo (D87): restano finché li toglie l'utente. Si possono guardare, salvare da
 * un'altra parte o togliere; togliere chiede conferma, perché non si torna indietro.
 */
export function EarlierFilms({
  filmId,
  films,
  onRemoved,
}: {
  filmId: string;
  films: readonly FilmAssembly[];
  onRemoved: () => Promise<void>;
}) {
  const [watching, setWatching] = useState<string>();
  const [confirming, setConfirming] = useState<string>();
  const removing = useAction();

  return (
    <section className="sheet sound-film" aria-label="Film montati prima">
      <EarlierFilmsList
        filmId={filmId}
        films={films}
        watching={watching}
        confirming={confirming}
        busy={removing.busy}
        onWatch={setWatching}
        onConfirm={setConfirming}
        onRemove={(assemblyId) => {
          removing.run(async () => {
            // Il lettore aperto terrebbe il file: su Windows non si potrebbe togliere.
            setWatching(undefined);
            await removeEarlierFilm(filmId, assemblyId);
            setConfirming(undefined);
            await onRemoved();
          }, removeFilmFailureText);
        }}
      />
      {removing.problem === undefined ? null : <Notice tone="error">{removing.problem}</Notice>}
    </section>
  );
}

/** Quello che si vede dell'elenco: senza stato, così si prova da solo. */
export function EarlierFilmsList({
  filmId,
  films,
  watching,
  confirming,
  busy,
  onWatch,
  onConfirm,
  onRemove,
}: {
  filmId: string;
  films: readonly FilmAssembly[];
  watching: string | undefined;
  confirming: string | undefined;
  busy: boolean;
  onWatch: (assemblyId: string | undefined) => void;
  onConfirm: (assemblyId: string | undefined) => void;
  onRemove: (assemblyId: string) => void;
}) {
  return (
    <>
      <h3>Film montati prima</h3>
      <p className="hint">Restano sul tuo computer finché non li togli tu.</p>
      <ul className="earlier-films">
        {films.map((film) => (
          <li key={film.id}>
            <p>{earlierFilmLabel(film)}</p>
            {watching === film.id && film.assetId !== undefined ? (
              <video
                className="take-video"
                controls
                preload="metadata"
                src={assetUrl(film.assetId)}
              />
            ) : null}
            {confirming === film.id ? (
              <div className="actions">
                <span className="hint">Vuoi toglierlo dal computer? Non si torna indietro.</span>
                <button
                  type="button"
                  className="button"
                  data-kind="danger"
                  disabled={busy}
                  onClick={() => {
                    onRemove(film.id);
                  }}
                >
                  Sì, togli
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    onConfirm(undefined);
                  }}
                >
                  Annulla
                </button>
              </div>
            ) : (
              <div className="actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    onWatch(watching === film.id ? undefined : film.id);
                  }}
                >
                  {watching === film.id ? 'Chiudi' : 'Guarda'}
                </button>
                <a className="button" href={earlierFilmUrl(filmId, film.id)} download>
                  Salva una copia…
                </a>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    onConfirm(film.id);
                  }}
                >
                  Togli
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

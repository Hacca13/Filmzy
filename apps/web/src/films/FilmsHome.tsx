import type { Project, ProjectOptions } from '@filmzy/contracts';

import { fetchProjectOptions, fetchProjects } from '../api/projects';
import { Notice } from '../components/ui';
import { formatDateTime } from '../lib/format';
import { useResource } from '../lib/use-resource';
import { describeError } from '../settings/messages';
import { filmSubtitle, phaseLabel } from './model';
import { NEW_FILM_HREF, filmHref } from './routes';

/**
 * «I tuoi film» (T3.2): l'elenco dei film, l'ultimo toccato per primo, e il pulsante per
 * cominciarne uno. È la porta d'ingresso: da qui si riprende un film dal punto in cui era.
 */
export function FilmsHome() {
  const films = useResource(fetchProjects);
  const options = useResource(fetchProjectOptions);

  return (
    <section className="films">
      <div className="films-head">
        <h2>I tuoi film</h2>
        <a className="button" data-kind="primary" href={NEW_FILM_HREF}>
          Nuovo film
        </a>
      </div>
      {films.state.status === 'error' ? (
        <Notice tone="error">{describeError(films.state.error)}</Notice>
      ) : films.state.status === 'loading' ? (
        <p className="hint">Un attimo…</p>
      ) : (
        <FilmList
          films={films.state.data.projects}
          options={options.state.status === 'ready' ? options.state.data : undefined}
        />
      )}
    </section>
  );
}

export function FilmList({
  films,
  options,
}: {
  films: readonly Project[];
  options: ProjectOptions | undefined;
}) {
  if (films.length === 0) {
    return (
      <p className="hint">Non hai ancora nessun film. Parti da un’idea: bastano poche righe.</p>
    );
  }
  return (
    <ul className="film-list">
      {films.map((film) => (
        <li key={film.id} className="film-card">
          <a href={filmHref(film.id)}>
            <strong>{film.title}</strong>
          </a>
          <span className="hint">{filmSubtitle(film, options)}</span>
          <span className="hint">
            Prossimo passo: {phaseLabel(film.phase)} · modificato il{' '}
            {formatDateTime(film.updatedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

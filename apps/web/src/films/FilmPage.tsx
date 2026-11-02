import type { Project, ProjectOptions } from '@filmzy/contracts';
import { useCallback } from 'react';

import { fetchProject, fetchProjectOptions } from '../api/projects';
import { Notice } from '../components/ui';
import { formatDateTime } from '../lib/format';
import { useResource } from '../lib/use-resource';
import { describeError } from '../settings/messages';
import { choiceLabel, formatDuration } from './model';
import { CastPanel } from './cast/CastPanel';
import { StoryPanel } from './story/StoryPanel';
import { ideaHref } from './routes';

/**
 * La pagina di un film (T3.2): ciò che ha scelto l'utente e il punto a cui è arrivato (§3.1). Le
 * schermate dei passi dopo l'idea arrivano con i loro compiti (T3.4 in poi).
 */
export function FilmPage({ filmId }: { filmId: string }) {
  const options = useResource(fetchProjectOptions);
  const loadFilm = useCallback((signal: AbortSignal) => fetchProject(filmId, signal), [filmId]);
  const film = useResource(loadFilm);

  if (film.state.status === 'error') {
    return <Notice tone="error">{describeError(film.state.error)}</Notice>;
  }
  if (film.state.status === 'loading') return <p className="hint">Un attimo…</p>;

  // Senza l'elenco delle scelte i nomi mancano, ma il film si vede lo stesso.
  return (
    <FilmView
      film={film.state.data}
      options={options.state.status === 'ready' ? options.state.data : undefined}
    />
  );
}

function FilmView({ film, options }: { film: Project; options: ProjectOptions | undefined }) {
  const details: [string, string | undefined][] = [
    ['Genere', choiceLabel(options?.genres, film.genre)],
    ['Tono', choiceLabel(options?.tones, film.tone)],
    ['Stile visivo', choiceLabel(options?.styles, film.style)],
    ['Fotografia', choiceLabel(options?.cinematography, film.cinematography)],
    ['Durata', formatDuration(film.durationS)],
  ];

  return (
    <section className="film-page">
      <p className="breadcrumb">
        <a href="#/">I miei film</a> › <strong>{film.title}</strong>
      </p>
      <h1>{film.title}</h1>
      <p className="hint">
        Salvato sul tuo computer · modificato il {formatDateTime(film.updatedAt)}
      </p>

      <section className="panel">
        <h2>La tua idea</h2>
        <p className="idea-read">{film.idea}</p>
        <dl className="details">
          {details.map(([label, value]) =>
            value === undefined ? null : (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ),
          )}
        </dl>
        <div className="actions">
          <a className="button" href={ideaHref(film.id)}>
            Rivedi l’idea
          </a>
        </div>
      </section>

      <StoryPanel filmId={film.id} />
      <CastPanel filmId={film.id} />
    </section>
  );
}

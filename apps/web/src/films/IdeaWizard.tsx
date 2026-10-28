import type { Project, ProjectOptions } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { createProject, fetchProject, fetchProjectOptions, updateProject } from '../api/projects';
import { Notice } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from '../settings/messages';
import { useAction } from '../settings/use-action';
import { IdeaForm } from './IdeaForm';
import { draftOf, initialDraft, toBody, type IdeaDraft } from './model';
import { filmHref } from './routes';

/**
 * La schermata «La tua idea» (T3.2): crea un film nuovo, oppure rivede l'idea di uno già fatto
 * (`filmId`). Finito, porta alla pagina del film.
 */
export function IdeaWizard({ filmId }: { filmId?: string }) {
  const options = useResource(fetchProjectOptions);
  const loadFilm = useCallback(
    (signal: AbortSignal) =>
      filmId === undefined ? Promise.resolve(undefined) : fetchProject(filmId, signal),
    [filmId],
  );
  const film = useResource(loadFilm);

  if (options.state.status === 'error') {
    return <Notice tone="error">{describeError(options.state.error)}</Notice>;
  }
  if (film.state.status === 'error') {
    return <Notice tone="error">{describeError(film.state.error)}</Notice>;
  }
  if (options.state.status === 'loading' || film.state.status === 'loading') {
    return <p className="hint">Un attimo…</p>;
  }

  return (
    <IdeaEditor
      key={filmId ?? 'nuovo'}
      filmId={filmId}
      options={options.state.data}
      film={film.state.data}
    />
  );
}

interface EditorProps {
  filmId: string | undefined;
  options: ProjectOptions;
  film: Project | undefined;
}

function IdeaEditor({ filmId, options, film }: EditorProps) {
  const [draft, setDraft] = useState<IdeaDraft>(
    film === undefined ? initialDraft(options) : draftOf(film),
  );
  const action = useAction();

  const submit = () => {
    const body = toBody(draft);
    if (body === undefined) return;
    action.run(async () => {
      const saved =
        filmId === undefined ? await createProject(body) : await updateProject(filmId, body);
      window.location.hash = filmHref(saved.id);
    });
  };

  return (
    <section className="film-page">
      <p className="eyebrow">{filmId === undefined ? 'Nuovo film' : 'La tua idea'}</p>
      <h1>{filmId === undefined ? 'Ogni film inizia con un «e se…»' : 'Rivedi la tua idea'}</h1>
      <p className="hint">Raccontaci la storia che hai in testa. Al resto diamo forma insieme.</p>
      <IdeaForm
        options={options}
        draft={draft}
        onChange={setDraft}
        onSubmit={submit}
        submitLabel={filmId === undefined ? 'Continua' : 'Salva l’idea'}
        busy={action.busy}
        problem={action.problem}
      />
    </section>
  );
}

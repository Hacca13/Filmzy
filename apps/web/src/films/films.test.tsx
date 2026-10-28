import type { Project, ProjectOptions } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FilmList } from './FilmsHome';
import { IdeaForm } from './IdeaForm';
import { initialDraft } from './model';

const options: ProjectOptions = {
  genres: [
    { id: 'drama', label: 'Drammatico' },
    { id: 'comedy', label: 'Commedia' },
  ],
  tones: [{ id: 'moving', label: 'Commovente' }],
  styles: [{ id: 'realistic', label: 'Realistico', description: 'Ripresa dal vero' }],
  cinematography: [{ id: 'noir', label: 'Noir' }],
  durationsS: [30, 60, 90],
  defaults: {
    genre: 'drama',
    tone: 'moving',
    style: 'realistic',
    cinematography: 'noir',
    durationS: 60,
  },
  ideaMaxLength: 2000,
  titleMaxLength: 80,
};

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'noir',
  language: 'it',
  durationS: 60,
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:05:00.000Z',
};

describe('IdeaForm', () => {
  const render = (
    draft = initialDraft(options),
    extra: { busy?: boolean; problem?: string } = {},
  ) =>
    renderToStaticMarkup(
      <IdeaForm
        options={options}
        draft={draft}
        onChange={() => undefined}
        onSubmit={() => undefined}
        submitLabel="Continua"
        busy={extra.busy ?? false}
        problem={extra.problem}
      />,
    );

  it('mostra l’idea, il titolo facoltativo e le cinque scelte con le parole di tutti i giorni', () => {
    const html = render();

    for (const text of [
      'Racconta la tua idea in poche righe',
      'Titolo (facoltativo)',
      'Genere',
      'Tono',
      'Stile visivo',
      'Fotografia',
      'Durata',
      'Drammatico',
      'Ripresa dal vero',
      '1 min 30 s',
    ]) {
      expect(html).toContain(text);
    }
  });

  it('le voci già scelte sono segnate, e il contatore parte da zero', () => {
    const html = render();

    expect(html).toContain('0 / 2.000');
    expect(html.match(/checked=""/g)).toHaveLength(5);
  });

  it('non mostra parole tecniche', () => {
    const html = render().toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });

  it('senza idea «Continua» è spento; con l’idea si accende', () => {
    expect(render()).toContain('disabled=""');
    expect(render({ ...initialDraft(options), idea: 'Una scintilla' })).not.toContain(
      'disabled=""',
    );
  });

  it('mentre salva il pulsante è spento e lo dice', () => {
    const html = render({ ...initialDraft(options), idea: 'x' }, { busy: true });

    expect(html).toContain('disabled=""');
    expect(html).toContain('Un attimo…');
  });

  it('se il salvataggio fallisce lo dice in chiaro', () => {
    expect(render(initialDraft(options), { problem: 'Filmzy non risponde.' })).toContain(
      'Filmzy non risponde.',
    );
  });
});

describe('FilmList', () => {
  it('senza film invita a partire da un’idea', () => {
    expect(renderToStaticMarkup(<FilmList films={[]} options={options} />)).toContain(
      'Non hai ancora nessun film',
    );
  });

  it('per ogni film: titolo che porta alla sua pagina, genere, durata e passo a cui è arrivato', () => {
    const html = renderToStaticMarkup(<FilmList films={[film]} options={options} />);

    expect(html).toContain('href="#/film/film-1"');
    expect(html).toContain('L’ultima corsa');
    expect(html).toContain('Drammatico · 1 min');
    expect(html).toContain('Prossimo passo: La storia');
  });

  it('senza l’elenco delle scelte non compare l’id del genere', () => {
    const html = renderToStaticMarkup(<FilmList films={[film]} options={undefined} />);

    expect(html).not.toContain('drama');
    expect(html).toContain('1 min');
  });
});

import type { Project, ProjectOptions } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FilmKindBody, type EstimateState } from './FilmKindField';
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
  kinds: [
    { id: 'spot', minS: 15, maxS: 60, stepS: 5, defaultS: 30, available: true },
    { id: 'short', minS: 60, maxS: 600, stepS: 30, defaultS: 60, available: true },
    { id: 'medium', minS: 600, maxS: 3600, stepS: 300, defaultS: 1800, available: false },
    { id: 'feature', minS: 3600, stepS: 600, defaultS: 5400, available: false },
  ],
  defaults: {
    genre: 'drama',
    tone: 'moving',
    style: 'realistic',
    cinematography: 'noir',
    kind: 'short',
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
  kind: 'short',
  phase: 'draft',
  createdAt: '2026-10-28T10:00:00.000Z',
  updatedAt: '2026-10-28T10:05:00.000Z',
};

describe('Che film vuoi fare?', () => {
  const body = (
    estimate: EstimateState = {
      status: 'ready',
      estimate: { available: true, lowUsd: 34.6, highUsd: 70.2 },
    },
    chosen: { kind?: 'spot' | 'short'; durationS?: number } = { kind: 'short', durationS: 300 },
  ) =>
    renderToStaticMarkup(
      <FilmKindBody
        kinds={options.kinds}
        kind={chosen.kind}
        durationS={chosen.durationS}
        onChange={() => undefined}
        estimate={estimate}
      />,
    );

  it('ci sono i quattro tipi, con la durata di ognuno', () => {
    const html = body();

    for (const text of [
      'Spot',
      'Corto',
      'Mediometraggio',
      'Lungometraggio',
      'Fino a 1 minuto',
      'Da 1 a 10 minuti',
      'Da 10 a 60 minuti',
      'Oltre 60 minuti',
    ]) {
      expect(html).toContain(text);
    }
  });

  it('i film lunghi si vedono, non si possono scegliere e non sembrano un errore', () => {
    const html = body();

    expect(html.match(/Nella prossima versione/g)).toHaveLength(2);
    const radio = (id: string) => new RegExp(`<input[^>]*value="${id}"[^>]*>`).exec(html)?.[0];
    expect(radio('medium')).toContain('disabled=""');
    expect(radio('feature')).toContain('disabled=""');
    expect(radio('short')).not.toContain('disabled=""');
    expect(html).toContain('arrivano nella prossima versione di Filmzy');
  });

  it('il cursore segue il tipo scelto', () => {
    const short = body();
    expect(short).toContain('circa 5 minuti');
    expect(short).toMatch(/<input[^>]*type="range"[^>]*min="60"[^>]*max="600"[^>]*step="30"/);
    expect(short).toContain('10 minuti');

    const spot = body(undefined, { kind: 'spot', durationS: 30 });
    expect(spot).toContain('circa 30 secondi');
    expect(spot).toMatch(/<input[^>]*type="range"[^>]*min="15"[^>]*max="60"/);
    expect(spot).toContain('15 secondi');
  });

  it('il costo si legge accanto al cursore, e dice che ora non si spende', () => {
    const html = body();

    expect(html).toContain('Costo indicativo');
    expect(html).toContain('circa 35–70 $');
    expect(html).toContain('Personaggi, luoghi e suoni sono a parte');
    expect(html).toContain('Non spendi niente adesso');
  });

  it('senza un servizio dice perché, porta alle impostazioni, e il film si crea lo stesso', () => {
    const html = body({
      status: 'ready',
      estimate: { available: false, reason: 'no_video_service' },
    });

    expect(html).toContain('non hai ancora attivato un servizio video');
    expect(html).toContain('href="#/impostazioni/connessioni"');
    expect(html).toContain('Vai alle impostazioni');
    expect(html).toContain('Puoi comunque creare il film');
    expect(html).not.toContain('Personaggi, luoghi e suoni');
  });

  it('se la stima non arriva lo dice, senza bloccare', () => {
    const html = body({ status: 'failed', problem: 'Il programma non risponde.' });

    expect(html).toContain('Il programma non risponde.');
    expect(html).toContain('Puoi comunque creare il film');
  });

  it('non mostra parole tecniche', () => {
    const html = body().toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });
});

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
      'Che film vuoi fare?',
      'Drammatico',
      'Ripresa dal vero',
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
    const submit = (html: string) => /<button type="submit"[^>]*>/.exec(html)?.[0] ?? '';

    expect(submit(render())).toContain('disabled=""');
    expect(submit(render({ ...initialDraft(options), idea: 'Una scintilla' }))).not.toContain(
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

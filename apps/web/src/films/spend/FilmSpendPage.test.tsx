import type { FilmSpend, SpendOverview } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FilmSpendLine } from './FilmSpendLine';
import { FilmSpendPage, SpendView } from './FilmSpendPage';

const film: FilmSpend = {
  projectId: 'film-1',
  title: 'L’ultima corsa',
  totalUsd: 12.4,
  monthUsd: 12.4,
  roles: [
    { role: 'camera_operator', label: 'Operatore di ripresa', spentUsd: 8.4, calls: 3 },
    { role: 'screenwriter', label: 'Sceneggiatore', spentUsd: 0.4, calls: 1 },
  ],
  services: [
    {
      modelId: 'kling-o3-standard',
      label: 'Kling · Standard',
      providerLabel: 'fal.ai',
      spentUsd: 8.4,
      calls: 3,
    },
  ],
};

const overview: SpendOverview = {
  monthStart: new Date(2026, 9, 1).toISOString(),
  totalMonthUsd: 27.4,
  servicesMonth: 2,
  filmsMonth: 2,
  filmsMonthUsd: 27.4,
  providers: [
    {
      connectionId: 'fal',
      label: 'fal.ai',
      spentUsd: 12.4,
      capUsd: 50,
      percent: 24.8,
      level: 'ok',
    },
    { connectionId: 'openai', label: 'OpenAI', spentUsd: 8, level: 'none' },
    {
      connectionId: 'eleven',
      label: 'ElevenLabs',
      spentUsd: 2,
      capUsd: 2,
      percent: 100,
      level: 'reached',
    },
  ],
  films: [
    { projectId: 'film-1', title: 'L’ultima corsa', spentUsd: 12.4, monthUsd: 12.4 },
    { projectId: 'film-2', title: 'Dove finisce il mare', spentUsd: 15, monthUsd: 15 },
  ],
};

const render = (spent: FilmSpend = film, month: SpendOverview = overview) =>
  renderToStaticMarkup(<SpendView film={spent} overview={month} />);

describe('Quanto ho speso (T4.7)', () => {
  it('ha il titolo, il mese e i due totali', () => {
    const html = render();

    expect(html).toContain('SPESE · OTTOBRE 2026');
    expect(html).toContain('<h1>Quanto ho speso</h1>');
    expect(html).toContain('12,40 $');
    expect(html).toContain('27,40 $');
    expect(html).toContain('L’ultima corsa · dall’inizio del film');
    expect(html).toContain('2 film · 2 servizi utilizzati');
    expect(html).toContain('Filmzy è gratuito');
  });

  it('divide la spesa per film, per ruolo e per servizio, con i nomi e senza id tecnici', () => {
    const html = render();

    expect(html).toContain('Per film · questo mese');
    expect(html).toContain('Dove finisce il mare');
    expect(html).toContain('Per ruolo · questo film');
    expect(html).toContain('Operatore di ripresa');
    expect(html).toContain('3 chiamate');
    expect(html).toContain('Per servizio · questo film');
    expect(html).toContain('Kling · Standard · fal.ai');
    expect(html).toContain('Totale del film: 12,40 $');
    expect(html).toContain('Totale del mese: 27,40 $');
    expect(html).not.toContain('camera_operator');
    expect(html).not.toContain('kling-o3-standard');
  });

  it('per ogni fornitore dice a che punto è rispetto al limite, o che non ce n’è uno', () => {
    const html = render();

    expect(html).toContain('Questo mese, per servizio');
    expect(html).toContain('mancano 37,60 $');
    expect(html).toContain('Nessun limite impostato');
    expect(html).toContain('Limite raggiunto');
    expect(html).toContain('Totale servizi del mese: 27,40 $');
  });

  it('senza spesa dice che non si è speso niente, senza barre né totali finti', () => {
    const html = render(
      { ...film, totalUsd: 0, monthUsd: 0, roles: [], services: [] },
      {
        ...overview,
        totalMonthUsd: 0,
        filmsMonthUsd: 0,
        filmsMonth: 0,
        servicesMonth: 0,
        films: [],
      },
    );

    expect(html).toContain('Questo mese non hai ancora speso niente.');
    expect(html).toContain('Per questo film non hai ancora speso niente.');
    expect(html).not.toContain('Totale del film');
    expect(html).toContain('0 film · 0 servizi utilizzati');
  });

  it('dice quanto del mese non è di nessun film, così il conto torna', () => {
    const withTests = { ...overview, totalMonthUsd: 30.4 };

    expect(render(film, withTests)).toContain('Di questi, 3,00 $ non sono di nessun film');
    expect(render()).not.toContain('non sono di nessun film');
  });

  it('se il riepilogo del mese non si legge, il film si vede lo stesso e il problema è detto', () => {
    const html = renderToStaticMarkup(
      <SpendView film={film} overview={undefined} overviewProblem="Filmzy non risponde." />,
    );

    expect(html).toContain('Per ruolo · questo film');
    expect(html).toContain('Operatore di ripresa');
    expect(html).toContain('Filmzy non risponde.');
    expect(html).not.toContain('Tutti i film, questo mese');
    expect(html).not.toContain('Questo mese, per servizio');
  });

  it('dà il collegamento al film e alle impostazioni dei limiti', () => {
    const html = render();

    expect(html).toContain('href="#/film/film-1"');
    expect(html).toContain('href="#/impostazioni/spese"');
  });

  it('mentre legge la schermata dice «Un attimo…» e la pagina del film ha il collegamento', () => {
    expect(renderToStaticMarkup(<FilmSpendPage filmId="film-1" />)).toContain('Un attimo');
    expect(renderToStaticMarkup(<FilmSpendLine filmId="film-1" />)).toContain(
      'href="#/film/film-1/spese"',
    );
  });
});

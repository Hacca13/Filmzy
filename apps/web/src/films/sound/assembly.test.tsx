import { JOB_INTERRUPTED, type AssemblyView } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/client';
import { AssemblyBody } from './AssemblySection';
import { EarlierFilmsList } from './EarlierFilms';
import {
  assemblyFailureText,
  assemblyIsWorking,
  earlierFilmLabel,
  gapText,
  removeFilmFailureText,
} from './assembly-model';

const view = (patch: Partial<AssemblyView> = {}): AssemblyView => ({
  gaps: [],
  earlier: [],
  upToDate: false,
  exportWorking: false,
  titles: {
    title: 'L’ultima corsa',
    cast: 'Con Anna e Marco',
    aiNotice: 'Contiene contenuti generati con intelligenza artificiale',
  },
  ...patch,
});

const made: NonNullable<AssemblyView['film']> = {
  id: 'm-1',
  status: 'succeeded',
  assetId: 'film',
  createdAt: '2026-11-05T10:00:00.000Z',
};

const body = (value: AssemblyView) =>
  renderToStaticMarkup(<AssemblyBody view={value} busy={false} onStart={() => undefined} />);

const startButton = (html: string) => /<button[^>]*>[^<]*<\/button>/.exec(html)?.[0] ?? '';

describe('cosa manca', () => {
  it('si scrive in parole semplici', () => {
    expect(gapText({ kind: 'no_scenes' })).toBe('La storia non ha ancora nessuna scena');
    expect(gapText({ sceneNumber: 2, kind: 'not_planned' })).toBe(
      'Scena 2: le inquadrature sono ancora da pensare',
    );
    expect(gapText({ sceneNumber: 2, kind: 'stale' })).toBe(
      'Scena 2: è cambiata, rifai le inquadrature',
    );
    expect(gapText({ sceneNumber: 3, kind: 'no_take', missing: 1 })).toBe(
      'Scena 3: un’inquadratura senza video',
    );
    expect(gapText({ sceneNumber: 3, kind: 'no_take', missing: 4 })).toBe(
      'Scena 3: 4 inquadrature senza video',
    );
  });

  it('finché manca qualcosa il pulsante è spento, e l’elenco lo dice', () => {
    const html = body(view({ gaps: [{ sceneNumber: 1, kind: 'not_planned' }] }));

    expect(html).toContain('Per montare il film manca ancora');
    expect(startButton(html)).toContain('disabled');
  });
});

describe('i film montati prima', () => {
  const earlier = { ...made, id: 'm-0', assetId: 'vecchio', durationS: 62 };

  const list = (patch: { watching?: string; confirming?: string; busy?: boolean } = {}) =>
    renderToStaticMarkup(
      <EarlierFilmsList
        filmId="film-1"
        films={[earlier]}
        watching={patch.watching}
        confirming={patch.confirming}
        busy={patch.busy ?? false}
        onWatch={() => undefined}
        onConfirm={() => undefined}
        onRemove={() => undefined}
      />,
    );

  it('si riconoscono da quando sono stati montati e da quanto durano', () => {
    expect(earlierFilmLabel(earlier)).toContain('novembre 2026');
    expect(earlierFilmLabel(earlier)).toContain('1 min 2 s');
    expect(earlierFilmLabel({ createdAt: earlier.createdAt })).not.toContain('·');
  });

  it('si possono guardare, salvare e togliere, e di loro non si dice che si cancellano da soli', () => {
    const html = list();

    expect(html).toContain('Guarda');
    expect(html).toContain('href="/api/projects/film-1/assembly/m-0/file"');
    expect(html).toContain('Salva una copia…');
    expect(html).toContain('Togli');
    expect(html).toContain('Restano sul tuo computer finché non li togli tu');
    expect(html).not.toContain('<video');
  });

  it('guardandone uno compare il lettore, e si può chiudere', () => {
    const html = list({ watching: 'm-0' });

    expect(html).toContain('<video');
    expect(html).toContain('/api/assets/vecchio');
    expect(html).toContain('Chiudi');
  });

  it('togliere chiede conferma: non si torna indietro', () => {
    const html = list({ confirming: 'm-0' });

    expect(html).toContain('Vuoi toglierlo dal computer?');
    expect(html).toContain('Sì, togli');
    expect(html).toContain('Annulla');
  });

  it('mentre ne toglie uno non si comincia a toglierne un altro', () => {
    expect(list({ busy: true })).toMatch(/<button[^>]*disabled[^>]*>Togli/);
  });

  it('se il disco è pieno dice cosa fare', () => {
    expect(assemblyFailureText('disk_full')).toContain('Togli qualche film montato prima');
  });

  it('se è aperto e non si toglie lo dice, in parole semplici', () => {
    expect(
      removeFilmFailureText(new ApiError('http_error', { serverCode: 'media_failed' })),
    ).toContain('forse è aperto');
    expect(removeFilmFailureText(new ApiError('network_error'))).toContain('non risponde');
  });
});

describe('il montaggio', () => {
  it('prima del primo tentativo si può montare, e i titoli si leggono', () => {
    const html = body(view());

    expect(startButton(html)).toContain('Monta il film');
    expect(startButton(html)).not.toContain('disabled');
    expect(html).toContain('L’ultima corsa');
    expect(html).toContain('Con Anna e Marco');
    expect(html).toContain('Contiene contenuti generati con intelligenza artificiale');
    expect(html).not.toContain('<video');
  });

  it('mentre lavora lo dice e non si chiede di nuovo', () => {
    const value = view({ latest: { ...made, status: 'running' } });

    expect(assemblyIsWorking(value)).toBe(true);
    expect(body(value)).toContain('Sto montando il film');
    expect(startButton(body(value))).toContain('disabled');
  });

  it('riuscito mostra il film e si può rifare', () => {
    const html = body(view({ latest: made, film: made, upToDate: true }));

    expect(html).toContain('<video');
    expect(startButton(html)).toContain('Monta di nuovo');
    expect(html).not.toContain('hai cambiato qualcosa');
  });

  it('mentre il film si esporta non si monta, e lo dice', () => {
    const html = body(view({ latest: made, film: made, upToDate: true, exportWorking: true }));

    expect(html).toContain('si sta esportando');
    expect(startButton(html)).toContain('disabled');
  });

  it('se dopo è cambiato qualcosa lo dice', () => {
    expect(body(view({ latest: made, film: made, upToDate: false }))).toContain(
      'hai cambiato qualcosa',
    );
  });

  it('un tentativo fallito o in corso non nasconde il film buono', () => {
    const failed = body(
      view({
        latest: { id: 'm-2', status: 'failed', errorCode: 'timeout', createdAt: 'x' },
        film: made,
        upToDate: true,
      }),
    );
    const working = body(
      view({ latest: { id: 'm-2', status: 'running', createdAt: 'x' }, film: made }),
    );

    expect(failed).toContain('<video');
    expect(failed).toContain('ci ha messo troppo');
    expect(startButton(failed)).toContain('Monta di nuovo');
    expect(working).toContain('<video');
    expect(working).not.toContain('hai cambiato qualcosa');
  });

  it('fallito dice perché, in parole semplici, e si può riprovare', () => {
    const html = body(
      view({
        latest: { id: 'm-1', status: 'failed', errorCode: 'not_found', createdAt: 'x' },
      }),
    );

    expect(html).toContain('non c’è più sul computer');
    expect(startButton(html)).not.toContain('disabled');
    expect(assemblyFailureText(JOB_INTERRUPTED)).toContain('Non riparte da solo');
    expect(assemblyFailureText('ffmpeg_failed')).toContain('non è riuscito');
    expect(assemblyFailureText(undefined)).toContain('non è riuscito');
  });
});

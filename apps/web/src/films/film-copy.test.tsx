import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { describeError } from '../settings/messages';
import { ApiError } from '../api/client';
import { filmCopyUrl } from '../api/film-copy';
import { OpenSavedFilmBody, SaveFilmCopy } from './OpenSavedFilm';

const body = (patch: { busy?: boolean; problem?: string } = {}) =>
  renderToStaticMarkup(
    <OpenSavedFilmBody
      busy={patch.busy ?? false}
      problem={patch.problem}
      onPick={() => undefined}
    />,
  );

const fail = (serverCode: string, field: string) =>
  describeError(new ApiError('http_error', { serverCode, details: { field } }));

describe('aprire un film salvato', () => {
  it('c’è il pulsante, e mentre apre lo dice', () => {
    expect(body()).toContain('Apri un film salvato');
    expect(body({ busy: true })).toContain('Sto aprendo il film…');
    expect(body({ problem: 'Non va' })).toContain('Non va');
  });

  it('i motivi per cui una copia non si apre si leggono in parole semplici', () => {
    expect(fail('invalid_request', 'copyFile')).toContain('non è una copia di un film');
    expect(fail('invalid_request', 'filmTooNew')).toContain('versione più nuova');
    expect(fail('invalid_request', 'filmExists')).toContain('già su questo computer');
    expect(fail('invalid_request', 'importWorking')).toContain('Sto già aprendo');
  });

  it('un problema del disco non parla di video', () => {
    expect(fail('media_failed', 'diskFull')).toContain('Il disco è pieno');
    expect(fail('media_failed', 'copy')).toContain('La copia del film non si è aperta');
    expect(fail('media_failed', 'copy')).not.toContain('video');
  });
});

describe('salvare una copia', () => {
  it('c’è il pulsante, e si scarica dal server col nome che sceglie lui', () => {
    expect(renderToStaticMarkup(<SaveFilmCopy filmId="film-1" />)).toContain(
      'Salva una copia del film',
    );
    expect(filmCopyUrl('film-1')).toBe('/api/projects/film-1/copy');
  });

  it('con un lavoro aperto lo dice prima', () => {
    expect(fail('invalid_request', 'filmWorking')).toContain('sta ancora lavorando');
  });
});

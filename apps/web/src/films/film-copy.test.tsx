import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { describeError } from '../settings/messages';
import { ApiError } from '../api/client';
import { filmCopyUrl } from '../api/film-copy';
import { OpenSavedFilmBody } from './OpenSavedFilm';

const body = (patch: { busy?: boolean; problem?: string; asking?: boolean } = {}) =>
  renderToStaticMarkup(
    <OpenSavedFilmBody
      busy={patch.busy ?? false}
      problem={patch.problem}
      asking={patch.asking ?? false}
      onPick={() => undefined}
      onReplace={() => undefined}
      onCancel={() => undefined}
    />,
  );

describe('aprire un film salvato', () => {
  it('c’è il pulsante, e mentre apre lo dice', () => {
    expect(body()).toContain('Apri un film salvato');
    expect(body({ busy: true })).toContain('Sto aprendo il film…');
  });

  it('se il film c’è già chiede prima di sostituirlo, e dice cosa si perde', () => {
    const html = body({ asking: true });

    expect(html).toContain('Questo film c’è già');
    expect(html).toContain('andrà perso');
    expect(html).toContain('Sì, sostituisci');
    expect(html).toContain('Annulla');
  });

  it('i motivi per cui una copia non si apre si leggono in parole semplici', () => {
    const fail = (field: string) =>
      describeError(
        new ApiError('http_error', { serverCode: 'invalid_request', details: { field } }),
      );

    expect(fail('copyFile')).toContain('non è una copia di un film');
    expect(fail('filmTooNew')).toContain('versione più nuova');
    expect(fail('filmWorking')).toContain('sta ancora lavorando');
  });
});

describe('salvare una copia', () => {
  it('si scarica dal server, col nome che sceglie lui', () => {
    expect(filmCopyUrl('film-1')).toBe('/api/projects/film-1/copy');
  });
});

import { describe, expect, it } from 'vitest';

import { NEW_FILM_HREF, filmHref, ideaHref, parseFilmRoute } from './routes';

describe('parseFilmRoute', () => {
  it('riconosce le tre schermate del film', () => {
    expect(parseFilmRoute('/film/nuovo')).toEqual({ page: 'new' });
    expect(parseFilmRoute('/film/abc-123')).toEqual({ page: 'film', id: 'abc-123' });
    expect(parseFilmRoute('/film/abc-123/idea')).toEqual({ page: 'idea', id: 'abc-123' });
  });

  it('non scambia per un film quello che non lo è', () => {
    expect(parseFilmRoute('/')).toBeUndefined();
    expect(parseFilmRoute('/film')).toBeUndefined();
    expect(parseFilmRoute('/film/')).toBeUndefined();
    expect(parseFilmRoute('/impostazioni/connessioni')).toBeUndefined();
    expect(parseFilmRoute('/film/abc/storia')).toBeUndefined();
    expect(parseFilmRoute('/film/abc/idea/altro')).toBeUndefined();
    expect(parseFilmRoute('/film/nuovo/idea')).toBeUndefined();
  });

  it('un indirizzo con un «%» spezzato torna alla home invece di rompersi', () => {
    expect(parseFilmRoute('/film/%E0%A4%A')).toBeUndefined();
  });

  it('i link e il percorso dicono la stessa cosa, anche con caratteri strani', () => {
    expect(NEW_FILM_HREF).toBe('#/film/nuovo');
    for (const id of ['abc-123', 'con spazio', 'a/b']) {
      expect(parseFilmRoute(filmHref(id).slice(1))).toEqual({ page: 'film', id });
      expect(parseFilmRoute(ideaHref(id).slice(1))).toEqual({ page: 'idea', id });
    }
  });
});

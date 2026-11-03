/**
 * Le schermate del film e i loro indirizzi (`#/film/…`). Chi legge il percorso e chi scrive i link
 * passano da qui, così non possono dirsi cose diverse.
 */
export type FilmRoute =
  | { page: 'new' }
  | { page: 'film'; id: string }
  | { page: 'idea'; id: string }
  | { page: 'spend'; id: string };

export const NEW_FILM_HREF = '#/film/nuovo';

export const filmHref = (id: string): string => `#/film/${encodeURIComponent(id)}`;

export const ideaHref = (id: string): string => `${filmHref(id)}/idea`;

/** «Quanto ho speso» (T4.7): la spesa di questo film. */
export const spendHref = (id: string): string => `${filmHref(id)}/spese`;

/** Il percorso (senza `#`) come schermata del film, o niente se non è di un film. */
export function parseFilmRoute(path: string): FilmRoute | undefined {
  const [root, second, third, ...extra] = path.split('/').slice(1);
  if (root !== 'film' || second === undefined || second === '' || extra.length > 0) {
    return undefined;
  }
  if (second === 'nuovo') return third === undefined ? { page: 'new' } : undefined;

  const id = safeDecode(second);
  if (id === undefined) return undefined;
  if (third === undefined) return { page: 'film', id };
  if (third === 'idea') return { page: 'idea', id };
  return third === 'spese' ? { page: 'spend', id } : undefined;
}

function safeDecode(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment);
  } catch {
    // Un indirizzo scritto a mano con un «%» spezzato: non è un film, si torna alla home.
    return undefined;
  }
}

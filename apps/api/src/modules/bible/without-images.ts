import type { Character, Location, StoryBible } from '@filmzy/contracts';

/**
 * Cast e luoghi senza immagini: ai servizi di testo non servono, e i file sono sul computer
 * dell'utente. Lo usano tutti i compiti che passano la Bibbia, o parte di essa, a un ruolo di testo.
 */
export const charactersWithoutImages = (characters: readonly Character[]): Character[] =>
  characters.map((character) => ({ ...character, sheet: [] }));

export const locationsWithoutImages = (locations: readonly Location[]): Location[] =>
  locations.map((location) => ({ ...location, references: [] }));

export function withoutImages(bible: StoryBible): StoryBible {
  return {
    ...bible,
    characters: charactersWithoutImages(bible.characters),
    locations: locationsWithoutImages(bible.locations),
  };
}

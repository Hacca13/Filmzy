import type { Character, Location, Screenplay } from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

type Bible = {
  characters: readonly Pick<Character, 'id'>[];
  locations: readonly Pick<Location, 'id'>[];
};

/**
 * La stesura scritta dal modello, resa coerente con il film (T3.8, D18): nella stesura ufficiale
 * le proposte di personaggi e luoghi sono vuote per definizione (si usano solo quelli scelti), e le
 * scene possono citare solo personaggi e luoghi che esistono.
 *
 * Un modello può sbagliare e citare un id che non c'è. Non si butta una stesura pagata per questo:
 * si tolgono i riferimenti che non portano a niente, e il testo della scena resta com'è.
 */
export function settleFinal(output: Screenplay, bible: Bible): Screenplay {
  const known = knownIds(bible);

  return {
    ...output,
    characters: [],
    locations: [],
    scenes: output.scenes.map(({ locationId, characterIds, ...scene }) => ({
      ...scene,
      characterIds: characterIds.filter((id) => known.characters.has(id)),
      ...(locationId !== undefined && known.locations.has(locationId) ? { locationId } : {}),
    })),
  };
}

/**
 * Il testo corretto a mano dall'utente deve essere una stesura vera: niente proposte e nessuna
 * scena che citi un personaggio o un luogo che il film non ha. Lo dice il server, perché
 * l'interfaccia non conosce gli id.
 */
export function assertFinalIsConsistent(screenplay: Screenplay, bible: Bible): void {
  if (screenplay.characters.length > 0) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.characters' } });
  }
  if (screenplay.locations.length > 0) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.locations' } });
  }
  const known = knownIds(bible);
  const citesUnknown = screenplay.scenes.some(
    (scene) =>
      scene.characterIds.some((id) => !known.characters.has(id)) ||
      (scene.locationId !== undefined && !known.locations.has(scene.locationId)),
  );
  if (citesUnknown) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.scenes' } });
  }
}

function knownIds(bible: Bible) {
  return {
    characters: new Set(bible.characters.map((character) => character.id)),
    locations: new Set(bible.locations.map((location) => location.id)),
  };
}

/** Gli stessi dati? Le due stesure sono già passate da Zod, quindi hanno le chiavi nello stesso ordine. */
export function isSameScreenplay(a: Screenplay, b: Screenplay): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Le parole che l'utente ha cambiato rispetto alla versione precedente, da far controllare al
 * moderatore (T3.3): solo i campi di testo cambiati, così non si ripaga un testo già controllato.
 * Vuoto se è cambiato soltanto qualcosa che non è testo (durata, personaggi di una scena).
 */
export function changedText(previous: Screenplay, next: Screenplay): string {
  const before = textsOf(previous);
  return [...textsOf(next)]
    .filter(([place, text]) => before.get(place) !== text)
    .map(([, text]) => text)
    .join('\n');
}

function textsOf(screenplay: Screenplay): Map<string, string> {
  const texts = new Map<string, string>([
    ['title', screenplay.title],
    ['logline', screenplay.logline],
  ]);
  if (screenplay.notes !== undefined) texts.set('notes', screenplay.notes);
  for (const scene of screenplay.scenes) {
    texts.set(`scene ${String(scene.number)} heading`, scene.heading);
    texts.set(`scene ${String(scene.number)} time`, scene.timeOfDay);
    texts.set(`scene ${String(scene.number)} summary`, scene.summary);
    scene.beats.forEach((beat, index) => {
      texts.set(`scene ${String(scene.number)} beat ${String(index)}`, beat);
    });
  }
  return texts;
}

import { isDeepStrictEqual } from 'node:util';

import type { Character, Location, Screenplay } from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

type Bible = {
  characters: readonly Pick<Character, 'id' | 'proposalId'>[];
  locations: readonly Pick<Location, 'id' | 'proposalId'>[];
};

/**
 * La stesura scritta dal modello, resa coerente con il film (T3.8, D18): nella stesura ufficiale
 * le proposte di personaggi e luoghi sono vuote per definizione (si usano solo quelli scelti), e le
 * scene possono citare solo personaggi e luoghi che esistono.
 *
 * Un modello può sbagliare. Se cita un personaggio o un luogo con l'id che aveva nella bozza (la
 * proposta) lo si ricollega a quello scelto; se cita un id che non c'è, si toglie il riferimento
 * e il testo della scena resta com'è. Non si butta una stesura pagata per questo.
 */
export function settleFinal(output: Screenplay, bible: Bible): Screenplay {
  const asCharacter = resolver(bible.characters);
  const asLocation = resolver(bible.locations);

  return {
    ...output,
    characters: [],
    locations: [],
    scenes: output.scenes.map(({ locationId, characterIds, ...scene }) => {
      const location = locationId === undefined ? undefined : asLocation(locationId);
      return {
        ...scene,
        characterIds: [...new Set(characterIds.flatMap((id) => asCharacter(id) ?? []))],
        ...(location === undefined ? {} : { locationId: location }),
      };
    }),
  };
}

/** Da un id citato a quello vero: lo stesso id, o l'elemento scelto a partire da quella proposta. */
function resolver(chosen: readonly { id: string; proposalId?: string | undefined }[]) {
  const known = new Set(chosen.map((item) => item.id));
  const byProposal = new Map(
    chosen.flatMap((item) =>
      item.proposalId === undefined ? [] : [[item.proposalId, item.id] as const],
    ),
  );
  return (id: string): string | undefined => (known.has(id) ? id : byProposal.get(id));
}

/**
 * Il testo corretto a mano dall'utente deve essere una stesura vera: niente proposte, scene con
 * numeri diversi e nessuna scena che citi un personaggio o un luogo che il film non ha. Lo dice il
 * server, perché l'interfaccia non conosce gli id.
 *
 * Una citazione che c'era già nella versione precedente passa: se l'utente ha tolto un personaggio
 * dal film dopo la stesura, non per questo deve restare bloccato fuori dalle correzioni. Chi salva
 * la ripulisce con `settleFinal`.
 */
export function assertFinalIsConsistent(
  screenplay: Screenplay,
  bible: Bible,
  previous: Screenplay,
): void {
  if (screenplay.characters.length > 0) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.characters' } });
  }
  if (screenplay.locations.length > 0) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.locations' } });
  }

  const numbers = screenplay.scenes.map((scene) => scene.number);
  const known = {
    characters: new Set(bible.characters.map((character) => character.id)),
    locations: new Set(bible.locations.map((location) => location.id)),
  };
  const citedBefore = {
    characters: new Set(previous.scenes.flatMap((scene) => scene.characterIds)),
    locations: new Set(previous.scenes.flatMap((scene) => scene.locationId ?? [])),
  };
  const citesNew = screenplay.scenes.some(
    (scene) =>
      scene.characterIds.some(
        (id) => !known.characters.has(id) && !citedBefore.characters.has(id),
      ) ||
      (scene.locationId !== undefined &&
        !known.locations.has(scene.locationId) &&
        !citedBefore.locations.has(scene.locationId)),
  );
  if (new Set(numbers).size !== numbers.length || citesNew) {
    throw domainError(400, 'invalid_request', { details: { field: 'screenplay.scenes' } });
  }
}

/** Gli stessi dati? Il confronto è sul contenuto: l'ordine delle chiavi non conta. */
export function isSameScreenplay(a: Screenplay, b: Screenplay): boolean {
  return isDeepStrictEqual(a, b);
}

/**
 * Le parole che l'utente ha cambiato rispetto alla versione precedente, da far controllare al
 * moderatore (T3.3): solo i campi di testo cambiati, così non si ripaga un testo già controllato.
 * Vuoto se è cambiato soltanto qualcosa che non è testo (durata, personaggi di una scena). Le
 * scene si riconoscono dal numero, che `assertFinalIsConsistent` garantisce diverso per ognuna.
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

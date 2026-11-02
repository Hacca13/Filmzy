import {
  STORYBOARD_PROMPT_MAX_CHARS,
  type CinematographerInput,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';
import type { TroupeConfig } from '@filmzy/troupe';

import { domainError } from '../../http/domain-error.js';

/**
 * Cosa si dice al direttore della fotografia perché scriva il prompt dell'immagine di
 * un'inquadratura (T4.1). Il prompt è per una **famiglia** di servizi (la sintassi dei personaggi e
 * i limiti cambiano), perciò `family` è quella del servizio che l'utente ha scelto.
 *
 * Il direttore non riceve i riferimenti visivi (architettura §4.7): li aggiunge il traduttore, e per
 * questo qui le immagini si tolgono dalla scheda e dal luogo. Un piano che cita un personaggio o un
 * luogo che il film non ha più non si può disegnare: si dice di rifarlo.
 */
export function cinematographerInputFor(args: {
  spec: ShotSpec;
  bible: StoryBible;
  config: TroupeConfig;
  family: string;
}): CinematographerInput {
  const { spec, bible, config, family } = args;

  const location = bible.locations.find((candidate) => candidate.id === spec.location.locationId);
  if (location === undefined) {
    throw domainError(409, 'invalid_request', { details: { field: 'locationId' } });
  }
  const movement = config.presets.cameraMovements.find(
    (candidate) => candidate.id === spec.intent.cameraMovement,
  );
  if (movement === undefined) {
    throw domainError(422, 'config_invalid', { details: { field: 'cameraMovement' } });
  }

  const characters = spec.characters.map((entry) => {
    const character = bible.characters.find((candidate) => candidate.id === entry.characterId);
    if (character === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'characterId' } });
    }
    return { id: character.id, name: character.name, costume: entry.costume };
  });

  const { camera, lighting, lens, grade } = bible.cinematography;
  const override = spec.cinematography === 'inherit' ? {} : spec.cinematography;

  return {
    shot: {
      ...spec,
      characters: spec.characters.map((entry) => ({ ...entry, references: [] })),
      location: { ...spec.location, references: [] },
    },
    characters,
    location: { ...location, references: [] },
    style: bible.style,
    cinematography: { camera, lighting, lens, grade, ...override },
    movement,
    target: {
      family,
      kind: 'image',
      maxPromptChars: STORYBOARD_PROMPT_MAX_CHARS,
      frame: 'start',
      inputs: ['references'],
    },
  };
}

/** Le immagini che entrano nella richiesta, ancora come id: i file si leggono dopo. */
export interface StoryboardReferences {
  /** Il volto bloccato di ogni personaggio dell'inquadratura che ne ha uno, nell'ordine della scheda. */
  characters: { characterId: string; assetId: string }[];
  /** L'immagine del set scelta per il luogo, se c'è. */
  locationAssetId?: string;
}

/**
 * Dal film com'è **adesso** (non da com'era quando l'inquadratura è stata pensata: il volto o il
 * set possono essere stati cambiati dopo). Per ogni personaggio basta la prima immagine della
 * scheda: i segnaposto `[[char:id]]` contano un riferimento per personaggio (architettura §4.7).
 */
export function storyboardReferences(spec: ShotSpec, bible: StoryBible): StoryboardReferences {
  const characters = spec.characters.flatMap((entry) => {
    const face = bible.characters.find((candidate) => candidate.id === entry.characterId)?.sheet[0];
    return face === undefined ? [] : [{ characterId: entry.characterId, assetId: face.assetId }];
  });
  const set = bible.locations.find((candidate) => candidate.id === spec.location.locationId)
    ?.references[0];

  return { characters, ...(set === undefined ? {} : { locationAssetId: set.assetId }) };
}

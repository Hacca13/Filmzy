import {
  STORYBOARD_PROMPT_MAX_CHARS,
  type CinematographerInput,
  type PromptTarget,
  type ShotSpec,
  type StoryBible,
  type StoryboardMode,
} from '@filmzy/contracts';
import type { MediaInput, TroupeConfig } from '@filmzy/troupe';

import { domainError } from '../../http/domain-error.js';
import type { IdentityReferences } from '../media/references.js';

/**
 * Cosa si dice al direttore della fotografia perché scriva il prompt dell'immagine di
 * un'inquadratura (T4.1). Il prompt è per una **famiglia** di servizi (la sintassi dei personaggi e
 * i limiti cambiano), perciò `family` è quella del servizio che l'utente ha scelto.
 *
 * Per l'ultimo fotogramma (`end_frame`, T4.2) il prompt dice solo cosa cambia rispetto al primo, che
 * viene modificato (D20): la destinazione è `end` e gli ingressi dati sono il primo e l'ultimo.
 *
 * Lo stesso vale per un video (T4.3): cambia solo la destinazione (`target`).
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
  /** Cosa si disegna: la destinazione senza la famiglia, che sta nel servizio scelto. */
  target: Omit<PromptTarget, 'family'>;
}): CinematographerInput {
  const { spec, bible, config, family, target } = args;

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
    target: { family, ...target },
  };
}

/** La famiglia del servizio: il direttore della fotografia scrive il prompt nella sua sintassi. */
export function familyOf(config: TroupeConfig, modelId: string): string {
  const family = config.models[modelId]?.family;
  if (family === undefined) {
    throw domainError(422, 'config_invalid', { details: { modelId } });
  }
  return family;
}

/** La destinazione di un'immagine dello storyboard: un fotogramma fisso, o l'ultimo che modifica il primo (D20). */
export const storyboardTarget = (mode: StoryboardMode): Omit<PromptTarget, 'family'> => ({
  kind: 'image',
  maxPromptChars: STORYBOARD_PROMPT_MAX_CHARS,
  frame: mode === 'end_frame' ? 'end' : 'start',
  inputs: mode === 'end_frame' ? ['first_frame', 'last_frame'] : ['references'],
});

/**
 * Le immagini che mantengono l'identità, ancora come id: i file si leggono dopo. Per ogni personaggio
 * dell'inquadratura che ne ha uno, il volto bloccato (nell'ordine della scheda); e l'immagine del set
 * scelta per il luogo, se c'è.
 */
export type StoryboardReferences = IdentityReferences;

/**
 * Un'immagine finta per scegliere i servizi e stimare il prezzo: conta quante immagini ci sono e a
 * cosa servono, non cosa contengono, quindi non si legge nessun file.
 */
export const standInImage = (use: MediaInput['use']): MediaInput => ({
  use,
  file: { fileName: 'immagine.png', contentType: 'image/png', bytes: new Uint8Array() },
});

/** Un riferimento finto per ogni volto e per il set: le immagini che un servizio riceve per mantenere l'identità. */
export const identityStandIns = (wanted: StoryboardReferences): MediaInput[] =>
  Array.from(
    { length: wanted.characters.length + (wanted.locationAssetId === undefined ? 0 : 1) },
    () => standInImage('reference'),
  );

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

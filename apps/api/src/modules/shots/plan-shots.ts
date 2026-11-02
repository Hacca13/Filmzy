import { createHash, randomUUID } from 'node:crypto';

import {
  SHOT_SPEC_SCHEMA_VERSION,
  type ContinuityState,
  type ProposedShot,
  type ScreenplayScene,
  type ShotSpec,
  type StoryBible,
} from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

/** L'id di una scena nelle schede inquadratura: le scene della stesura si riconoscono dal numero. */
export const sceneIdOf = (sceneNumber: number): string => `scene-${String(sceneNumber)}`;

/**
 * Un'impronta del testo di una scena. Si salva insieme alle inquadrature: se la scena cambia dopo
 * (la stesura è stata corretta o riscritta) l'impronta non combacia più e le inquadrature si
 * segnano da rifare, invece di restare in silenzio attaccate a una scena diversa.
 */
export function hashScene(scene: ScreenplayScene): string {
  const canonical = JSON.stringify([
    scene.number,
    scene.heading,
    scene.locationId ?? null,
    scene.timeOfDay,
    scene.characterIds,
    scene.summary,
    scene.beats,
    scene.durationS,
  ]);
  return createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}

/**
 * La Bibbia senza immagini: ai servizi di testo non servono, e i file sono sul computer
 * dell'utente.
 */
export function withoutImages(bible: StoryBible): StoryBible {
  return {
    ...bible,
    characters: bible.characters.map((character) => ({ ...character, sheet: [] })),
    locations: bible.locations.map((location) => ({ ...location, references: [] })),
  };
}

export interface SettleArgs {
  /** Le inquadrature come le ha pensate l'aiuto regista. */
  proposed: readonly ProposedShot[];
  sceneId: string;
  scene: ScreenplayScene;
  /** La Bibbia **con** le immagini: da qui il codice prende i riferimenti. */
  bible: StoryBible;
  /** Gli id dei movimenti di macchina attivi; il primo è quello di ripiego («resta fermo»). */
  movementIds: readonly string[];
}

/**
 * Dalle inquadrature pensate dall'aiuto regista alle schede inquadratura (architettura §5.2, §5.3):
 * il codice aggiunge ciò che il modello non scrive (id, versione dello schema, `images` vuoto, i
 * riferimenti dei personaggi e del luogo) e rende la scheda coerente con il film.
 *
 * Un modello può sbagliare un id. Non si butta un piano pagato per questo: un personaggio che non
 * esiste si toglie, un luogo che non esiste diventa quello della scena (o, se la scena non lo cita,
 * il primo del film), un movimento che non è nella lista diventa il primo («resta fermo»). L'ordine
 * lo decide la posizione nell'elenco.
 */
export function settleShots(args: SettleArgs): ShotSpec[] {
  const { proposed, sceneId, scene, bible, movementIds } = args;
  const [fallbackMovement] = movementIds;
  if (fallbackMovement === undefined) {
    throw domainError(422, 'config_invalid', { details: { field: 'cameraMovements' } });
  }
  if (proposed.length === 0) {
    throw domainError(502, 'invalid_output', {
      retryable: true,
      details: { role: 'shot_planner' },
    });
  }

  const characters = new Map(bible.characters.map((character) => [character.id, character]));
  const locations = new Map(bible.locations.map((location) => [location.id, location]));
  const fallbackLocation =
    scene.locationId !== undefined && locations.has(scene.locationId)
      ? scene.locationId
      : bible.locations[0]?.id;
  if (fallbackLocation === undefined) {
    throw domainError(409, 'invalid_request', { details: { field: 'locations' } });
  }

  const place = (id: string): string => (locations.has(id) ? id : fallbackLocation);
  const present = (ids: readonly string[]): string[] => [
    ...new Set(ids.filter((id) => characters.has(id))),
  ];
  const state = (given: ContinuityState): ContinuityState => ({
    locationId: place(given.locationId),
    timeOfDay: given.timeOfDay,
    present: present(given.present),
    costumes: Object.fromEntries(
      Object.entries(given.costumes).filter(([characterId]) => characters.has(characterId)),
    ),
    props: given.props,
  });

  return proposed.map((shot, order): ShotSpec => {
    const locationId = place(shot.location.locationId);
    return {
      schema: SHOT_SPEC_SCHEMA_VERSION,
      id: randomUUID(),
      sceneId,
      order,
      intent: {
        ...shot.intent,
        cameraMovement: movementIds.includes(shot.intent.cameraMovement)
          ? shot.intent.cameraMovement
          : fallbackMovement,
      },
      characters: shot.characters.flatMap(({ characterId, costume }) => {
        const character = characters.get(characterId);
        return character === undefined
          ? []
          : [{ characterId, costume, references: character.sheet }];
      }),
      location: { locationId, references: locations.get(locationId)?.references ?? [] },
      images: [],
      dialogue: shot.dialogue.filter((line) => characters.has(line.characterId)),
      cinematography: 'inherit',
      continuity: { entry: state(shot.continuity.entry), exit: state(shot.continuity.exit) },
    };
  });
}

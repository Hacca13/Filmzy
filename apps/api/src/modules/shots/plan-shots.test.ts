import {
  ROLE_INPUT_EXAMPLES,
  ROLE_OUTPUT_EXAMPLES,
  SHOT_SPEC_SCHEMA_VERSION,
  shotPlannerInputSchema,
  shotPlannerOutputSchema,
  shotSpecSchema,
  type ProposedShot,
  type ScreenplayScene,
  type StoryBible,
} from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { hashScene, sceneIdOf, settleShots, withoutImages } from './plan-shots.js';

const exampleBible = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner).bible;
const [baseCharacter] = exampleBible.characters;
const [baseLocation] = exampleBible.locations;
if (baseCharacter === undefined || baseLocation === undefined) {
  throw new Error('la Bibbia d’esempio ha un personaggio e un luogo');
}

/** La Bibbia di prova: Anna con la scheda bloccata, Marco senza, e due luoghi (uno con l'immagine del set). */
const bible: StoryBible = {
  ...exampleBible,
  characters: [
    {
      ...baseCharacter,
      id: 'anna',
      name: 'Anna',
      sheet: [{ assetId: 'volto-1' }, { assetId: 'volto-2' }],
    },
    { ...baseCharacter, id: 'marco', name: 'Marco', sheet: [] },
  ],
  locations: [
    {
      ...baseLocation,
      id: 'piazza',
      name: 'La piazza',
      references: [{ assetId: 'set-piazza' }],
    },
    { ...baseLocation, id: 'stazione', name: 'La stazione', references: [] },
  ],
};

const scene: ScreenplayScene = {
  number: 2,
  heading: 'EST. PIAZZA - SERA',
  locationId: 'piazza',
  timeOfDay: 'sera',
  characterIds: ['anna'],
  summary: 'Anna aspetta.',
  beats: ['Anna siede', 'Guarda l’ora'],
  durationS: 20,
};

/** La stessa scena, senza luogo scritto. */
const sceneWithoutPlace: ScreenplayScene = {
  number: 2,
  heading: 'EST. PIAZZA - SERA',
  timeOfDay: 'sera',
  characterIds: ['anna'],
  summary: 'Anna aspetta.',
  beats: [],
  durationS: 20,
};

const [example] = shotPlannerOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.shot_planner).shots;
if (example === undefined) throw new Error('l’esempio dell’aiuto regista ha un’inquadratura');

/** Un’inquadratura pensata dall’aiuto regista, con ciò che si vuole cambiare. */
const proposed = (patch: Partial<ProposedShot> = {}): ProposedShot => ({
  ...example,
  characters: [{ characterId: 'anna', costume: 'giacca chiara' }],
  location: { locationId: 'piazza' },
  intent: { ...example.intent, cameraMovement: 'push_in' },
  continuity: {
    entry: { ...example.continuity.entry, locationId: 'piazza', present: ['anna'], costumes: {} },
    exit: { ...example.continuity.exit, locationId: 'piazza', present: ['anna'], costumes: {} },
  },
  ...patch,
});

const settle = (shots: ProposedShot[], overrides: { movementIds?: string[] } = {}) =>
  settleShots({
    proposed: shots,
    sceneId: sceneIdOf(scene.number),
    scene,
    bible,
    movementIds: overrides.movementIds ?? ['static', 'push_in'],
  });

function codeOf(call: () => unknown): string | undefined {
  try {
    call();
  } catch (error) {
    if (error instanceof HttpException) return (error.getResponse() as { code: string }).code;
    throw error;
  }
  return undefined;
}

describe('hashScene', () => {
  it('è lo stesso per la stessa scena e cambia con il testo o con chi ci sta', () => {
    expect(hashScene(scene)).toBe(hashScene({ ...scene }));
    expect(hashScene(scene)).not.toBe(hashScene({ ...scene, summary: 'Anna parte.' }));
    expect(hashScene(scene)).not.toBe(hashScene({ ...scene, characterIds: ['anna', 'marco'] }));
    expect(hashScene(scene)).not.toBe(hashScene({ ...scene, locationId: 'stazione' }));
  });
});

describe('withoutImages', () => {
  it('toglie le immagini di personaggi e luoghi e lascia il resto', () => {
    const text = withoutImages(bible);

    expect(text.characters.map((c) => c.sheet)).toEqual([[], []]);
    expect(text.locations.map((l) => l.references)).toEqual([[], []]);
    expect(text.characters.map((c) => c.name)).toEqual(['Anna', 'Marco']);
  });
});

describe('settleShots', () => {
  it('fa una scheda inquadratura valida: id, versione dello schema, scena, ordine e riferimenti', () => {
    const [first, second] = settle([proposed(), proposed()]);

    expect(shotSpecSchema.safeParse(first).success).toBe(true);
    expect(first).toMatchObject({
      schema: SHOT_SPEC_SCHEMA_VERSION,
      sceneId: 'scene-2',
      order: 0,
      images: [],
      cinematography: 'inherit',
    });
    expect(second?.order).toBe(1);
    expect(first?.id).not.toBe(second?.id);
    // I riferimenti li aggiunge il codice: la scheda del volto e l'immagine del set.
    expect(first?.characters[0]?.references).toEqual([
      { assetId: 'volto-1' },
      { assetId: 'volto-2' },
    ]);
    expect(first?.location.references).toEqual([{ assetId: 'set-piazza' }]);
  });

  it('toglie i personaggi che il film non ha, ovunque siano citati', () => {
    const [shot] = settle([
      proposed({
        characters: [
          { characterId: 'anna', costume: 'giacca' },
          { characterId: 'fantasma', costume: 'mantello' },
        ],
        continuity: {
          entry: {
            ...proposed().continuity.entry,
            present: ['anna', 'fantasma', 'anna'],
            costumes: { anna: 'giacca', fantasma: 'mantello' },
          },
          exit: proposed().continuity.exit,
        },
        dialogue: [{ characterId: 'fantasma', text: 'Buu', language: 'it' }],
      }),
    ]);

    expect(shot?.characters.map((c) => c.characterId)).toEqual(['anna']);
    expect(shot?.continuity.entry.present).toEqual(['anna']);
    expect(shot?.continuity.entry.costumes).toEqual({ anna: 'giacca' });
    expect(shot?.dialogue).toEqual([]);
  });

  it('un luogo che non esiste diventa quello della scena; senza luogo nella scena, il primo del film', () => {
    const wrong = proposed({
      location: { locationId: 'inventato' },
      continuity: {
        entry: { ...proposed().continuity.entry, locationId: 'inventato' },
        exit: { ...proposed().continuity.exit, locationId: 'altro' },
      },
    });

    const [inScene] = settle([wrong]);
    expect(inScene?.location.locationId).toBe('piazza');
    expect(inScene?.continuity.entry.locationId).toBe('piazza');
    expect(inScene?.continuity.exit.locationId).toBe('piazza');

    const [firstOfFilm] = settleShots({
      proposed: [wrong],
      sceneId: 'scene-2',
      scene: sceneWithoutPlace,
      bible,
      movementIds: ['static'],
    });
    expect(firstOfFilm?.location.locationId).toBe('piazza');
  });

  it('un luogo che esiste resta, con la sua immagine del set', () => {
    const [shot] = settle([proposed({ location: { locationId: 'stazione' } })]);

    expect(shot?.location).toEqual({ locationId: 'stazione', references: [] });
  });

  it('un movimento di macchina che non è nella lista diventa il primo; uno valido resta', () => {
    const [valid, invalid] = settle([
      proposed(),
      proposed({ intent: { ...proposed().intent, cameraMovement: 'volo_acrobatico' } }),
    ]);

    expect(valid?.intent.cameraMovement).toBe('push_in');
    expect(invalid?.intent.cameraMovement).toBe('static');
  });

  it('senza inquadrature è un’uscita non valida che si può riprovare', () => {
    expect(codeOf(() => settle([]))).toBe('invalid_output');
  });

  it('senza movimenti attivi la configurazione non va, senza luoghi nel film manca un passo', () => {
    expect(codeOf(() => settle([proposed()], { movementIds: [] }))).toBe('config_invalid');
    expect(
      codeOf(() =>
        settleShots({
          proposed: [proposed()],
          sceneId: 'scene-2',
          scene: sceneWithoutPlace,
          bible: { ...bible, locations: [] },
          movementIds: ['static'],
        }),
      ),
    ).toBe('invalid_request');
  });
});

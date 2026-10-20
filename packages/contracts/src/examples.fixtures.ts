import { SHOT_SPEC_SCHEMA_VERSION } from './versions.js';

/**
 * Esempi condivisi dai test dei ruoli: un film minimo ma completo, con i valori copiati dai file
 * di seme di `config/`. Non entrano nel pacchetto compilato (`tsconfig.build.json`).
 */

export const exampleStyle = {
  id: 'realistic',
  label: 'Realistico',
  description: 'Ripresa dal vero, colori naturali',
  hint: 'photorealistic live-action film still, natural skin tones',
  enabled: true,
} as const;

export const exampleCinematography = {
  id: 'handheld_warm',
  label: 'Camera a mano, luce calda',
  description: 'Vicina ai personaggi, intima, un po’ mossa',
  camera: 'handheld camera, subtle natural shake, close and medium shots',
  lighting: 'warm practical lights, soft shadows',
  lens: '35mm, shallow depth of field',
  grade: 'warm tones, gentle contrast',
  enabled: true,
} as const;

export const exampleMovement = {
  id: 'push_in',
  label: 'Avvicinati',
  description: 'La camera si avvicina piano al soggetto',
  hint: 'slow, steady push-in, the camera moves closer to the subject',
  endFrameHint: 'the camera has moved closer: tighter framing on the subject, same angle',
  enabled: true,
} as const;

export const exampleGenre = { id: 'drama', label: 'Drammatico' } as const;

export const exampleTone = { id: 'moving', label: 'Commovente' } as const;

export const exampleTag = {
  id: 'protagonist',
  label: 'Protagonista',
  description: 'La storia segue lui o lei',
  enabled: true,
} as const;

export const exampleCharacter = {
  id: 'anna',
  name: 'Anna',
  tag: 'protagonist',
  role: 'protagonist',
  description: 'Una donna sui 35 anni che torna nella sua città natale',
  appearance: {
    apparentAge: '35',
    build: 'media',
    hair: 'riccia, rossa, raccolta',
    face: 'lentiggini, sorriso aperto',
    clothing: 'giacca di jeans chiara',
    prompt: 'a woman in her mid-30s, curly red hair, freckles, light denim jacket',
  },
  sheet: [{ assetId: 'asset-1' }, { assetId: 'asset-2' }, { assetId: 'asset-3' }],
} as const;

export const exampleLocation = {
  id: 'piazza',
  name: 'La piazza del paese',
  description: 'Piazza centrale al tramonto',
  prompt: 'a small town square at sunset, warm light',
  references: [{ assetId: 'asset-4' }],
} as const;

export const exampleProject = {
  id: 'proj-1',
  title: 'Il corto di Anna',
  idea: 'Una donna torna nella sua città natale per ritrovare un vecchio amico',
  genre: 'drama',
  tone: 'moving',
  language: 'it',
  durationS: 60,
} as const;

export const exampleBible = {
  project: exampleProject,
  style: exampleStyle,
  cinematography: exampleCinematography,
  characters: [exampleCharacter],
  locations: [exampleLocation],
  limits: { maxCharacters: 2 },
} as const;

export const exampleContinuity = {
  locationId: 'piazza',
  timeOfDay: 'tramonto',
  present: ['anna'],
  costumes: { anna: 'giacca di jeans chiara' },
  props: ['lettera'],
} as const;

/** Una scena come la scrive lo sceneggiatore: senza `id`. */
export const exampleDraftScene = {
  number: 1,
  heading: 'La piazza, tramonto',
  locationId: 'piazza',
  timeOfDay: 'tramonto',
  characterIds: ['anna'],
  summary: 'Anna attraversa la piazza e riconosce un volto',
  beats: [],
  durationS: 20,
} as const;

/** La stessa scena salvata, con il suo `id`: è quella che entra negli input dei ruoli. */
export const exampleScene = { ...exampleDraftScene, id: 'scene-1' } as const;

export const exampleScreenplay = {
  title: 'Il corto di Anna',
  logline: 'Una donna torna nella sua città natale',
  characters: [{ id: 'anna', name: 'Anna', role: 'protagonist' }],
  locations: [
    {
      id: 'piazza',
      name: 'La piazza del paese',
      description: 'Piazza centrale al tramonto',
      prompt: 'a small town square at sunset',
    },
  ],
  scenes: [exampleDraftScene],
} as const;

export const exampleShotSpec = {
  schema: SHOT_SPEC_SCHEMA_VERSION,
  id: 'shot-1',
  sceneId: 'scene-1',
  order: 0,
  intent: {
    action: 'Anna guarda in camera e sorride appena',
    emotion: 'speranzosa',
    framing: 'close_up',
    cameraMovement: 'push_in',
    lighting: 'luce calda del tramonto',
    durationS: 5,
  },
  characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara', references: [] }],
  location: { locationId: 'piazza', references: [] },
  images: [],
  dialogue: [],
  cinematography: 'inherit',
  continuity: { entry: exampleContinuity, exit: exampleContinuity },
} as const;

import type { RoleId } from './roles.js';
import { SHOT_SPEC_SCHEMA_VERSION } from './versions.js';

/**
 * Un film minimo ma completo, con i valori copiati dai file di seme di `config/`, e un input di
 * esempio per ogni ruolo (`ROLE_INPUT_EXAMPLES`). Gli esempi servono al validatore della
 * configurazione, che li usa per il rendering di prova delle istruzioni in modalità rigorosa
 * (architettura §4.6 punto 4), e più avanti a `pnpm eval` e alla «Prova» delle impostazioni.
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

const exampleVisualPrompt = {
  prompt: 'close up of a woman with curly red hair smiling faintly, golden hour light',
} as const;

/**
 * Un input di esempio per ogni ruolo (architettura §4.6 punto 4). Un test li valida tutti con
 * `ROLE_IO[role].input`: se uno schema cambia e l'esempio non combacia più, la CI lo dice.
 */
export const ROLE_INPUT_EXAMPLES: Record<RoleId, unknown> = {
  moderator: {
    text: 'Una donna torna nella sua città natale per ritrovare un vecchio amico',
    context: 'idea',
    language: 'it',
  },
  casting: {
    mode: 'initial',
    idea: exampleProject.idea,
    genre: exampleGenre,
    tone: exampleTone,
    style: exampleStyle,
    screenplay: null,
    cast: [],
    scene: null,
    count: 2,
    tags: [exampleTag],
    language: 'it',
  },
  screenwriter: {
    mode: 'draft',
    idea: exampleProject.idea,
    genre: exampleGenre,
    tone: exampleTone,
    style: exampleStyle,
    durationS: 60,
    language: 'it',
    maxCharacters: 2,
    dialogueEnabled: false,
    characters: [],
    locations: [],
    draft: null,
    request: null,
    accepted: [],
  },
  shot_planner: {
    scene: exampleScene,
    bible: exampleBible,
    shotDurationS: { min: 3, max: 8 },
    previousExit: null,
    cameraMovements: [exampleMovement],
    language: 'it',
    moodboard: null,
  },
  cinematographer: {
    shot: exampleShotSpec,
    characters: [{ id: 'anna', name: 'Anna', costume: 'giacca di jeans chiara' }],
    location: exampleLocation,
    style: exampleStyle,
    cinematography: {
      camera: exampleCinematography.camera,
      lighting: exampleCinematography.lighting,
      lens: exampleCinematography.lens,
      grade: exampleCinematography.grade,
    },
    movement: exampleMovement,
    target: {
      family: 'image_generic',
      kind: 'image',
      maxPromptChars: 900,
      frame: 'end',
      inputs: ['first_frame', 'last_frame'],
    },
  },
  script_supervisor: {
    screenplay: exampleScreenplay,
    scenes: [exampleScene],
    shots: [exampleShotSpec],
    language: 'it',
  },
  sound_planner: {
    screenplay: exampleScreenplay,
    scenes: [exampleScene],
    shots: [exampleShotSpec],
    genre: exampleGenre,
    tone: exampleTone,
    style: exampleStyle,
    language: 'it',
  },
  moodboard_designer: {
    scope: 'film',
    idea: exampleProject.idea,
    genre: exampleGenre,
    tone: exampleTone,
    style: exampleStyle,
    cinematography: exampleCinematography,
    screenplay: exampleScreenplay,
    sceneId: null,
    moodboard: null,
    referenceCount: 4,
    language: 'it',
  },
  image_analyst: {
    image: { assetId: 'asset-5' },
    purpose: 'moodboard',
    context: null,
    language: 'it',
  },
  character_designer: {
    character: exampleCharacter,
    style: exampleStyle,
    angle: 'three_quarter',
    moodboard: null,
  },
  set_designer: {
    location: exampleLocation,
    style: exampleStyle,
    variants: 3,
    moodboard: null,
  },
  moodboard_artist: {
    prompt: 'a warm lit town square at dusk, long shadows',
    style: exampleStyle,
    variants: 2,
  },
  retoucher: {
    image: { assetId: 'asset-4' },
    mask: { assetId: 'asset-6' },
    operation: 'remove',
    instruction: null,
    style: exampleStyle,
  },
  storyboard_artist: {
    mode: 'storyboard',
    visualPrompt: exampleVisualPrompt,
    references: [{ assetId: 'asset-1' }],
    variants: 3,
    baseImage: null,
    moodboard: null,
  },
  camera_operator: {
    visualPrompt: exampleVisualPrompt,
    references: [{ assetId: 'asset-1' }],
    durationS: 5,
  },
  composer: {
    cue: { description: 'tema malinconico per il finale', mood: 'bittersweet', durationS: 30 },
    genre: exampleGenre,
    tone: exampleTone,
    style: exampleStyle,
  },
  sfx_artist: {
    cue: { description: 'passi sulla ghiaia', durationS: 1 },
    variants: 3,
  },
};

/**
 * Una risposta di esempio per ogni ruolo LLM: la dà il fornitore finto quando non c'è una fixture
 * registrata, così `TROUPE_ENV=offline` e i test funzionano senza rete e senza costi (architettura
 * §4.7, §4.13). Come per gli input, sono esempi scritti a mano e non generati dallo schema (D39),
 * e un test li valida tutti con `ROLE_IO`.
 */
export const ROLE_OUTPUT_EXAMPLES: Record<string, unknown> = {
  moderator: {
    allowed: true,
    reason: 'Il testo non nomina persone reali e non chiede contenuti vietati.',
  },
  casting: {
    suggestions: [
      {
        action: 'new',
        proposalId: 'proposal-1',
        name: 'Tomás',
        tag: 'ally',
        role: 'ally',
        relationToProtagonist: 'il vecchio amico che Anna cerca',
        description: 'Un uomo sui 60 anni che non si aspettava di rivederla',
        appearance: {
          apparentAge: '60',
          build: 'robusta',
          hair: 'barba grigia corta',
          face: 'occhiali tondi, sguardo stanco',
          clothing: 'maglione verde scuro',
          prompt: 'a man in his 60s, short grey beard, round glasses, dark green sweater',
        },
        why: 'serve un contraltare calmo alla protagonista',
      },
    ],
  },
  screenwriter: exampleScreenplay,
  shot_planner: {
    shots: [
      {
        sceneId: exampleScene.id,
        order: 0,
        intent: exampleShotSpec.intent,
        characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara' }],
        location: { locationId: 'piazza' },
        dialogue: [],
        cinematography: 'inherit',
        continuity: { entry: exampleContinuity, exit: exampleContinuity },
      },
    ],
  },
  cinematographer: {
    prompt:
      'close-up of [[char:anna]] in a small town square at sunset, she looks at the camera and smiles faintly, warm practical lights, 35mm, shallow depth of field, locked-off camera',
    negativePrompt: 'text, logos, watermark',
  },
  script_supervisor: { issues: [] },
  sound_planner: {
    cues: [
      {
        kind: 'music',
        sceneId: exampleScene.id,
        durationS: 20,
        mood: 'bittersweet, sparse piano',
        description: 'tema malinconico sotto la camminata di Anna',
      },
      {
        kind: 'sfx',
        sceneId: exampleScene.id,
        shotId: exampleShotSpec.id,
        atS: 1,
        durationS: 2,
        description: 'passi su ciottoli, lontano un cane',
      },
    ],
  },
  moodboard_designer: {
    palette: [
      { hex: '#2b3a55', name: 'Blu sera', use: 'dominante' },
      { hex: '#e0a060', name: 'Ambra', use: 'accento' },
    ],
    notes:
      'Luce calda e bassa, camera vicina ai personaggi, ritmo lento: il paese si guarda, non si attraversa.',
    referencePrompts: [
      'a small town square at sunset, long shadows, warm amber light',
      'a woman walking away in a narrow street at dusk, blue evening tones',
    ],
  },
  image_analyst: {
    description: 'a warm lit town square at dusk, long shadows, two people walking away',
    moodTags: ['warm', 'nostalgic', 'quiet'],
    lighting: 'golden hour, low sun, long shadows',
    composition: 'centered square, leading lines from the pavement',
    containsPeople: true,
    flags: [],
  },
};

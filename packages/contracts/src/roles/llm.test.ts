import { describe, expect, it } from 'vitest';

import {
  castingInputSchema,
  castingOutputSchema,
  cinematographerInputSchema,
  cinematographerOutputSchema,
  imageAnalystInputSchema,
  imageAnalystOutputSchema,
  moderatorInputSchema,
  moderatorOutputSchema,
  moodboardDesignerInputSchema,
  moodboardDesignerOutputSchema,
  proposedShotSchema,
  screenwriterInputSchema,
  screenwriterOutputSchema,
  scriptSupervisorInputSchema,
  scriptSupervisorOutputSchema,
  shotPlannerInputSchema,
  shotPlannerOutputSchema,
  soundPlannerInputSchema,
  soundPlannerOutputSchema,
} from './llm.js';

const style = {
  id: 'realistic',
  label: 'Realistico',
  description: 'Ripresa dal vero',
  hint: 'photorealistic live-action film still',
  enabled: true,
};

const cinematography = {
  id: 'handheld_warm',
  label: 'Camera a mano, luce calda',
  description: 'Vicina ai personaggi',
  camera: 'handheld camera',
  lighting: 'warm practical lights',
  lens: '35mm',
  grade: 'warm tones',
  enabled: true,
};

const movement = {
  id: 'static',
  label: 'Resta fermo',
  description: 'La camera non si muove',
  hint: 'locked-off camera, no camera movement',
  end_frame_hint: 'the camera has not moved',
  enabled: true,
};

const draft = {
  title: 'Il corto di Anna',
  logline: 'Una donna torna nella sua città natale',
  characters: [{ id: 'anna', name: 'Anna', role: 'protagonist' }],
  locations: [],
  scenes: [
    {
      number: 1,
      heading: 'La piazza, tramonto',
      timeOfDay: 'tramonto',
      characterIds: ['anna'],
      summary: 'Anna attraversa la piazza',
      beats: [],
      durationS: 20,
    },
  ],
};

describe('moderator', () => {
  it('accetta un input e un verdetto negativo', () => {
    expect(
      moderatorInputSchema.parse({
        text: 'Scrivi una scena con Mario Rossi',
        context: 'idea',
        language: 'it',
      }).context,
    ).toBe('idea');
    expect(
      moderatorOutputSchema.parse({
        allowed: false,
        reason: 'Nomina una persona reale',
        suggestion: 'Usa un nome inventato',
      }).allowed,
    ).toBe(false);
  });

  it('rifiuta un context inventato', () => {
    expect(
      moderatorInputSchema.safeParse({ text: 'x', context: 'title', language: 'it' }).success,
    ).toBe(false);
  });
});

describe('casting', () => {
  it('accetta una proposta nuova e una di riuso', () => {
    const input = {
      mode: 'initial' as const,
      idea: 'Una donna torna nella sua città natale',
      genre: 'drama',
      tone: 'moving',
      style,
      cast: [],
      count: 2,
      tags: ['protagonist', 'ally'],
      language: 'it',
    };
    expect(castingInputSchema.parse(input).count).toBe(2);

    const output = {
      suggestions: [
        {
          action: 'new' as const,
          name: 'Anna',
          tag: 'protagonist',
          role: 'protagonist',
          relationToProtagonist: 'è lei',
          description: 'Una donna sui 35 anni',
          appearance: {
            apparentAge: '35',
            build: 'media',
            hair: 'riccia rossa',
            face: 'lentiggini',
            clothing: 'giacca di jeans',
            prompt: 'a woman in her mid-30s with curly red hair',
          },
          why: "è la protagonista dell'idea",
        },
      ],
    };
    expect(castingOutputSchema.parse(output).suggestions[0]?.action).toBe('new');
  });
});

describe('screenwriter', () => {
  it('accetta il modo bozza e il modo finale', () => {
    const draftInput = {
      mode: 'draft' as const,
      idea: 'Una donna torna nella sua città natale',
      genre: 'drama',
      tone: 'moving',
      style,
      durationS: 60,
      language: 'it',
      maxCharacters: 2,
      dialogueEnabled: false,
      characters: [],
      locations: [],
      accepted: [],
    };
    expect(screenwriterInputSchema.parse(draftInput).mode).toBe('draft');
    expect(screenwriterOutputSchema.parse(draft).scenes).toHaveLength(1);
  });

  it('rifiuta un modo inventato', () => {
    expect(
      screenwriterInputSchema.safeParse({
        mode: 'outline',
        idea: 'x',
        genre: 'drama',
        tone: 'moving',
        style,
        durationS: 60,
        language: 'it',
        maxCharacters: 2,
        dialogueEnabled: false,
        characters: [],
        locations: [],
        accepted: [],
      }).success,
    ).toBe(false);
  });
});

const continuity = {
  locationId: 'piazza',
  timeOfDay: 'tramonto',
  present: ['anna'],
  costumes: { anna: 'giacca di jeans chiara' },
  props: [],
};

describe('shot_planner', () => {
  it('accetta inquadrature proposte senza id, immagini e references (architettura §5.3)', () => {
    const input = {
      scene: draft.scenes[0],
      bible: { characters: [], locations: [] },
      shotDurationS: { min: 3, max: 8 },
      cameraMovements: [movement],
      language: 'it',
      moodboard: null,
    };
    expect(shotPlannerInputSchema.parse(input).moodboard).toBeNull();

    const shot = {
      sceneId: 'scene-1',
      order: 0,
      intent: {
        action: 'Anna guarda in camera e sorride appena',
        emotion: 'speranzosa',
        framing: 'close_up',
        cameraMovement: 'static',
        lighting: 'luce calda',
        durationS: 5,
      },
      characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara' }],
      location: { locationId: 'piazza' },
      dialogue: [],
      cinematography: 'inherit' as const,
      continuity: { entry: continuity, exit: continuity },
    };
    expect(proposedShotSchema.parse(shot).order).toBe(0);
    expect(shotPlannerOutputSchema.parse({ shots: [shot] }).shots).toHaveLength(1);
  });
});

describe('cinematographer', () => {
  it('accetta un input completo e un prompt visivo in uscita', () => {
    const input = {
      shot: {
        action: 'Anna guarda in camera e sorride appena',
        emotion: 'speranzosa',
        framing: 'close_up',
        cameraMovement: 'static',
        lighting: 'luce calda',
        durationS: 5,
      },
      characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara' }],
      location: {
        id: 'piazza',
        name: 'La piazza',
        description: 'Piazza centrale',
        prompt: 'a small town square at sunset',
        references: [],
      },
      style,
      cinematography: {
        camera: cinematography.camera,
        lighting: cinematography.lighting,
        lens: cinematography.lens,
        grade: cinematography.grade,
      },
      movement,
      target: {
        family: 'seedance',
        kind: 'video' as const,
        maxPromptChars: 900,
        frame: 'clip' as const,
        inputs: ['references'] as const,
      },
    };
    expect(cinematographerInputSchema.parse(input).target.family).toBe('seedance');
    expect(
      cinematographerOutputSchema.parse({ prompt: 'close up, woman smiles, golden hour light' })
        .prompt,
    ).toContain('woman smiles');
  });
});

describe('script_supervisor', () => {
  it("accetta un'incoerenza con motivo in italiano", () => {
    const issue = {
      sceneId: 'scene-2',
      code: 'unreceived_letter',
      severity: 'warning',
      reason: 'Marco parla di una lettera che non ha ancora ricevuto',
    };
    expect(scriptSupervisorOutputSchema.parse({ issues: [issue] }).issues[0]?.reason).toContain(
      'lettera',
    );
    expect(
      scriptSupervisorInputSchema.parse({
        screenplay: draft,
        scenes: draft.scenes,
        shots: [],
        language: 'it',
      }).shots,
    ).toHaveLength(0);
  });
});

describe('sound_planner', () => {
  it('accetta una proposta di musica e una di effetto', () => {
    const input = {
      screenplay: draft,
      scenes: draft.scenes,
      shots: [{ id: 'shot-1', sceneId: 'scene-1' }],
      genre: 'drama',
      tone: 'moving',
      style,
      language: 'it',
    };
    expect(soundPlannerInputSchema.parse(input).shots).toHaveLength(1);

    const cues = [
      {
        kind: 'music' as const,
        sceneId: 'scene-1',
        durationS: 20,
        description: 'tema malinconico',
      },
      {
        kind: 'sfx' as const,
        sceneId: 'scene-1',
        shotId: 'shot-1',
        atS: 2,
        durationS: 1,
        description: 'passi sulla ghiaia',
      },
    ];
    expect(soundPlannerOutputSchema.parse({ cues }).cues).toHaveLength(2);
  });
});

describe('moodboard_designer', () => {
  it('accetta uno scope di scena con il moodboard esistente', () => {
    const input = {
      scope: 'scene' as const,
      idea: 'Una donna torna nella sua città natale',
      genre: 'drama',
      tone: 'moving',
      style,
      cinematography,
      screenplay: draft,
      sceneId: 'scene-1',
      moodboard: { palette: [], notes: '', references: [] },
      referenceCount: 3,
      language: 'it',
    };
    expect(moodboardDesignerInputSchema.parse(input).scope).toBe('scene');

    const output = {
      palette: [{ hex: '#112233' }],
      notes: 'Luce calda',
      referencePrompts: ['a warm lit alley at dusk'],
    };
    expect(moodboardDesignerOutputSchema.parse(output).referencePrompts).toHaveLength(1);
  });
});

describe('image_analyst', () => {
  it("accetta un'immagine con persone, segnata per l'analisi (D38)", () => {
    expect(
      imageAnalystInputSchema.parse({
        image: { assetId: 'asset-1' },
        purpose: 'moodboard',
        language: 'it',
      }).purpose,
    ).toBe('moodboard');

    const output = {
      description: 'a warm lit alley at dusk with two people walking',
      moodTags: ['warm', 'nostalgic'],
      lighting: 'golden hour',
      composition: 'centered, leading lines',
      containsPeople: true,
      flags: [],
    };
    expect(imageAnalystOutputSchema.parse(output).containsPeople).toBe(true);
  });
});

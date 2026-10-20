import { describe, expect, it } from 'vitest';

import {
  exampleBible,
  exampleCharacter,
  exampleCinematography,
  exampleContinuity,
  exampleGenre,
  exampleLocation,
  exampleMovement,
  exampleProject,
  exampleScene,
  exampleScreenplay,
  exampleShotSpec,
  exampleStyle,
  exampleTag,
  exampleTone,
} from '../examples.js';
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

describe('moderator', () => {
  it('accetta un input e un verdetto negativo', () => {
    expect(
      moderatorInputSchema.parse({
        text: 'Scrivi una scena con una persona famosa',
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
  const input = {
    mode: 'initial' as const,
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
  };

  it('dà alle istruzioni genere, tono e tag come oggetti con id e label', () => {
    const parsed = castingInputSchema.parse(input);
    expect(parsed.genre.label).toBe('Drammatico');
    expect(parsed.tone.label).toBe('Commovente');
    expect(parsed.tags[0]?.label).toBe('Protagonista');
  });

  it('pretende le variabili facoltative come null, non assenti (architettura §4.4)', () => {
    expect(castingInputSchema.parse(input).screenplay).toBeNull();
    const withoutScene: Partial<typeof input> = { ...input };
    delete withoutScene.scene;
    expect(castingInputSchema.safeParse(withoutScene).success).toBe(false);
  });

  it('accetta la bozza e la scena quando ci sono', () => {
    const parsed = castingInputSchema.parse({
      ...input,
      mode: 'scene',
      screenplay: exampleScreenplay,
      scene: exampleScene,
    });
    expect(parsed.screenplay?.title).toBe('Il corto di Anna');
    expect(parsed.scene?.summary).toContain('Anna');
  });

  it('accetta una proposta nuova', () => {
    const output = {
      suggestions: [
        {
          action: 'new' as const,
          name: 'Tomás',
          tag: 'ally',
          role: 'ally',
          relationToProtagonist: 'vecchio amico della protagonista',
          description: 'Un uomo sui 60 anni',
          appearance: {
            apparentAge: '60',
            build: 'robusta',
            hair: 'barba grigia corta',
            face: 'occhiali tondi',
            clothing: 'maglione verde scuro',
            prompt: 'a man in his 60s, short grey beard, round glasses',
          },
          why: 'è il volto che Anna cerca',
        },
      ],
    };
    expect(castingOutputSchema.parse(output).suggestions[0]?.action).toBe('new');
  });
});

describe('screenwriter', () => {
  const input = {
    mode: 'draft' as const,
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
  };

  it('accetta il modo bozza, con draft e request a null', () => {
    expect(screenwriterInputSchema.parse(input).draft).toBeNull();
    expect(screenwriterOutputSchema.parse(exampleScreenplay).scenes).toHaveLength(1);
  });

  it('accetta il modo finale con cast, luoghi e elementi accettati', () => {
    const parsed = screenwriterInputSchema.parse({
      ...input,
      mode: 'final',
      characters: [exampleCharacter],
      locations: [exampleLocation],
      draft: exampleScreenplay,
      accepted: [{ kind: 'character', name: "l'oste" }],
    });
    expect(parsed.accepted[0]?.kind).toBe('character');
  });

  it('rifiuta un modo inventato', () => {
    expect(screenwriterInputSchema.safeParse({ ...input, mode: 'outline' }).success).toBe(false);
  });
});

describe('shot_planner', () => {
  it('riceve la Bibbia intera, perché le istruzioni leggono bible.cinematography.label', () => {
    const parsed = shotPlannerInputSchema.parse({
      scene: exampleScene,
      bible: exampleBible,
      shotDurationS: { min: 3, max: 8 },
      previousExit: null,
      cameraMovements: [exampleMovement],
      language: 'it',
      moodboard: null,
    });
    expect(parsed.bible.cinematography.label).toBe('Camera a mano, luce calda');
    expect(parsed.cameraMovements[0]?.endFrameHint).toContain('tighter framing');
    expect(parsed.scene.id).toBe('scene-1');
  });

  it('accetta inquadrature proposte senza id, immagini e references (architettura §5.3)', () => {
    const shot = {
      sceneId: 'scene-1',
      order: 0,
      intent: exampleShotSpec.intent,
      characters: [{ characterId: 'anna', costume: 'giacca di jeans chiara' }],
      location: { locationId: 'piazza' },
      dialogue: [],
      cinematography: 'inherit' as const,
      continuity: { entry: exampleContinuity, exit: exampleContinuity },
    };
    expect(proposedShotSchema.parse(shot).order).toBe(0);
    expect(shotPlannerOutputSchema.parse({ shots: [shot] }).shots).toHaveLength(1);
  });
});

describe('cinematographer', () => {
  const input = {
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
      family: 'seedance',
      kind: 'video' as const,
      maxPromptChars: 900,
      frame: 'clip' as const,
      inputs: ['references'] as const,
    },
  };

  it('espone i percorsi che usano le istruzioni v1', () => {
    const parsed = cinematographerInputSchema.parse(input);
    // Le istruzioni leggono shot.intent.*, c.id, c.name, c.costume, movement.hint,
    // movement.endFrameHint (variante image_generic), cinematography.* e target.*.
    expect(parsed.shot.intent.framing).toBe('close_up');
    expect(parsed.characters[0]?.id).toBe('anna');
    expect(parsed.characters[0]?.name).toBe('Anna');
    expect(parsed.movement.endFrameHint).toContain('tighter framing');
    expect(parsed.cinematography.lens).toContain('35mm');
    expect(parsed.target.maxPromptChars).toBe(900);
  });

  it('rifiuta un personaggio senza nome', () => {
    expect(
      cinematographerInputSchema.safeParse({
        ...input,
        characters: [{ id: 'anna', costume: 'giacca di jeans chiara' }],
      }).success,
    ).toBe(false);
  });

  it('accetta un prompt visivo in uscita', () => {
    expect(
      cinematographerOutputSchema.parse({ prompt: 'close up, woman smiles, golden hour light' })
        .prompt,
    ).toContain('woman smiles');
  });
});

describe('script_supervisor', () => {
  it('riceve scene con id e inquadrature intere, come le cerca il template', () => {
    const parsed = scriptSupervisorInputSchema.parse({
      screenplay: exampleScreenplay,
      scenes: [exampleScene],
      shots: [exampleShotSpec],
      language: 'it',
    });
    // `{% if sh.sceneId == s.id %}` ... `{{ sh.order }}`, `{{ sh.intent.action }}`,
    // `{{ sh.continuity.entry | json }}`
    expect(parsed.shots[0]?.sceneId).toBe(parsed.scenes[0]?.id);
    expect(parsed.shots[0]?.order).toBe(0);
    expect(parsed.shots[0]?.continuity.entry.timeOfDay).toBe('tramonto');
  });

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
  });
});

describe('sound_planner', () => {
  it('riceve genere e tono come oggetti e le inquadrature intere', () => {
    const parsed = soundPlannerInputSchema.parse({
      screenplay: exampleScreenplay,
      scenes: [exampleScene],
      shots: [exampleShotSpec],
      genre: exampleGenre,
      tone: exampleTone,
      style: exampleStyle,
      language: 'it',
    });
    expect(parsed.genre.label).toBe('Drammatico');
    expect(parsed.shots[0]?.intent.durationS).toBe(5);
  });

  it('accetta una proposta di musica e una di effetto', () => {
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
    const parsed = moodboardDesignerInputSchema.parse({
      scope: 'scene',
      idea: exampleProject.idea,
      genre: exampleGenre,
      tone: exampleTone,
      style: exampleStyle,
      cinematography: exampleCinematography,
      screenplay: exampleScreenplay,
      sceneId: 'scene-1',
      moodboard: { palette: [], notes: '', references: [] },
      referenceCount: 3,
      language: 'it',
    });
    expect(parsed.scope).toBe('scene');
    expect(parsed.sceneId).toBe('scene-1');
  });

  it('accetta lo scope del film, con sceneId e moodboard a null', () => {
    const parsed = moodboardDesignerInputSchema.parse({
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
    });
    expect(parsed.moodboard).toBeNull();
  });

  it('restituisce palette, consigli e prompt in inglese', () => {
    const output = {
      palette: [{ hex: '#112233' }],
      notes: 'Luce calda, camera vicina',
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
        context: null,
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

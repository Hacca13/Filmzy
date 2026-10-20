import { z } from 'zod';

import { assetRefSchema } from '../asset.js';
import {
  characterAppearanceSchema,
  characterProfileSchema,
  characterSchema,
  locationSchema,
  storyBibleSchema,
} from '../bible.js';
import {
  characterIdSchema,
  idSchema,
  locationIdSchema,
  sceneIdSchema,
  shotIdSchema,
} from '../ids.js';
import { colorSchema, moodboardPartSchema } from '../moodboard.js';
import {
  cameraMovementSchema,
  characterTagSchema,
  cinematographyPresetSchema,
  genreSchema,
  stylePresetSchema,
  toneSchema,
} from '../presets.js';
import { acceptedElementSchema, sceneSchema, screenplaySchema } from '../screenplay.js';
import {
  continuityStateSchema,
  shotCharacterSchema,
  shotIntentSchema,
  shotSpecSchema,
} from '../shot.js';
import { promptTargetSchema, roleMoodboardFieldSchema, visualPromptSchema } from './shared.js';

/**
 * Gli input dei ruoli sono anche le variabili delle istruzioni (architettura §4.4): quelle
 * facoltative **arrivano sempre, con valore `null`**, mai assenti, così il rendering in modalità
 * rigorosa segnala solo i veri errori e `{% if scene %}` funziona anche senza scena. Per questo i
 * campi facoltativi di primo livello sono `.nullable()` e non `.optional()`. Negli **output**,
 * invece, un campo facoltativo è `.optional()`: lì è il modello che può ometterlo.
 */

/** `moderator`: controllo di un testo dell'utente prima di ogni spesa (architettura §5.3, §10). */
export const moderatorInputSchema = z.object({
  text: z.string().min(1),
  context: z.enum(['idea', 'character', 'scene']),
  language: z.string().min(1),
});

export type ModeratorInput = z.infer<typeof moderatorInputSchema>;

export const moderatorOutputSchema = z.object({
  allowed: z.boolean(),
  category: z.string().min(1).optional(),
  reason: z.string().min(1),
  suggestion: z.string().min(1).optional(),
});

export type ModeratorOutput = z.infer<typeof moderatorOutputSchema>;

/** `casting`: proposte di personaggi dalla bozza o durante le scene (architettura §5.3). */
export const castingInputSchema = z.object({
  mode: z.enum(['initial', 'scene']),
  idea: z.string().min(1),
  genre: genreSchema,
  tone: toneSchema,
  style: stylePresetSchema,
  screenplay: screenplaySchema.nullable(),
  cast: z.array(characterSchema),
  scene: sceneSchema.nullable(),
  count: z.number().int().positive(),
  tags: z.array(characterTagSchema),
  language: z.string().min(1),
});

export type CastingInput = z.infer<typeof castingInputSchema>;

export const castingSuggestionSchema = z.object({
  action: z.enum(['new', 'reuse']),
  characterId: characterIdSchema.optional(),
  proposalId: idSchema.optional(),
  name: z.string().min(1),
  tag: idSchema,
  role: z.string().min(1),
  relationToProtagonist: z.string().min(1),
  description: z.string().min(1),
  profile: characterProfileSchema.optional(),
  appearance: characterAppearanceSchema,
  why: z.string().min(1),
});

export type CastingSuggestion = z.infer<typeof castingSuggestionSchema>;

export const castingOutputSchema = z.object({
  suggestions: z.array(castingSuggestionSchema),
});

export type CastingOutput = z.infer<typeof castingOutputSchema>;

/** `screenwriter`: tre modi, bozza breve, revisione e stesura ufficiale (architettura §5.3). */
export const screenwriterInputSchema = z.object({
  mode: z.enum(['draft', 'revise', 'final']),
  idea: z.string().min(1),
  genre: genreSchema,
  tone: toneSchema,
  style: stylePresetSchema,
  durationS: z.number().positive(),
  language: z.string().min(1),
  maxCharacters: z.number().int().positive(),
  dialogueEnabled: z.boolean(),
  characters: z.array(characterSchema),
  locations: z.array(locationSchema),
  draft: screenplaySchema.nullable(),
  request: z.string().min(1).nullable(),
  accepted: z.array(acceptedElementSchema),
});

export type ScreenwriterInput = z.infer<typeof screenwriterInputSchema>;

export const screenwriterOutputSchema = screenplaySchema;

export type ScreenwriterOutput = z.infer<typeof screenwriterOutputSchema>;

/** `shot_planner`: scena e Bibbia verso le inquadrature (architettura §5.3). */
export const shotPlannerInputSchema = z.object({
  scene: sceneSchema,
  bible: storyBibleSchema,
  shotDurationS: z.object({ min: z.number().positive(), max: z.number().positive() }),
  previousExit: continuityStateSchema.nullable(),
  cameraMovements: z.array(cameraMovementSchema),
  language: z.string().min(1),
  moodboard: roleMoodboardFieldSchema,
});

export type ShotPlannerInput = z.infer<typeof shotPlannerInputSchema>;

/**
 * Un'inquadratura proposta: ShotSpec senza `id`, senza `images` e senza i `references` dei
 * personaggi e del luogo, che aggiunge il codice (architettura §5.3).
 */
export const proposedShotSchema = z.object({
  sceneId: sceneIdSchema,
  order: z.number().int().nonnegative(),
  intent: shotIntentSchema,
  characters: z.array(shotCharacterSchema.omit({ references: true })),
  location: z.object({ locationId: locationIdSchema }),
  dialogue: z.array(
    z.object({
      characterId: characterIdSchema,
      text: z.string().min(1),
      voiceId: z.string().min(1).optional(),
      language: z.string().min(1),
    }),
  ),
  cinematography: z.literal('inherit'),
  continuity: z.object({ entry: continuityStateSchema, exit: continuityStateSchema }),
});

export type ProposedShot = z.infer<typeof proposedShotSchema>;

export const shotPlannerOutputSchema = z.object({
  shots: z.array(proposedShotSchema),
  notes: z.string().min(1).optional(),
});

export type ShotPlannerOutput = z.infer<typeof shotPlannerOutputSchema>;

/**
 * Il personaggio come lo vede il direttore della fotografia: `id` serve al segnaposto
 * `[[char:id]]`, `name` e `costume` al prompt. Non riceve i riferimenti visivi: quelli li
 * aggiunge il traduttore (architettura §4.7).
 */
export const promptCharacterSchema = z.object({
  id: characterIdSchema,
  name: z.string().min(1),
  costume: z.string().min(1),
});

export type PromptCharacter = z.infer<typeof promptCharacterSchema>;

/** `cinematographer`: inquadratura verso il prompt visivo per la famiglia di destinazione. */
export const cinematographerInputSchema = z.object({
  shot: shotSpecSchema,
  characters: z.array(promptCharacterSchema),
  location: locationSchema,
  style: stylePresetSchema,
  cinematography: cinematographyPresetSchema.pick({
    camera: true,
    lighting: true,
    lens: true,
    grade: true,
  }),
  movement: cameraMovementSchema,
  target: promptTargetSchema,
});

export type CinematographerInput = z.infer<typeof cinematographerInputSchema>;

export const cinematographerOutputSchema = visualPromptSchema.extend({
  notes: z.string().min(1).optional(),
});

export type CinematographerOutput = z.infer<typeof cinematographerOutputSchema>;

/** `script_supervisor`: incoerenze di trama tra le scene (architettura §5.3, §8). */
export const scriptSupervisorInputSchema = z.object({
  screenplay: screenplaySchema,
  scenes: z.array(sceneSchema),
  shots: z.array(shotSpecSchema),
  language: z.string().min(1),
});

export type ScriptSupervisorInput = z.infer<typeof scriptSupervisorInputSchema>;

export const scriptSupervisorIssueSchema = z.object({
  sceneId: sceneIdSchema.optional(),
  shotId: shotIdSchema.optional(),
  code: z.string().min(1),
  severity: z.string().min(1),
  reason: z.string().min(1),
});

export type ScriptSupervisorIssue = z.infer<typeof scriptSupervisorIssueSchema>;

export const scriptSupervisorOutputSchema = z.object({
  issues: z.array(scriptSupervisorIssueSchema),
});

export type ScriptSupervisorOutput = z.infer<typeof scriptSupervisorOutputSchema>;

/** `sound_planner`: proposte di musica ed effetti dal copione (architettura §5.3). */
export const soundPlannerInputSchema = z.object({
  screenplay: screenplaySchema,
  scenes: z.array(sceneSchema),
  shots: z.array(shotSpecSchema),
  genre: genreSchema,
  tone: toneSchema,
  style: stylePresetSchema,
  language: z.string().min(1),
});

export type SoundPlannerInput = z.infer<typeof soundPlannerInputSchema>;

export const soundCueSchema = z.object({
  kind: z.enum(['music', 'sfx']),
  sceneId: sceneIdSchema,
  shotId: shotIdSchema.optional(),
  atS: z.number().nonnegative().optional(),
  durationS: z.number().positive(),
  mood: z.string().min(1).optional(),
  description: z.string().min(1),
});

export type SoundCue = z.infer<typeof soundCueSchema>;

export const soundPlannerOutputSchema = z.object({
  cues: z.array(soundCueSchema),
});

export type SoundPlannerOutput = z.infer<typeof soundPlannerOutputSchema>;

/** `moodboard_designer`: palette, consigli e prompt delle immagini di riferimento (D37). */
export const moodboardDesignerInputSchema = z.object({
  scope: z.enum(['film', 'scene']),
  idea: z.string().min(1),
  genre: genreSchema,
  tone: toneSchema,
  style: stylePresetSchema,
  cinematography: cinematographyPresetSchema,
  screenplay: screenplaySchema,
  sceneId: sceneIdSchema.nullable(),
  moodboard: moodboardPartSchema.nullable(),
  referenceCount: z.number().int().positive(),
  language: z.string().min(1),
});

export type MoodboardDesignerInput = z.infer<typeof moodboardDesignerInputSchema>;

export const moodboardDesignerOutputSchema = z.object({
  palette: z.array(colorSchema),
  notes: z.string(),
  referencePrompts: z.array(z.string().min(1)),
});

export type MoodboardDesignerOutput = z.infer<typeof moodboardDesignerOutputSchema>;

/** `image_analyst`: descrizione, atmosfera e controllo di persone e marchi (D19, D38). */
export const imageAnalystInputSchema = z.object({
  image: assetRefSchema,
  purpose: z.literal('moodboard'),
  context: z.string().min(1).nullable(),
  language: z.string().min(1),
});

export type ImageAnalystInput = z.infer<typeof imageAnalystInputSchema>;

export const imageAnalystOutputSchema = z.object({
  description: z.string().min(1),
  moodTags: z.array(z.string().min(1)),
  lighting: z.string().min(1),
  composition: z.string().min(1),
  containsPeople: z.boolean(),
  flags: z.array(z.string().min(1)),
  suggestions: z.string().min(1).optional(),
});

export type ImageAnalystOutput = z.infer<typeof imageAnalystOutputSchema>;

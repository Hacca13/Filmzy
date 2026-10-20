import { z } from 'zod';

import type { ModelKind } from './model-kind.js';
import {
  cameraOperatorInputSchema,
  characterDesignerInputSchema,
  moodboardArtistInputSchema,
  retoucherInputSchema,
  setDesignerInputSchema,
  storyboardArtistInputSchema,
} from './roles/media.js';
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
  screenwriterInputSchema,
  screenwriterOutputSchema,
  scriptSupervisorInputSchema,
  scriptSupervisorOutputSchema,
  shotPlannerInputSchema,
  shotPlannerOutputSchema,
  soundPlannerInputSchema,
  soundPlannerOutputSchema,
} from './roles/llm.js';
import { composerInputSchema, sfxArtistInputSchema } from './roles/audio.js';

export * from './roles/llm.js';
export * from './roles/media.js';
export * from './roles/audio.js';
export * from './roles/shared.js';

/**
 * Ruoli della troupe nell'MVP (CLAUDE.md «Ruoli della troupe»): `voice_actor`, `lip_sync` e
 * `dialogue_adapter` sono di Fase 2/3 e non hanno ancora schemi.
 */
export const ROLE_IDS = [
  'moderator',
  'casting',
  'screenwriter',
  'shot_planner',
  'cinematographer',
  'character_designer',
  'set_designer',
  'moodboard_designer',
  'moodboard_artist',
  'image_analyst',
  'retoucher',
  'storyboard_artist',
  'camera_operator',
  'script_supervisor',
  'composer',
  'sfx_artist',
  'sound_planner',
] as const;

export const roleIdSchema = z.enum(ROLE_IDS);

export type RoleId = z.infer<typeof roleIdSchema>;

/**
 * Registro di ciò che il codice sa di ogni ruolo (architettura §4.2): tipo del servizio che lo
 * serve e schemi di input e, solo per i ruoli LLM, di output. I ruoli immagine, video e audio
 * restituiscono un file, non JSON: il loro risultato è un `Take` o un asset (§5.2), non un output
 * del ruolo. Serve a `troupe.run` per validare per id (T1.1) e al validatore della configurazione
 * per generare un input di esempio (§4.6 punto 4).
 */
export const ROLE_IO = {
  moderator: { kind: 'llm', input: moderatorInputSchema, output: moderatorOutputSchema },
  casting: { kind: 'llm', input: castingInputSchema, output: castingOutputSchema },
  screenwriter: { kind: 'llm', input: screenwriterInputSchema, output: screenwriterOutputSchema },
  shot_planner: { kind: 'llm', input: shotPlannerInputSchema, output: shotPlannerOutputSchema },
  cinematographer: {
    kind: 'llm',
    input: cinematographerInputSchema,
    output: cinematographerOutputSchema,
  },
  character_designer: { kind: 'image', input: characterDesignerInputSchema },
  set_designer: { kind: 'image', input: setDesignerInputSchema },
  moodboard_designer: {
    kind: 'llm',
    input: moodboardDesignerInputSchema,
    output: moodboardDesignerOutputSchema,
  },
  moodboard_artist: { kind: 'image', input: moodboardArtistInputSchema },
  image_analyst: { kind: 'llm', input: imageAnalystInputSchema, output: imageAnalystOutputSchema },
  retoucher: { kind: 'image', input: retoucherInputSchema },
  storyboard_artist: { kind: 'image', input: storyboardArtistInputSchema },
  camera_operator: { kind: 'video', input: cameraOperatorInputSchema },
  script_supervisor: {
    kind: 'llm',
    input: scriptSupervisorInputSchema,
    output: scriptSupervisorOutputSchema,
  },
  composer: { kind: 'music', input: composerInputSchema },
  sfx_artist: { kind: 'sfx', input: sfxArtistInputSchema },
  sound_planner: { kind: 'llm', input: soundPlannerInputSchema, output: soundPlannerOutputSchema },
} satisfies Record<RoleId, { kind: ModelKind; input: z.ZodType; output?: z.ZodType }>;

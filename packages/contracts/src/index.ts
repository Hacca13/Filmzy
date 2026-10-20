export { apiErrorSchema } from './api-error.js';
export type { ApiErrorBody } from './api-error.js';
export { healthResponseSchema } from './health.js';
export type { HealthResponse } from './health.js';
export {
  API_PREFIX,
  DEFAULT_API_PORT,
  LOCAL_API_HOST,
  portSchema,
  readApiPort,
} from './local-server.js';
export { SHOT_SPEC_SCHEMA_VERSION } from './versions.js';

export {
  assetIdSchema,
  characterIdSchema,
  configKeySchema,
  connectionIdSchema,
  generationIdSchema,
  idSchema,
  locationIdSchema,
  modelIdSchema,
  projectIdSchema,
  sceneIdSchema,
  shotIdSchema,
  takeIdSchema,
} from './ids.js';
export {
  DOMAIN_ERROR_CODES,
  domainErrorCodeSchema,
  domainErrorDetailsSchema,
  domainErrorSchema,
} from './errors.js';
export type { DomainErrorBody, DomainErrorCode } from './errors.js';
export {
  MODEL_GROUPS,
  MODEL_KINDS,
  modelGroupForKind,
  modelGroupSchema,
  modelKindSchema,
} from './model-kind.js';
export type { ModelGroup, ModelKind } from './model-kind.js';

export * from './config/index.js';
export { PROJECT_PHASES, projectPhaseSchema, projectSummarySchema } from './project.js';
export type { ProjectPhase, ProjectSummary } from './project.js';
export {
  colorSchema,
  moodReferenceSchema,
  moodboardBriefSchema,
  moodboardPartSchema,
  moodboardSchema,
} from './moodboard.js';
export type {
  Color,
  Moodboard,
  MoodboardBrief,
  MoodboardPart,
  MoodReference,
} from './moodboard.js';
export { assetRefSchema } from './asset.js';
export type { AssetRef } from './asset.js';
export {
  cameraMovementSchema,
  characterTagSchema,
  cinematographyPresetSchema,
  genreSchema,
  stylePresetSchema,
  toneSchema,
} from './presets.js';
export type {
  CameraMovement,
  CharacterTag,
  CinematographyPreset,
  Genre,
  StylePreset,
  Tone,
} from './presets.js';
export {
  bibleLimitsSchema,
  characterAppearanceSchema,
  characterProfileSchema,
  characterSchema,
  locationSchema,
  storyBibleSchema,
} from './bible.js';
export type {
  BibleLimits,
  Character,
  CharacterAppearance,
  CharacterProfile,
  Location,
  StoryBible,
} from './bible.js';
export {
  cinematographyOverrideSchema,
  continuityStateSchema,
  shotCharacterSchema,
  shotImageSchema,
  shotIntentSchema,
  shotSpecSchema,
  takeSchema,
} from './shot.js';
export type {
  CinematographyOverride,
  ContinuityState,
  ShotCharacter,
  ShotImage,
  ShotIntent,
  ShotSpec,
  Take,
} from './shot.js';
export {
  acceptedElementSchema,
  sceneSchema,
  screenplayCharacterProposalSchema,
  screenplayLocationProposalSchema,
  screenplaySceneSchema,
  screenplaySchema,
} from './screenplay.js';
export type {
  AcceptedElement,
  Scene,
  Screenplay,
  ScreenplayCharacterProposal,
  ScreenplayLocationProposal,
  ScreenplayScene,
} from './screenplay.js';
export { ROLE_IDS, ROLE_IO, roleIdSchema } from './roles.js';
export type { RoleId } from './roles.js';
export * from './roles/llm.js';
export * from './roles/media.js';
export * from './roles/audio.js';
export * from './roles/shared.js';

export {
  GENERATION_PURPOSES,
  generationContextSchema,
  generationPurposeSchema,
  modelOptionSchema,
} from './generation.js';
export type { GenerationContext, GenerationPurpose, ModelOption } from './generation.js';
export {
  GENERATION_STATUSES,
  generationReceiptSchema,
  generationStatusSchema,
  generationUsageSchema,
  receiptInstructionsRefSchema,
} from './receipt.js';
export type {
  GenerationReceipt,
  GenerationStatus,
  GenerationUsage,
  ReceiptInstructionsRef,
} from './receipt.js';
export { estimateSchema, spendCapSchema } from './spend.js';
export type { Estimate, SpendCap } from './spend.js';
export { instructionsRefSchema, roleSettingsSchema, userSettingsSchema } from './settings.js';
export type { InstructionsRef, RoleSettings, UserSettings } from './settings.js';
export { domainEventSchema } from './events.js';
export type { DomainEvent } from './events.js';

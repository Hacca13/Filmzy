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

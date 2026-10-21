export { ADAPTER_NAMES, llmAdapterFor, mediaAdapterFor } from './adapters/index.js';
export { FakeProvider, fakeAdapterFactory } from './adapters/fake.js';
export type { FakeCall, FakeProviderOptions } from './adapters/fake.js';
export type {
  AdapterFactory,
  AdapterOptions,
  LlmAdapter,
  LlmRequest,
  LlmResponse,
  LlmUsage,
  MediaAdapter,
  MediaFile,
  MediaInput,
  MediaRequest,
  MediaStatus,
  MediaUsage,
} from './adapters/types.js';
export {
  applyEnvironmentOverlay,
  CONFIG_ENVIRONMENTS,
  configEnvironmentFromEnv,
  loadEnvironmentOverlay,
} from './config/environments.js';
export type { ConfigEnvironment } from './config/environments.js';
export { codeForbiddenTerms } from './config/forbidden-terms.js';
export type { ForbiddenTerm } from './config/forbidden-terms.js';
export { canonicalJson, configHash, hashRoleConfig } from './config/hash.js';
export { validateInstructions } from './config/instructions.js';
export type { ValidateInstructionsOptions } from './config/instructions.js';
export { checkSections, parseInstructionFile, SECTIONS_BY_KIND } from './instructions/parse.js';
export type { InstructionFile } from './instructions/parse.js';
export { InstructionParseError } from './instructions/parse.js';
export { renderSection, renderSections, InstructionRenderError } from './instructions/render.js';
export {
  FileInstructionsSource,
  InstructionResolveError,
  resolveInstructions,
} from './instructions/resolve.js';
export type {
  InstructionsSource,
  ResolveInstructionsOptions,
  ResolvedInstructions,
} from './instructions/resolve.js';
export { hasErrors, messageOf } from './config/issues.js';
export type { ConfigIssue } from './config/issues.js';
export { loadBenchPlan, loadConfigFiles, parseConfigFile } from './config/load-files.js';
export type { LoadFilesResult, TroupeConfig, TroupePresets } from './config/load-files.js';
export { parseSecretRef, readSecret, secretPresence } from './config/secrets.js';
export type {
  ParsedSecretRef,
  SecretPresence,
  SecretSources,
  SecretStore,
} from './config/secrets.js';
export { FileConfigSource } from './config/source.js';
export type { ConfigSource, LoadedConfig } from './config/source.js';
export { validateConfig } from './config/validate.js';
export type { ValidateOptions } from './config/validate.js';
export { ProviderError } from './provider-error.js';
export type { ProviderErrorDetails } from './provider-error.js';

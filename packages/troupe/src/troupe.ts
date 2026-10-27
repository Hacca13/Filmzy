import { randomUUID } from 'node:crypto';

import {
  ROLE_IO,
  type GenerationContext,
  type Estimate,
  type GenerationReceipt,
  type ModelOption,
  type RoleId,
} from '@filmzy/contracts';
import type { z } from 'zod';

import { llmAdapterFor } from './adapters/index.js';
import type { LlmRequest, LlmResponse } from './adapters/types.js';
import type { ConfigSource } from './config/source.js';
import type { SecretSources } from './config/secrets.js';
import { configHash, hashRoleConfig } from './config/hash.js';
import { llmCostUsd } from './cost.js';
import { InstructionRenderError } from './instructions/render.js';
import { renderSections } from './instructions/render.js';
import {
  InstructionResolveError,
  resolveInstructions,
  type InstructionsSource,
} from './instructions/resolve.js';
import { ProviderError } from './provider-error.js';
import { resolveRole, type ResolvedRole } from './resolve-role.js';
import { routeOptions } from './router.js';
import type { TranslateInput } from './translators/types.js';
import type { ReceiptSink } from './receipts.js';

/** I ruoli che `run` serve: quelli di testo, i soli con uno schema di risposta (architettura §4.2). */
export type LlmRoleId = {
  [Role in RoleId]: (typeof ROLE_IO)[Role] extends { output: z.ZodType } ? Role : never;
}[RoleId];

type RoleInput<Role extends LlmRoleId> = z.input<(typeof ROLE_IO)[Role]['input']>;

type RoleOutput<Role extends LlmRoleId> = (typeof ROLE_IO)[Role] extends { output: infer Schema }
  ? Schema extends z.ZodType
    ? z.output<Schema>
    : never
  : never;

export interface RunResult<Role extends LlmRoleId> {
  data: RoleOutput<Role>;
  /** Lo scontrino chiuso: quanto è costato, con quale servizio e con quali istruzioni (§4.11). */
  receipt: GenerationReceipt;
}

export interface TroupeOptions {
  configSource: ConfigSource;
  instructions: InstructionsSource;
  receiptSink?: ReceiptSink;
  secrets?: SecretSources;
  /** Iniettabili per i test: così le attese non rallentano e le date non cambiano. */
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
}

export interface Troupe {
  run<Role extends LlmRoleId>(
    role: Role,
    input: RoleInput<Role>,
    ctx: GenerationContext,
  ): Promise<RunResult<Role>>;

  /**
   * Quanto costerebbe `run` con questo input, prima di lanciarlo (architettura §4.1, D30): il
   * servizio che lavorerebbe e una stima **prudente**. Non chiama nessun fornitore.
   */
  estimate<Role extends LlmRoleId>(role: Role, input: RoleInput<Role>): Promise<Estimate>;

  /**
   * I servizi tra cui l'utente può scegliere per questa richiesta (architettura §4.1, §4.8, D36):
   * nome, costo stimato e voto delle prove. È quello che alimenta «Cambia servizio».
   *
   * Prende i dati della richiesta già pronti (durata, immagini, personaggi): il passaggio
   * dall'input del ruolo a questi dati, che deve leggere i file dalla cartella del progetto,
   * arriva con `submit` (T4.3). Non serve il `ctx`: l'elenco non dipende da chi chiede né dal
   * servizio già scelto, che chi chiama conosce di suo.
   */
  options(role: string, request: Omit<TranslateInput, 'modelId'>): Promise<ModelOption[]>;
}

/** Quanto si aspetta prima di riprovare: poco, e crescendo (architettura §4.10). */
const RETRY_WAIT_MS = [500, 2000, 5000];

/** Gli errori che vale la pena riprovare sullo **stesso** servizio: nessuna riserva (D36). */
const RETRYABLE_CODES = new Set(['provider_unavailable', 'timeout', 'rate_limited']);

export function createTroupe(options: TroupeOptions): Troupe {
  const now = options.now ?? (() => new Date());
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  return {
    async run(role, input, ctx) {
      const started = now();
      const { inputSchema, outputSchema } = textRole(role);

      // La scelta del servizio per singola generazione non riguarda i ruoli di testo (§4.1).
      if (ctx.modelId !== undefined) {
        throw new ProviderError(
          'invalid_request',
          false,
          `Il ruolo "${role}" è un ruolo di testo: non si scegli un servizio per singola generazione.`,
          { role, modelId: ctx.modelId },
        );
      }

      const { parsedInput, releaseId, config, resolved, instructions, prompt } = await prepareRun(
        options,
        role,
        inputSchema,
        input,
      );

      const receipt = newReceipt({
        role,
        ctx,
        resolved,
        instructions,
        releaseId,
        roleConfigHash: hashRoleConfig(config, role) ?? '',
        inputHash: configHash(parsedInput),
        estimatedCostUsd: estimateLlmCostUsd(resolved, prompt),
        createdAt: started.toISOString(),
      });
      await write(options.receiptSink, receipt);

      const adapter = llmAdapterFor({
        connectionId: resolved.connectionId,
        connection: resolved.connection,
        secrets: options.secrets,
      });

      const running = { ...receipt, status: 'running' as const };
      await write(options.receiptSink, running);

      const attempt = await callWithRetries({
        adapter: (request) => adapter.generate(request),
        request: {
          role,
          modelId: resolved.modelId,
          providerModel: resolved.model.provider_model,
          system: prompt.system,
          user: prompt.user,
          params: resolved.params,
          outputSchema,
        },
        retries: resolved.retries,
        outputSchema,
        sleep,
      });

      const closed: GenerationReceipt = {
        ...running,
        attempts: attempt.attempts,
        usage: attempt.response?.usage,
        actualCostUsd:
          attempt.response === undefined
            ? undefined
            : llmCostUsd(resolved.model.pricing, attempt.response.usage),
        durationMs: now().getTime() - started.getTime(),
        status: attempt.error === undefined ? 'succeeded' : 'failed',
        errorCode: attempt.error?.code,
      };
      await write(options.receiptSink, closed);

      if (attempt.error !== undefined) throw attempt.error;
      return { data: attempt.data as RoleOutput<typeof role>, receipt: closed };
    },

    async estimate(role, input) {
      const { inputSchema } = textRole(role);
      const { resolved, prompt } = await prepareRun(options, role, inputSchema, input);
      return {
        modelId: resolved.modelId,
        modelLabel: resolved.model.label,
        estimatedCostUsd: estimateLlmCostUsd(resolved, prompt),
      };
    },

    async options(role, request) {
      const loaded = await options.configSource.load();
      if (loaded.config === undefined) {
        throw new ProviderError(
          'config_invalid',
          false,
          `La configurazione non si è caricata: ${loaded.issues.map((issue) => issue.message).join(' ')}`,
          { role },
        );
      }

      return routeOptions({
        roleId: role,
        config: loaded.config,
        ...(loaded.settings === undefined ? {} : { settings: loaded.settings }),
        request,
      });
    },
  };
}

/** Un ruolo di testo ha uno schema di risposta; gli altri passano da `submit` (architettura §4.2). */
function textRole(role: string): { inputSchema: z.ZodType; outputSchema: z.ZodType } {
  const io = ROLE_IO[role as RoleId];
  if (!('output' in io)) {
    throw new ProviderError(
      'invalid_request',
      false,
      `Il ruolo "${role}" non è un ruolo di testo: usa "submit".`,
      { role },
    );
  }
  return { inputSchema: io.input, outputSchema: io.output };
}

interface PreparedRun {
  /** L'input già controllato dallo schema del ruolo. */
  parsedInput: unknown;
  releaseId: string;
  config: NonNullable<Awaited<ReturnType<ConfigSource['load']>>['config']>;
  resolved: ResolvedRole;
  instructions: Awaited<ReturnType<typeof resolveInstructionsFor>>;
  prompt: { system?: string; user: string };
}

/**
 * Tutto quello che serve prima di chiamare un fornitore: input valido, configurazione, ruolo e
 * servizio risolti, istruzioni rese. Lo usano `run` e `estimate`, così la stima parte dallo stesso
 * testo che poi verrebbe inviato.
 */
async function prepareRun(
  options: TroupeOptions,
  role: string,
  inputSchema: z.ZodType,
  input: unknown,
): Promise<PreparedRun> {
  const parsedInput = inputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new ProviderError(
      'invalid_request',
      false,
      `L'input del ruolo "${role}" non è valido: ${parsedInput.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('; ')}.`,
      { role, field: parsedInput.error.issues[0]?.path.join('.') },
    );
  }

  const loaded = await options.configSource.load();
  if (loaded.config === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `La configurazione non si è caricata: ${loaded.issues.map((issue) => issue.message).join(' ')}`,
      { role },
    );
  }

  const resolved = resolveRole(loaded.config, role, loaded.settings);
  const instructions = await resolveInstructionsFor(options.instructions, resolved);
  const prompt = await renderPrompt(instructions.sections, parsedInput.data, resolved);

  return {
    parsedInput: parsedInput.data,
    releaseId: loaded.releaseId,
    config: loaded.config,
    resolved,
    instructions,
    prompt,
  };
}

/** Circa quattro caratteri per token: per una stima basta, e sbaglia per eccesso nelle lingue lunghe. */
const CHARS_PER_TOKEN = 4;

/** Se il ruolo non dice quanto può scrivere al massimo, si stima un'uscita media-lunga. */
const DEFAULT_MAX_OUTPUT_TOKENS = 2000;

/**
 * Una stima **prudente** del costo di una chiamata di testo (D30): ingresso dal testo che verrebbe
 * inviato, uscita pari al massimo che il ruolo concede. Lo scontrino dirà il costo vero.
 */
function estimateLlmCostUsd(resolved: ResolvedRole, prompt: { system?: string; user: string }) {
  const maxTokens = resolved.params.max_tokens;
  return (
    llmCostUsd(resolved.model.pricing, {
      inputTokens: Math.ceil(((prompt.system?.length ?? 0) + prompt.user.length) / CHARS_PER_TOKEN),
      outputTokens: typeof maxTokens === 'number' ? maxTokens : DEFAULT_MAX_OUTPUT_TOKENS,
    }) ?? 0
  );
}

async function resolveInstructionsFor(source: InstructionsSource, resolved: ResolvedRole) {
  try {
    return await resolveInstructions(source, {
      fallbackId: resolved.roleId,
      releaseRef: resolved.releaseInstructions,
      userRef: resolved.userInstructions,
      family: resolved.model.family,
    });
  } catch (error) {
    if (error instanceof InstructionResolveError) {
      throw new ProviderError(
        'config_invalid',
        false,
        `Istruzioni del ruolo "${resolved.roleId}": ${error.message}.`,
        {
          role: resolved.roleId,
          field: error.details.field,
        },
      );
    }
    throw error;
  }
}

async function renderPrompt(
  sections: Record<string, string>,
  input: unknown,
  resolved: ResolvedRole,
): Promise<{ system?: string; user: string }> {
  let rendered: Record<string, string>;
  try {
    rendered = await renderSections(sections, input);
  } catch (error) {
    if (error instanceof InstructionRenderError) {
      throw new ProviderError(
        'config_invalid',
        false,
        `Istruzioni del ruolo "${resolved.roleId}": ${error.message}.`,
        { role: resolved.roleId },
      );
    }
    throw error;
  }

  const user = rendered.user ?? rendered.prompt;
  if (user === undefined || user === '') {
    throw new ProviderError(
      'config_invalid',
      false,
      `Le istruzioni del ruolo "${resolved.roleId}" non producono nessun testo da inviare.`,
      { role: resolved.roleId },
    );
  }

  return { system: rendered.system, user };
}

interface CallWithRetriesInput {
  adapter: (request: LlmRequest) => Promise<LlmResponse>;
  request: LlmRequest;
  retries: { invalid_output: number; technical_error: number };
  outputSchema: z.ZodType;
  sleep: (ms: number) => Promise<void>;
}

interface AttemptResult {
  data?: unknown;
  response?: LlmResponse;
  error?: ProviderError;
  attempts: number;
}

/**
 * I tentativi di architettura §4.10: pochi, solo sullo **stesso** servizio e solo per i guai
 * passeggeri. Una risposta fuori schema si **ripara** rimandando al modello l'errore di
 * validazione (§4.9). Un rifiuto del contenuto, una chiave sbagliata o una quota finita non si
 * riprovano e non si aggirano con un altro servizio (D36).
 */
async function callWithRetries(input: CallWithRetriesInput): Promise<AttemptResult> {
  const { adapter, retries, outputSchema, sleep } = input;
  let request = input.request;
  let technicalLeft = retries.technical_error;
  let repairsLeft = retries.invalid_output;
  let attempts = 0;

  for (;;) {
    attempts += 1;
    try {
      const response = await adapter(request);
      const parsed = outputSchema.safeParse(response.data);
      if (parsed.success) return { data: parsed.data, response, attempts };

      const reason = parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('; ');
      if (repairsLeft <= 0) {
        return {
          response,
          attempts,
          error: new ProviderError(
            'invalid_output',
            false,
            `La risposta non rispetta lo schema: ${reason}.`,
            {
              role: request.role,
              modelId: request.modelId,
            },
          ),
        };
      }

      repairsLeft -= 1;
      request = repaired(request, reason);
      continue;
    } catch (error) {
      if (!(error instanceof ProviderError)) throw error;

      // Una risposta fuori schema si ripara anche quando l'ha vista l'adapter (§4.9).
      if (error.code === 'invalid_output' && repairsLeft > 0) {
        repairsLeft -= 1;
        request = repaired(request, error.message);
        continue;
      }

      if (!RETRYABLE_CODES.has(error.code) || technicalLeft <= 0) {
        return { attempts, error };
      }

      technicalLeft -= 1;
      const waited = RETRY_WAIT_MS[Math.min(attempts - 1, RETRY_WAIT_MS.length - 1)] ?? 0;
      await sleep(
        error.details.retryAfterS === undefined ? waited : error.details.retryAfterS * 1000,
      );
    }
  }
}

/** La richiesta da rimandare, con l'errore di validazione in coda: è la riparazione di §4.9. */
function repaired(request: LlmRequest, reason: string): LlmRequest {
  return {
    ...request,
    user: `${request.user}\n\nLa risposta precedente non era valida: ${reason}. Rispondi di nuovo, rispettando lo schema richiesto.`,
  };
}

interface NewReceiptInput {
  role: string;
  ctx: GenerationContext;
  resolved: ResolvedRole;
  instructions: { id: string; version: number; variant?: string };
  releaseId: string;
  roleConfigHash: string;
  inputHash: string;
  estimatedCostUsd: number;
  createdAt: string;
}

function newReceipt(input: NewReceiptInput): GenerationReceipt {
  const { role, ctx, resolved, instructions } = input;
  return {
    id: randomUUID(),
    role: role as RoleId,
    purpose: ctx.purpose,
    projectId: ctx.projectId,
    shotId: ctx.shotId,
    releaseId: input.releaseId,
    roleConfigHash: input.roleConfigHash,
    modelId: resolved.modelId,
    modelLabel: resolved.model.label,
    connectionId: resolved.connectionId,
    providerModel: resolved.model.provider_model,
    instructions: {
      id: instructions.id,
      version: instructions.version,
      variant: instructions.variant,
    },
    params: resolved.params,
    inputHash: input.inputHash,
    idempotencyKey: configHash({
      role,
      modelId: resolved.modelId,
      inputHash: input.inputHash,
      projectId: ctx.projectId,
      shotId: ctx.shotId,
    }),
    status: 'queued',
    attempts: 0,
    estimatedCostUsd: input.estimatedCostUsd,
    createdAt: input.createdAt,
  };
}

async function write(sink: ReceiptSink | undefined, receipt: GenerationReceipt): Promise<void> {
  await sink?.write(receipt);
}

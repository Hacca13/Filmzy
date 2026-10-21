import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { domainErrorCodeSchema, ROLE_OUTPUT_EXAMPLES } from '@filmzy/contracts';
import { z } from 'zod';

import { ProviderError } from '../provider-error.js';
import type {
  AdapterFactory,
  AdapterOptions,
  LlmAdapter,
  LlmRequest,
  LlmResponse,
  MediaAdapter,
  MediaFile,
  MediaRequest,
  MediaStatus,
  MediaUsage,
} from './types.js';

/**
 * Il fornitore finto (architettura §4.7, §4.13): zero rete, zero costi. Risponde con una fixture
 * registrata, se c'è, altrimenti con la risposta di esempio del ruolo (D39). È il fornitore
 * predefinito nei test e in `TROUPE_ENV=offline`, quindi non è solo roba da test: è anche il modo
 * in cui si prova il programma senza spendere.
 */

const fixtureErrorSchema = z.strictObject({
  code: domainErrorCodeSchema,
  retryable: z.boolean().default(false),
  message: z.string().min(1).default('errore finto'),
});

const fixtureFileSchema = z.strictObject({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  /** Il contenuto del file. Senza, il finto fornitore mette un segnaposto del tipo giusto. */
  base64: z.string().optional(),
});

const fixtureSchema = z.strictObject({
  /** Quante volte il polling risponde "in lavorazione" prima di consegnare (media). */
  polls: z.number().int().nonnegative().default(1),
  data: z.unknown().optional(),
  files: z.array(fixtureFileSchema).optional(),
  error: fixtureErrorSchema.optional(),
});

type Fixture = z.infer<typeof fixtureSchema>;

/** Un PNG 1×1 trasparente: un file immagine vero, piccolo quanto basta. */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMB/axgwQAAAABJRU5ErkJggg==',
  'base64',
);

/** Un WAV valido di zero campioni: solo l'intestazione, 44 byte. */
const PLACEHOLDER_WAV = (() => {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36, 4);
  header.write('WAVEfmt ', 8, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(44_100, 24);
  header.writeUInt32LE(88_200, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(0, 40);
  return header;
})();

/**
 * Un contenitore MP4 con il solo riquadro `ftyp`: **non è un video riproducibile**, è un
 * segnaposto che fa passare la catena (coda, copia del file, scontrino) senza rete. Quando
 * servirà un video finto vero lo si genererà con ffmpeg, che entra nel progetto in M5.
 */
const PLACEHOLDER_MP4 = (() => {
  const body = Buffer.from('ftypisomisomiso2', 'ascii');
  const box = Buffer.alloc(4 + body.length);
  box.writeUInt32BE(box.length, 0);
  body.copy(box, 4);
  return box;
})();

function placeholderFor(contentType: string): Buffer {
  if (contentType.startsWith('image/')) return PLACEHOLDER_PNG;
  if (contentType.startsWith('audio/')) return PLACEHOLDER_WAV;
  return PLACEHOLDER_MP4;
}

interface FakeJob {
  request: MediaRequest;
  fixture: Fixture;
  pollsLeft: number;
}

/** Una chiamata registrata, per i test: «il ruolo X ha chiesto al servizio Y con questi parametri». */
export interface FakeCall {
  kind: 'llm' | 'media';
  role: string;
  modelId: string;
  providerModel: string;
  idempotencyKey?: string;
}

export interface FakeProviderOptions {
  /** La cartella delle fixture registrate (`fixtures:` nella connessione). */
  fixturesDir?: string;
  /**
   * Risposte messe a mano, che vincono sulle fixture: comode nei test. È la forma *in ingresso*
   * dello schema, quindi i valori con un default (come `polls`) si possono omettere.
   */
  responses?: Record<string, z.input<typeof fixtureSchema>>;
}

/**
 * Risponde subito, ma resta **asincrono** come un fornitore vero (cede il turno con una promessa):
 * così un errore diventa un rifiuto della promessa e il codice che la usa si comporta allo stesso
 * modo con il finto e con quello vero.
 */
export class FakeProvider implements LlmAdapter, MediaAdapter {
  readonly calls: FakeCall[] = [];
  private readonly jobs = new Map<string, FakeJob>();

  constructor(private readonly options: FakeProviderOptions = {}) {}

  async generate(req: LlmRequest): Promise<LlmResponse> {
    await Promise.resolve();
    this.calls.push({
      kind: 'llm',
      role: req.role,
      modelId: req.modelId,
      providerModel: req.providerModel,
    });

    const fixture = this.fixtureFor(req.role);
    if (fixture.error !== undefined) {
      throw new ProviderError(fixture.error.code, fixture.error.retryable, fixture.error.message, {
        role: req.role,
        modelId: req.modelId,
      });
    }

    const data = fixture.data ?? ROLE_OUTPUT_EXAMPLES[req.role];
    if (data === undefined) {
      throw new ProviderError(
        'config_invalid',
        false,
        `Il fornitore finto non ha una risposta per il ruolo "${req.role}": aggiungi una fixture o la sua risposta di esempio.`,
        { role: req.role },
      );
    }

    // Se la richiesta porta lo schema del ruolo, la risposta finta deve rispettarlo: una fixture
    // sbagliata deve rompere il test, non passare inosservata.
    if (req.outputSchema !== undefined) {
      const parsed = req.outputSchema.safeParse(data);
      if (!parsed.success) {
        throw new ProviderError(
          'invalid_output',
          false,
          `La risposta finta per il ruolo "${req.role}" non rispetta il suo schema: ${parsed.error.issues
            .map((issue) => `${issue.path.join('.')} ${issue.message}`)
            .join('; ')}.`,
          { role: req.role, modelId: req.modelId },
        );
      }
      return { data: parsed.data, usage: fakeUsage(req) };
    }

    return { data, usage: fakeUsage(req) };
  }

  async submit(req: MediaRequest): Promise<{ providerRequestId: string }> {
    await Promise.resolve();
    this.calls.push({
      kind: 'media',
      role: req.role,
      modelId: req.modelId,
      providerModel: req.providerModel,
      idempotencyKey: req.idempotencyKey,
    });

    // L'id viene dalla chiave di idempotenza: rimandare lo stesso lavoro non ne crea un altro (§7).
    const providerRequestId = `fake-${hash(req.idempotencyKey)}`;
    const fixture = this.fixtureFor(req.role);
    if (!this.jobs.has(providerRequestId)) {
      this.jobs.set(providerRequestId, { request: req, fixture, pollsLeft: fixture.polls });
    }

    return { providerRequestId };
  }

  async poll(providerRequestId: string): Promise<MediaStatus> {
    await Promise.resolve();
    const job = this.jobs.get(providerRequestId);
    if (job === undefined) {
      throw new ProviderError(
        'not_found',
        false,
        `Il fornitore finto non ha un lavoro con id "${providerRequestId}".`,
      );
    }

    if (job.pollsLeft > 0) {
      job.pollsLeft -= 1;
      return { state: 'running' };
    }

    const { error } = job.fixture;
    if (error !== undefined) {
      return {
        state: 'failed',
        code: error.code,
        retryable: error.retryable,
        message: error.message,
      };
    }

    const files = filesFor(job);
    return { state: 'succeeded', files, usage: usageFor(job, files) };
  }

  async cancel(providerRequestId: string): Promise<void> {
    await Promise.resolve();
    this.jobs.delete(providerRequestId);
  }

  /** Fixture messa a mano, poi quella su file, poi niente: decide `generate`/`poll`. */
  private fixtureFor(role: string): Fixture {
    const given = this.options.responses?.[role];
    if (given !== undefined) return fixtureSchema.parse(given);

    const dir = this.options.fixturesDir;
    if (dir === undefined) return fixtureSchema.parse({});

    let raw: string;
    try {
      raw = readFileSync(path.join(dir, `${role}.json`), 'utf8');
    } catch {
      return fixtureSchema.parse({});
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new ProviderError(
        'config_invalid',
        false,
        `La fixture del ruolo "${role}" non è JSON valido: ${cause instanceof Error ? cause.message : String(cause)}.`,
        { role },
      );
    }

    const fixture = fixtureSchema.safeParse(parsed);
    if (!fixture.success) {
      throw new ProviderError(
        'config_invalid',
        false,
        `La fixture del ruolo "${role}" non è nel formato giusto: ${fixture.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join('; ')}.`,
        { role },
      );
    }

    return fixture.data;
  }
}

function filesFor(job: FakeJob): MediaFile[] {
  const declared = job.fixture.files;
  if (declared !== undefined) {
    return declared.map((file) => ({
      fileName: file.fileName,
      contentType: file.contentType,
      bytes:
        file.base64 === undefined
          ? placeholderFor(file.contentType)
          : Buffer.from(file.base64, 'base64'),
    }));
  }

  const contentType = defaultContentType(job.request.role);
  return [
    {
      fileName: `${job.request.role}-finto.${extensionFor(contentType)}`,
      contentType,
      bytes: placeholderFor(contentType),
    },
  ];
}

function defaultContentType(role: string): string {
  if (role === 'camera_operator') return 'video/mp4';
  if (role === 'composer' || role === 'sfx_artist') return 'audio/wav';
  return 'image/png';
}

function extensionFor(contentType: string): string {
  if (contentType.startsWith('image/')) return 'png';
  if (contentType.startsWith('audio/')) return 'wav';
  return 'mp4';
}

function usageFor(job: FakeJob, files: readonly MediaFile[]): MediaUsage {
  const duration = job.request.params?.['duration_s'];
  return typeof duration === 'number' ? { seconds: duration } : { images: files.length };
}

/** Un uso verosimile e ripetibile: i caratteri diviso quattro, come stima grezza dei token. */
function fakeUsage(req: LlmRequest): { inputTokens: number; outputTokens: number } {
  const input = `${req.system ?? ''}${req.user}`;
  return { inputTokens: Math.ceil(input.length / 4), outputTokens: 64 };
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export const fakeAdapterFactory: AdapterFactory = {
  name: 'fake',
  llm: (options: AdapterOptions) => providerFor(options),
  media: (options: AdapterOptions) => providerFor(options),
};

/** Una sola istanza per connessione, così i lavori messi in coda si ritrovano nel polling. */
const providers = new WeakMap<object, FakeProvider>();

function providerFor(options: AdapterOptions): FakeProvider {
  const existing = providers.get(options.connection);
  if (existing !== undefined) return existing;

  const provider = new FakeProvider({ fixturesDir: options.connection.fixtures });
  providers.set(options.connection, provider);
  return provider;
}

import { ROLE_IO, type Connection } from '@filmzy/contracts';
import { APICallError, NoObjectGeneratedError, type LanguageModel } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it, vi } from 'vitest';

import { aiSdkLlmAdapter, openAiCompatibleModel } from './ai-sdk.js';
import type { AdapterOptions, LlmRequest } from './types.js';

const connection: Connection = {
  adapter: 'anthropic',
  api_key: 'env:PROVA_API_KEY',
  timeout_s: 30,
  max_concurrency: 2,
  enabled: true,
};

const options: AdapterOptions = {
  connectionId: 'prova',
  connection,
  secrets: { env: { PROVA_API_KEY: 'chiave-di-prova' } },
};

const request: LlmRequest = {
  role: 'moderator',
  modelId: 'un-servizio',
  providerModel: 'un-modello',
  system: 'Sei il moderatore.',
  user: 'Una donna torna nella sua città natale',
  params: { temperature: 0, max_tokens: 500 },
  outputSchema: ROLE_IO.moderator.output,
};

/** Un modello finto dell'SDK: niente rete, ma il codice sotto prova è quello vero. */
function modelAnswering(
  text: string,
  unified: 'stop' | 'content-filter' = 'stop',
): () => LanguageModel {
  return () =>
    new MockLanguageModelV4({
      doGenerate: () =>
        Promise.resolve({
          content: [{ type: 'text' as const, text }],
          finishReason: { unified, raw: undefined },
          usage: {
            inputTokens: {
              total: 120,
              noCache: undefined,
              cacheRead: undefined,
              cacheWrite: undefined,
            },
            outputTokens: { total: 24, text: 24, reasoning: undefined },
            totalTokens: 144,
          },
          warnings: [],
        }),
    });
}

function modelThrowing(error: Error): () => LanguageModel {
  return () => new MockLanguageModelV4({ doGenerate: () => Promise.reject(error) });
}

describe("adapter di testo con l'AI SDK", () => {
  it("restituisce la risposta strutturata e l'uso dei token, senza rete", async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const adapter = aiSdkLlmAdapter(
      options,
      modelAnswering(JSON.stringify({ allowed: true, reason: 'Non nomina nessuno di reale.' })),
    );

    const { data, usage } = await adapter.generate(request);

    expect(data).toEqual({ allowed: true, reason: 'Non nomina nessuno di reale.' });
    expect(usage).toEqual({ inputTokens: 120, outputTokens: 24 });
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('una risposta che non è nella forma richiesta diventa invalid_output', async () => {
    const adapter = aiSdkLlmAdapter(options, modelAnswering('non è JSON'));

    await expect(adapter.generate(request)).rejects.toMatchObject({
      code: 'invalid_output',
      retryable: false,
    });
  });

  it('un rifiuto per contenuto è content_rejected, non un errore tecnico (D36)', async () => {
    // Il filtro del fornitore non lancia un'eccezione: lo dice nel motivo di fine.
    const adapter = aiSdkLlmAdapter(
      options,
      modelAnswering(JSON.stringify({ allowed: true, reason: 'x' }), 'content-filter'),
    );

    await expect(adapter.generate(request)).rejects.toMatchObject({
      code: 'content_rejected',
      retryable: false,
    });
  });
});

describe('gli errori del fornitore diventano codici di §4.10', () => {
  function apiError(statusCode: number | undefined, isRetryable = false): APICallError {
    return new APICallError({
      message: 'errore del fornitore',
      url: 'https://esempio.invalido/v1/messages',
      requestBodyValues: {},
      statusCode,
      isRetryable,
    });
  }

  it.each([
    [401, 'provider_auth_failed', false],
    [403, 'provider_auth_failed', false],
    [402, 'provider_quota_exhausted', false],
    [429, 'rate_limited', true],
    [500, 'provider_unavailable', true],
    [503, 'provider_unavailable', true],
    [400, 'invalid_request', false],
  ] as const)('%i diventa %s', async (status, code, retryable) => {
    const adapter = aiSdkLlmAdapter(options, modelThrowing(apiError(status)));

    await expect(adapter.generate(request)).rejects.toMatchObject({ code, retryable });
  });

  it('un errore che il fornitore dichiara riprovabile è provider_unavailable', async () => {
    const adapter = aiSdkLlmAdapter(options, modelThrowing(apiError(undefined, true)));

    await expect(adapter.generate(request)).rejects.toMatchObject({
      code: 'provider_unavailable',
      retryable: true,
    });
  });

  it('una risposta senza oggetto è invalid_output', async () => {
    const error = new NoObjectGeneratedError({
      message: 'niente oggetto',
      text: 'non è JSON',
      response: { id: 'prova', timestamp: new Date('2026-10-21T10:00:00Z'), modelId: 'prova' },
      usage: {
        inputTokens: 1,
        inputTokenDetails: {
          noCacheTokens: 1,
          cacheReadTokens: undefined,
          cacheWriteTokens: undefined,
        },
        outputTokens: 1,
        outputTokenDetails: { textTokens: 1, reasoningTokens: undefined },
        totalTokens: 2,
      },
      finishReason: 'stop',
    });
    const adapter = aiSdkLlmAdapter(options, modelThrowing(error));

    await expect(adapter.generate(request)).rejects.toMatchObject({ code: 'invalid_output' });
  });

  it('un tempo scaduto è timeout, e si può riprovare', async () => {
    const timeout = new Error('scaduto');
    timeout.name = 'TimeoutError';
    const adapter = aiSdkLlmAdapter(options, modelThrowing(timeout));

    await expect(adapter.generate(request)).rejects.toMatchObject({
      code: 'timeout',
      retryable: true,
    });
  });

  it('il messaggio non contiene la chiave (D25)', async () => {
    const adapter = aiSdkLlmAdapter(options, modelThrowing(apiError(401)));

    await expect(adapter.generate(request)).rejects.not.toThrow(/chiave-di-prova/);
  });
});

describe('openai_compatible', () => {
  it('pretende un base_url: senza, non sa a chi parlare', () => {
    expect(() => openAiCompatibleModel('un-modello', options)).toThrow(/base_url/);
  });
});

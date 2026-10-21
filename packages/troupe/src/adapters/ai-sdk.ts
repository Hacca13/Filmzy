import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  APICallError,
  generateText,
  NoObjectGeneratedError,
  Output,
  TypeValidationError,
  type LanguageModel,
} from 'ai';
import { z } from 'zod';

import { ProviderError } from '../provider-error.js';
import { readSecret } from '../config/secrets.js';
import type {
  AdapterFactory,
  AdapterOptions,
  LlmAdapter,
  LlmRequest,
  LlmResponse,
} from './types.js';

/**
 * Gli adapter dei fornitori di testo (architettura §4.7): **uno per famiglia di protocollo**, non
 * uno per modello. `anthropic` e `openai_compatible` cambiano solo il client e l'indirizzo, quindi
 * stanno qui insieme; con `openai_compatible` entrano OpenRouter, i modelli locali (Ollama, vLLM)
 * e qualunque gateway compatibile.
 *
 * È l'unico posto che legge la chiave (D25) e l'unico che importa le librerie dei fornitori (§3).
 */

/** Come si costruisce il modello da chiamare: iniettabile, così i test non toccano la rete. */
export type ModelFactory = (providerModel: string, options: AdapterOptions) => LanguageModel;

export function anthropicModel(providerModel: string, options: AdapterOptions): LanguageModel {
  const provider = createAnthropic({
    apiKey: readSecret(options.connection.api_key, options.secrets) ?? '',
    ...(options.connection.base_url === undefined ? {} : { baseURL: options.connection.base_url }),
    ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
  });
  return provider(providerModel);
}

export function openAiCompatibleModel(
  providerModel: string,
  options: AdapterOptions,
): LanguageModel {
  const baseURL = options.connection.base_url;
  if (baseURL === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `La connessione "${options.connectionId}" usa l'adapter openai_compatible ma non ha un base_url.`,
      { connectionId: options.connectionId, field: 'base_url' },
    );
  }

  const provider = createOpenAICompatible({
    name: options.connectionId,
    baseURL,
    apiKey: readSecret(options.connection.api_key, options.secrets),
    ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
  });
  return provider(providerModel);
}

export function aiSdkLlmAdapter(options: AdapterOptions, model: ModelFactory): LlmAdapter {
  return {
    async generate(req: LlmRequest): Promise<LlmResponse> {
      const temperature = numberParam(req.params?.temperature);
      const maxOutputTokens = numberParam(req.params?.max_tokens);

      try {
        const result = await generateText({
          model: model(req.providerModel, options),
          ...(req.system === undefined ? {} : { system: req.system }),
          prompt: req.user,
          ...(temperature === undefined ? {} : { temperature }),
          ...(maxOutputTokens === undefined ? {} : { maxOutputTokens }),
          // Output strutturato: lo schema è quello del ruolo, non un testo nel prompt (§4.9).
          output: Output.object({ schema: req.outputSchema ?? z.unknown() }),
          abortSignal: AbortSignal.timeout(options.connection.timeout_s * 1000),
          // I nuovi tentativi li decide la troupe secondo `retries` del ruolo (§4.10).
          maxRetries: 0,
        });

        // Un rifiuto per contenuto arriva come motivo di fine, non come eccezione: va distinto,
        // perché non si riprova e non si aggira con un altro servizio (§4.10, D36).
        if (result.finishReason === 'content-filter') {
          throw new ProviderError(
            'content_rejected',
            false,
            'Il servizio ha rifiutato il contenuto della richiesta.',
            { role: req.role, modelId: req.modelId, connectionId: options.connectionId },
          );
        }

        return {
          data: result.output,
          usage: {
            ...(result.usage.inputTokens === undefined
              ? {}
              : { inputTokens: result.usage.inputTokens }),
            ...(result.usage.outputTokens === undefined
              ? {}
              : { outputTokens: result.usage.outputTokens }),
          },
        };
      } catch (error) {
        if (error instanceof ProviderError) throw error;
        throw toProviderError(error, req, options);
      }
    },
  };
}

function numberParam(value: string | number | boolean | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

/**
 * Traduce l'errore del fornitore in un codice di §4.10, perché è il codice che decide se si
 * riprova e cosa legge l'utente. Il messaggio non contiene mai la chiave (D25): si riporta solo
 * quello che il fornitore dice.
 */
function toProviderError(error: unknown, req: LlmRequest, options: AdapterOptions): ProviderError {
  const details = {
    role: req.role,
    modelId: req.modelId,
    connectionId: options.connectionId,
  };

  if (NoObjectGeneratedError.isInstance(error) || TypeValidationError.isInstance(error)) {
    return new ProviderError(
      'invalid_output',
      false,
      'Il servizio non ha risposto nella forma richiesta.',
      details,
    );
  }

  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    if (status === 401 || status === 403) {
      return new ProviderError(
        'provider_auth_failed',
        false,
        'La chiave del servizio non è valida o non basta per questo modello.',
        details,
      );
    }
    if (status === 402) {
      return new ProviderError(
        'provider_quota_exhausted',
        false,
        'Il credito presso il servizio è finito.',
        details,
      );
    }
    if (status === 429) {
      return new ProviderError('rate_limited', true, 'Troppe richieste al servizio.', {
        ...details,
        ...retryAfter(error),
      });
    }
    if (status !== undefined && status >= 500) {
      return new ProviderError(
        'provider_unavailable',
        true,
        `Il servizio non risponde (errore ${String(status)}).`,
        details,
      );
    }
    if (error.isRetryable) {
      return new ProviderError('provider_unavailable', true, 'Il servizio non risponde.', details);
    }
    return new ProviderError(
      'invalid_request',
      false,
      `Il servizio ha rifiutato la richiesta${status === undefined ? '' : ` (errore ${String(status)})`}.`,
      details,
    );
  }

  if (isTimeout(error)) {
    return new ProviderError('timeout', true, 'Il servizio non ha risposto in tempo.', details);
  }

  return new ProviderError(
    'provider_unavailable',
    true,
    error instanceof Error ? error.message : String(error),
    details,
  );
}

function retryAfter(error: APICallError): { retryAfterS?: number } {
  const header = error.responseHeaders?.['retry-after'];
  const seconds = header === undefined ? Number.NaN : Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? { retryAfterS: seconds } : {};
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}

export const anthropicAdapterFactory: AdapterFactory = {
  name: 'anthropic',
  llm: (options) => aiSdkLlmAdapter(options, anthropicModel),
};

export const openAiCompatibleAdapterFactory: AdapterFactory = {
  name: 'openai_compatible',
  llm: (options) => aiSdkLlmAdapter(options, openAiCompatibleModel),
};

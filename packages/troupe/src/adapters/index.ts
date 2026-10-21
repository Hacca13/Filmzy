import { anthropicAdapterFactory, openAiCompatibleAdapterFactory } from './ai-sdk.js';
import { fakeAdapterFactory } from './fake.js';
import { ProviderError } from '../provider-error.js';
import type { AdapterFactory, AdapterOptions, LlmAdapter, MediaAdapter } from './types.js';

/**
 * L'indice dei plugin (architettura §4.12, caso C): una famiglia nuova si aggiunge qui e non tocca
 * le app. Oggi: il fornitore finto e i due di testo; `fal` per immagini e video arriva in T1.3.
 */
const ADAPTERS: readonly AdapterFactory[] = [
  fakeAdapterFactory,
  anthropicAdapterFactory,
  openAiCompatibleAdapterFactory,
];

function factoryFor(options: AdapterOptions): AdapterFactory {
  const factory = ADAPTERS.find((candidate) => candidate.name === options.connection.adapter);
  if (factory === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `La connessione "${options.connectionId}" chiede l'adapter "${options.connection.adapter}", che non esiste. Disponibili: ${ADAPTERS.map((a) => a.name).join(', ')}.`,
      { connectionId: options.connectionId, field: 'adapter' },
    );
  }
  return factory;
}

export function llmAdapterFor(options: AdapterOptions): LlmAdapter {
  const factory = factoryFor(options);
  if (factory.llm === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `L'adapter "${factory.name}" non sa servire i ruoli di testo.`,
      { connectionId: options.connectionId, field: 'adapter' },
    );
  }
  return factory.llm(options);
}

export function mediaAdapterFor(options: AdapterOptions): MediaAdapter {
  const factory = factoryFor(options);
  if (factory.media === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `L'adapter "${factory.name}" non sa servire immagini, video o suoni.`,
      { connectionId: options.connectionId, field: 'adapter' },
    );
  }
  return factory.media(options);
}

export const ADAPTER_NAMES: readonly string[] = ADAPTERS.map((factory) => factory.name);

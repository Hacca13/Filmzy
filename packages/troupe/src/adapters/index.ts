import { anthropicAdapterFactory, openAiCompatibleAdapterFactory } from './ai-sdk.js';
import { fakeAdapterFactory } from './fake.js';
import { falAdapterFactory } from './fal.js';
import { ProviderError } from '../provider-error.js';
import type {
  AdapterFactory,
  AdapterOptions,
  ConnectionTestOptions,
  LlmAdapter,
  MediaAdapter,
} from './types.js';

/**
 * L'indice dei plugin (architettura §4.12, caso C): una famiglia nuova si aggiunge qui e non tocca
 * le app. Oggi: il fornitore finto, i due di testo e fal per immagini e video.
 */
const ADAPTERS: readonly AdapterFactory[] = [
  fakeAdapterFactory,
  anthropicAdapterFactory,
  openAiCompatibleAdapterFactory,
  falAdapterFactory,
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

/**
 * La prova di connessione che non costa (T2.7): dice se il fornitore risponde e se la chiave è
 * buona, con una lettura. Lancia un `ProviderError` col motivo; non genera mai niente.
 */
export async function testConnection(options: ConnectionTestOptions): Promise<void> {
  const factory = factoryFor(options);
  if (factory.testConnection === undefined) {
    throw new ProviderError(
      'config_invalid',
      false,
      `L'adapter "${factory.name}" non sa ancora provare la connessione.`,
      { connectionId: options.connectionId, field: 'adapter' },
    );
  }
  await factory.testConnection(options);
}

/** L'adapter sa provare la connessione senza spendere (T2.7)? Serve all'interfaccia per mostrare il pulsante. */
export function adapterCanTest(adapterName: string): boolean {
  return ADAPTERS.find((candidate) => candidate.name === adapterName)?.testConnection !== undefined;
}

export const ADAPTER_NAMES: readonly string[] = ADAPTERS.map((factory) => factory.name);

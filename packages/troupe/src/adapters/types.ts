import type { Connection, DomainErrorCode, RoleId } from '@filmzy/contracts';
import type { z } from 'zod';

import type { SecretSources } from '../config/secrets.js';

/**
 * Un adapter è **una famiglia di protocollo, non un modello** (architettura §4.7): si crea per una
 * connessione e poi serve tutte le voci del catalogo che la usano.
 */
export interface AdapterOptions {
  connectionId: string;
  connection: Connection;
  /** Dove stanno le chiavi. Solo l'adapter le legge, e mai per metterle in un log (D25). */
  secrets?: SecretSources;
}

export interface LlmRequest {
  role: RoleId;
  modelId: string;
  /** L'id presso il fornitore: lo sceglie la configurazione, mai il codice (regola d'oro 1). */
  providerModel: string;
  system?: string;
  user: string;
  params?: Record<string, string | number | boolean>;
  /** Lo schema della risposta del ruolo, per l'output strutturato e la validazione (§4.9). */
  outputSchema?: z.ZodType;
}

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface LlmResponse {
  /** Già validata con `outputSchema`, se la richiesta lo porta. */
  data: unknown;
  usage?: LlmUsage;
}

export interface LlmAdapter {
  generate(req: LlmRequest): Promise<LlmResponse>;
}

export interface MediaFile {
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
}

/** Un file che entra in una richiesta: riferimento, primo o ultimo fotogramma, maschera (D20, D21). */
export interface MediaInput {
  use: 'reference' | 'first_frame' | 'last_frame' | 'base_image' | 'mask';
  file: MediaFile;
}

export interface MediaRequest {
  role: RoleId;
  modelId: string;
  providerModel: string;
  prompt: string;
  negativePrompt?: string;
  inputs?: MediaInput[];
  params?: Record<string, string | number | boolean>;
  /** Un lavoro ripetuto non deve contare due volte nella spesa (architettura §7). */
  idempotencyKey: string;
}

export interface MediaUsage {
  seconds?: number;
  images?: number;
}

/**
 * Lo stato di un lavoro presso il fornitore. Un lavoro **fallito** è uno stato, non un'eccezione:
 * la chiamata di polling è andata a buon fine, è il lavoro che è andato male. Le eccezioni
 * (`ProviderError`) restano per i guai della chiamata: rete, chiave, quota.
 */
export type MediaStatus =
  | { state: 'queued' | 'running' }
  | { state: 'succeeded'; files: MediaFile[]; usage?: MediaUsage }
  | { state: 'failed'; code: DomainErrorCode; retryable: boolean; message: string };

export interface MediaAdapter {
  submit(req: MediaRequest): Promise<{ providerRequestId: string }>;
  poll(providerRequestId: string): Promise<MediaStatus>;
  cancel?(providerRequestId: string): Promise<void>;
}

/**
 * Una famiglia di adapter nell'indice dei plugin (architettura §4.12, caso C): dichiara il nome
 * con cui la connessione la cita (`adapter: fake`) e quali tipi di lavoro sa fare.
 */
export interface AdapterFactory {
  name: string;
  llm?(options: AdapterOptions): LlmAdapter;
  media?(options: AdapterOptions): MediaAdapter;
}

import type { DomainErrorCode, SpendBreach } from '@filmzy/contracts';

import type { LlmUsage } from './adapters/types.js';

export interface ProviderErrorDetails {
  role?: string;
  modelId?: string;
  connectionId?: string;
  field?: string;
  retryAfterS?: number;
  /** Per `spend_cap_reached`: il limite superato (D30). */
  spend?: SpendBreach;
}

/**
 * Un errore di una chiamata a un fornitore (architettura §4.10). Porta il codice del dominio e se
 * ha senso riprovare, perché è ciò che decide i pochi nuovi tentativi e il messaggio che l'utente
 * vedrà. Nessuna riserva automatica: se un servizio fallisce il lavoro si ferma (D36).
 *
 * Il messaggio non contiene mai una chiave: i segreti non entrano negli errori (D25).
 */
export class ProviderError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    readonly retryable: boolean,
    message: string,
    readonly details: ProviderErrorDetails = {},
    /** Quanto ha consumato la chiamata, se è arrivata al modello: una risposta fuori schema si paga lo stesso. */
    readonly usage?: LlmUsage,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

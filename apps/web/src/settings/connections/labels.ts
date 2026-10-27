import type { ModelGroup, ModelPricing, ProviderState, UnusableReason } from '@filmzy/contracts';

import { ApiError } from '../../api/client';
import { formatUsd } from '../../lib/format';
import { describeError } from '../messages';

/**
 * Le parole delle pagine dei fornitori. Qui non compaiono «prompt», «modello» o «token»
 * (regola 12 di CLAUDE.md): si dice «servizio», e il nome amichevole lo dà il catalogo (D36).
 */

export const GROUP_LABELS: Record<ModelGroup, string> = {
  text: 'Testo',
  vision: 'Lettura immagini',
  image: 'Immagini',
  video: 'Video',
  audio: 'Musica ed effetti',
  voice: 'Voci',
};

/** Nell'ordine in cui l'utente li incontra nel flusso di un film. */
export const GROUP_ORDER: readonly ModelGroup[] = [
  'text',
  'vision',
  'image',
  'video',
  'audio',
  'voice',
];

const UNUSABLE_TEXT: Record<UnusableReason, string> = {
  retired: 'ritirato dal fornitore',
  connection_disabled: 'il fornitore è spento nelle impostazioni avanzate',
  key_missing: 'manca la chiave',
};

export function unusableText(reason: UnusableReason): string {
  return UNUSABLE_TEXT[reason];
}

/** Il costo di un servizio in parole: a secondo, a immagine, o «a consumo» per il testo. */
export function formatPrice(pricing: ModelPricing): string {
  switch (pricing.unit) {
    case 'per_second':
      return `${formatUsd(pricing.value)} al secondo`;
    case 'per_image':
      return `${formatUsd(pricing.value)} a immagine`;
    case 'per_mtok':
      // Il testo costa in base a quanto si scrive: un numero solo non direbbe la verità.
      return 'a consumo';
  }
}

export interface ProviderStatus {
  text: string;
  tone: 'ok' | 'warning' | 'off';
}

/** «✓ Collegato», «Chiave mancante» o «Spento»: lo stato che si legge a colpo d'occhio. */
export function providerStatus(provider: ProviderState): ProviderStatus {
  if (!provider.enabled) return { text: 'Spento', tone: 'off' };
  if (provider.keyRequired && provider.key?.present !== true) {
    return { text: 'Chiave mancante', tone: 'warning' };
  }
  const hasActive = provider.services.some((service) => service.enabled && service.usable);
  return hasActive
    ? { text: '✓ Collegato', tone: 'ok' }
    : { text: 'Nessun servizio attivato', tone: 'warning' };
}

/** Un fornitore è «collegato» quando si può usare davvero: acceso, con la chiave e un servizio attivato. */
export function isLinked(provider: ProviderState): boolean {
  return providerStatus(provider).tone === 'ok';
}

/** Dove sta la chiave, a parole. */
export function keyOriginText(provider: ProviderState): string {
  const key = provider.key;
  if (!provider.keyRequired || key === undefined) return 'Non serve una chiave.';
  if (!key.present) return 'Chiave mancante.';
  return key.foundIn === 'env'
    ? 'Chiave presente (nel file .env).'
    : 'Chiave collegata: salvata nel programma, non si rivede più.';
}

/**
 * La prova di connessione: una chiave rifiutata dice proprio «Chiave non valida» (T2.7); il resto
 * ha le frasi di sempre.
 */
export function describeTestError(error: unknown): string {
  if (error instanceof ApiError && error.serverCode === 'provider_auth_failed') {
    return 'Chiave non valida';
  }
  return describeError(error);
}

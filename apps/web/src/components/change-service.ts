import type { ModelOption } from '@filmzy/contracts';

import { formatEstimate } from '../lib/format';

/**
 * Le piccole decisioni di «Cambia servizio» (D36), fuori dal componente così si provano a parte.
 * L'elenco lo costruisce il backend (`troupe.options`): qui si dice solo come mostrarlo.
 */

/** Il servizio che si userà: quello scelto, altrimenti il predefinito, altrimenti il primo. */
export function selectedOption(
  options: readonly ModelOption[],
  selectedId: string | undefined,
): ModelOption | undefined {
  return (
    options.find((option) => option.modelId === selectedId) ??
    options.find((option) => option.isDefault) ??
    options[0]
  );
}

/** «circa 0,42 $»: la stima del servizio, che segue la scelta. */
export function costText(option: ModelOption): string {
  return `circa ${formatEstimate(option.estimatedCostUsd)}`;
}

/** Il testo del pulsante che genera: «Genera · circa 0,42 $». */
export function generateLabel(option: ModelOption | undefined): string {
  return option === undefined ? 'Genera' : `Genera · ${costText(option)}`;
}

/**
 * Il voto delle prove (da 1 a 5) in un giudizio semplice: l'utente non deve leggere un numero.
 * Senza voto, il servizio non è stato ancora provato.
 */
export function qualityText(quality: number | undefined): string {
  if (quality === undefined) return 'non ancora provato';
  if (quality >= 4.5) return 'ottimo';
  if (quality >= 3.5) return 'buono';
  if (quality >= 2.5) return 'discreto';
  return 'scarso';
}

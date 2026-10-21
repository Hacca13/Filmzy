import type { ModelPricing } from '@filmzy/contracts';

import type { LlmUsage } from './adapters/types.js';

/**
 * Il costo di una chiamata di testo, dai token e dal prezzo del catalogo (architettura §4.11).
 * `per_mtok` può avere fasce: oltre una certa lunghezza del prompt il prezzo cambia, e si applica
 * la fascia più alta che il prompt supera.
 *
 * `undefined` quando il prezzo non è per token: non si inventa un costo, lo scontrino dirà che non
 * si sa.
 */
export function llmCostUsd(pricing: ModelPricing, usage: LlmUsage | undefined): number | undefined {
  if (pricing.unit !== 'per_mtok') return undefined;

  const inputTokens = usage?.inputTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? 0;

  const tier = (pricing.tiers ?? [])
    .filter((candidate) => inputTokens > candidate.above_prompt_tokens)
    .sort((a, b) => b.above_prompt_tokens - a.above_prompt_tokens)[0];

  const inputPrice = tier?.input ?? pricing.input;
  const outputPrice = tier?.output ?? pricing.output;

  return (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
}

/** Il costo di un lavoro di media: a secondo o a immagine, secondo il prezzo del catalogo. */
export function mediaCostUsd(
  pricing: ModelPricing,
  usage: { seconds?: number; images?: number } | undefined,
): number | undefined {
  if (pricing.unit === 'per_second') {
    return usage?.seconds === undefined ? undefined : usage.seconds * pricing.value;
  }
  if (pricing.unit === 'per_image') {
    return usage?.images === undefined ? undefined : usage.images * pricing.value;
  }
  return undefined;
}

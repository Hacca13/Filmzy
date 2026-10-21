import { describe, expect, it } from 'vitest';

import { llmCostUsd, mediaCostUsd } from './cost.js';

/** I prezzi del seme: 2 $ e 10 $ per milione di token, con la fascia oltre 100.000. */
const perMtok = {
  unit: 'per_mtok' as const,
  input: 2,
  output: 10,
  checked: '2026-10-19',
};

describe('llmCostUsd', () => {
  it('conta i token al prezzo base', () => {
    // 1.000 token in ingresso e 500 in uscita: 0,002 + 0,005 = 0,007 $
    expect(llmCostUsd(perMtok, { inputTokens: 1000, outputTokens: 500 })).toBeCloseTo(0.007, 10);
  });

  it('applica la fascia quando il prompt la supera', () => {
    const withTier = {
      ...perMtok,
      input: 0.1,
      output: 0.5,
      tiers: [{ above_prompt_tokens: 100_000, input: 0.5, output: 2.5 }],
    };

    const sotto = llmCostUsd(withTier, { inputTokens: 1000, outputTokens: 1000 });
    const sopra = llmCostUsd(withTier, { inputTokens: 100_001, outputTokens: 1000 });

    expect(sotto).toBeCloseTo((1000 * 0.1 + 1000 * 0.5) / 1_000_000, 12);
    expect(sopra).toBeCloseTo((100_001 * 0.5 + 1000 * 2.5) / 1_000_000, 12);
  });

  it('senza uso il costo è zero, non inventato', () => {
    expect(llmCostUsd(perMtok, undefined)).toBe(0);
  });

  it('non inventa un costo se il prezzo non è per token', () => {
    expect(
      llmCostUsd({ unit: 'per_second', value: 0.15, checked: '2026-10-13' }, { inputTokens: 10 }),
    ).toBeUndefined();
  });
});

describe('mediaCostUsd', () => {
  it('conta i secondi di un video', () => {
    expect(
      mediaCostUsd({ unit: 'per_second', value: 0.15, checked: '2026-10-13' }, { seconds: 5 }),
    ).toBeCloseTo(0.75, 10);
  });

  it('conta le immagini', () => {
    expect(
      mediaCostUsd({ unit: 'per_image', value: 0.08, checked: '2026-10-13' }, { images: 3 }),
    ).toBeCloseTo(0.24, 10);
  });

  it("non inventa un costo quando l'uso non lo dice", () => {
    expect(
      mediaCostUsd({ unit: 'per_second', value: 0.15, checked: '2026-10-13' }, { images: 2 }),
    ).toBeUndefined();
  });
});

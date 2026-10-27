import { describe, expect, it } from 'vitest';

import { formatDateTime, formatUsd, formatValue } from './format';

describe('formatUsd', () => {
  it('le frazioni di centesimo hanno quattro decimali, con la virgola', () => {
    expect(formatUsd(0.0031)).toBe('0,0031 $');
    expect(formatUsd(0.004)).toBe('0,0040 $');
  });

  it('da un dollaro in su bastano due decimali', () => {
    expect(formatUsd(1)).toBe('1,00 $');
    expect(formatUsd(12.345)).toBe('12,35 $');
  });

  it('zero resta zero', () => {
    expect(formatUsd(0)).toBe('0,0000 $');
  });
});

describe('formatValue', () => {
  it("il testo resta com'è, il resto si scrive rientrato", () => {
    expect(formatValue('ciao')).toBe('ciao');
    expect(formatValue({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});

describe('formatDateTime', () => {
  it('data e ora in italiano', () => {
    const text = formatDateTime('2026-10-27T10:05:00.000Z');

    expect(text).toContain('ottobre 2026');
    expect(text).toMatch(/\d{1,2}:\d{2}/);
  });
});

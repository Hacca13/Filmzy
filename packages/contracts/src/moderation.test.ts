import { describe, expect, it } from 'vitest';

import { domainErrorSchema } from './errors.js';
import { moderationRejectionSchema } from './moderation.js';
import { moderatorOutputSchema } from './roles/llm.js';

describe('moderationRejectionSchema', () => {
  it('accetta il motivo da solo, o con categoria e suggerimento', () => {
    expect(moderationRejectionSchema.parse({ reason: 'Nomina una persona reale.' })).toEqual({
      reason: 'Nomina una persona reale.',
    });
    expect(
      moderationRejectionSchema.parse({
        category: 'real_person',
        reason: 'Nomina una persona reale.',
        suggestion: 'Inventa un personaggio.',
      }).suggestion,
    ).toBe('Inventa un personaggio.');
  });

  it('senza un motivo non si può dire di no', () => {
    expect(moderationRejectionSchema.safeParse({ suggestion: 'Riscrivi.' }).success).toBe(false);
    expect(moderationRejectionSchema.safeParse({ reason: '' }).success).toBe(false);
  });

  it('è quello che il moderatore risponde, tolto il «sì o no»', () => {
    const verdict = moderatorOutputSchema.parse({
      allowed: false,
      category: 'real_person',
      reason: 'Nomina una persona reale.',
      suggestion: 'Inventa un personaggio.',
    });
    const rejection = moderatorOutputSchema.omit({ allowed: true }).parse(verdict);

    expect(moderationRejectionSchema.parse(rejection)).toEqual(rejection);
  });
});

describe('un errore di contenuto rifiutato', () => {
  it('porta il motivo del moderatore tra i dettagli, e arriva intero all’interfaccia', () => {
    const body = {
      code: 'content_rejected',
      retryable: false,
      details: { moderation: { reason: 'Nomina una persona reale.', suggestion: 'Inventa.' } },
    };

    expect(domainErrorSchema.parse(body)).toEqual(body);
  });
});

import { describe, expect, it } from 'vitest';

import { domainEventSchema } from './events.js';

describe('domainEventSchema', () => {
  it('accetta take.ready', () => {
    const event = {
      type: 'take.ready' as const,
      generationId: 'gen-1',
      shotId: 'shot-1',
      takeId: 'take-1',
      assetId: 'asset-1',
    };
    expect(domainEventSchema.parse(event)).toEqual(event);
  });

  it('accetta take.rejected con l\'errore del dominio (D36: niente "Riprova")', () => {
    const event = {
      type: 'take.rejected' as const,
      generationId: 'gen-1',
      shotId: 'shot-1',
      error: { code: 'content_rejected' as const, retryable: false },
    };
    const parsed = domainEventSchema.parse(event);
    if (parsed.type !== 'take.rejected') throw new Error('tipo inatteso');
    expect(parsed.error.retryable).toBe(false);
  });

  it('accetta continuity.flagged con origine e motivo in italiano (§8)', () => {
    const event = {
      type: 'continuity.flagged' as const,
      shotId: 'shot-2',
      code: 'R3',
      reason: 'Il volto di Marco è cambiato dopo un ritocco',
      origin: 'rule' as const,
    };
    const parsed = domainEventSchema.parse(event);
    if (parsed.type !== 'continuity.flagged') throw new Error('tipo inatteso');
    expect(parsed.origin).toBe('rule');
  });

  it('accetta export.ready', () => {
    const event = { type: 'export.ready' as const, projectId: 'proj-1', assetId: 'asset-9' };
    expect(domainEventSchema.parse(event)).toEqual(event);
  });

  it('rifiuta un tipo di evento inventato', () => {
    expect(
      domainEventSchema.safeParse({ type: 'take.cancelled', generationId: 'gen-1' }).success,
    ).toBe(false);
  });

  it("rifiuta take.failed senza l'errore", () => {
    expect(
      domainEventSchema.safeParse({ type: 'take.failed', generationId: 'gen-1', shotId: 'shot-1' })
        .success,
    ).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { domainEventSchema } from './events.js';

describe('job.changed (T4.4)', () => {
  it('dice che lavoro è, in che stato è e a cosa si riferisce', () => {
    const event = {
      type: 'job.changed' as const,
      jobId: 'j-1',
      kind: 'take_generate',
      status: 'running' as const,
      projectId: 'film-1',
      subjectId: 'shot-1',
    };

    expect(domainEventSchema.parse(event)).toEqual(event);
  });

  it('il film e l’oggetto sono facoltativi (un lavoro può non averli), lo stato no e non si inventa', () => {
    expect(
      domainEventSchema.safeParse({ type: 'job.changed', jobId: 'j-1', kind: 'x', status: 'done' })
        .success,
    ).toBe(true);
    expect(
      domainEventSchema.safeParse({ type: 'job.changed', jobId: 'j-1', kind: 'x', status: 'boh' })
        .success,
    ).toBe(false);
    expect(
      domainEventSchema.safeParse({ type: 'job.changed', jobId: 'j-1', kind: 'x' }).success,
    ).toBe(false);
  });
});

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

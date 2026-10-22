import { describe, expect, it } from 'vitest';

import { jobSchema, jobStatusSchema } from './jobs.js';

const lavoro = {
  id: 'job-1',
  kind: 'take.generate',
  status: 'queued' as const,
  payload: { shotId: 'shot-1', modelId: 'kling-o3-standard' },
  projectId: 'project-1',
  idempotencyKey: 'shot-1:abc',
  priority: 0,
  attempts: 0,
  maxAttempts: 3,
  runAfter: '2026-10-22T09:00:00.000Z',
  createdAt: '2026-10-22T09:00:00.000Z',
  updatedAt: '2026-10-22T09:00:00.000Z',
};

describe('jobSchema', () => {
  it('accetta un lavoro in coda', () => {
    expect(jobSchema.parse(lavoro).status).toBe('queued');
  });

  it('accetta un lavoro fallito con il suo codice e i suoi tempi', () => {
    const parsed = jobSchema.parse({
      ...lavoro,
      status: 'failed',
      attempts: 3,
      errorCode: 'provider_unavailable',
      errorMessage: 'Il servizio non ha risposto.',
      startedAt: '2026-10-22T09:00:01.000Z',
      finishedAt: '2026-10-22T09:00:40.000Z',
    });

    expect(parsed.errorCode).toBe('provider_unavailable');
  });

  it('un lavoro senza film e senza chiave di idempotenza va bene', () => {
    const senza = { ...lavoro, projectId: undefined, idempotencyKey: undefined };

    expect(jobSchema.safeParse(senza).success).toBe(true);
  });

  it('rifiuta uno stato inventato e tentativi negativi', () => {
    expect(jobStatusSchema.safeParse('in-corso').success).toBe(false);
    expect(jobSchema.safeParse({ ...lavoro, attempts: -1 }).success).toBe(false);
    expect(jobSchema.safeParse({ ...lavoro, maxAttempts: 0 }).success).toBe(false);
  });

  it('le date sono date, non testo qualunque', () => {
    expect(jobSchema.safeParse({ ...lavoro, runAfter: 'subito' }).success).toBe(false);
  });
});

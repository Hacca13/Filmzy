import { describe, expect, it } from 'vitest';

import {
  RETOUCH_INSTRUCTION_MAX_CHARS,
  locationAttemptSchema,
  retouchQuerySchema,
} from './locations-api.js';

describe('retouchQuerySchema (T4.9)', () => {
  const base = { assetId: 'a'.repeat(64) };

  it('«togli» non vuole parole; «sostituisci» e «cambia colore» sì', () => {
    expect(retouchQuerySchema.parse({ ...base, operation: 'remove' }).operation).toBe('remove');
    expect(
      retouchQuerySchema.parse({ ...base, operation: 'replace', instruction: 'una lampada' })
        .instruction,
    ).toBe('una lampada');
    expect(
      retouchQuerySchema.parse({ ...base, operation: 'recolor', instruction: 'blu' }).operation,
    ).toBe('recolor');
  });

  it('manca la richiesta dove serve, o c’è dove non serve: si rifiuta, col campo giusto', () => {
    const missing = retouchQuerySchema.safeParse({ ...base, operation: 'replace' });
    const extra = retouchQuerySchema.safeParse({ ...base, operation: 'remove', instruction: 'x' });

    expect(missing.success).toBe(false);
    expect(extra.success).toBe(false);
    expect(missing.error?.issues[0]?.path).toEqual(['instruction']);
    expect(extra.error?.issues[0]?.path).toEqual(['instruction']);
  });

  it("una richiesta vuota, troppo lunga, un'operazione inventata o un campo in più si rifiutano", () => {
    const long = 'a'.repeat(RETOUCH_INSTRUCTION_MAX_CHARS + 1);

    expect(
      retouchQuerySchema.safeParse({ ...base, operation: 'replace', instruction: '   ' }).success,
    ).toBe(false);
    expect(
      retouchQuerySchema.safeParse({ ...base, operation: 'replace', instruction: long }).success,
    ).toBe(false);
    expect(retouchQuerySchema.safeParse({ ...base, operation: 'dipingi' }).success).toBe(false);
    expect(retouchQuerySchema.safeParse({ ...base, operation: 'remove', altro: 1 }).success).toBe(
      false,
    );
  });

  it("il «sì, proseguo» del limite di spesa è la parola true, e nient'altro", () => {
    expect(
      retouchQuerySchema.parse({ ...base, operation: 'remove', spendConfirmed: 'true' })
        .spendConfirmed,
    ).toBe('true');
    expect(
      retouchQuerySchema.safeParse({ ...base, operation: 'remove', spendConfirmed: 'false' })
        .success,
    ).toBe(false);
  });
});

describe('un tentativo che è un ritocco', () => {
  const attempt = {
    attempt: 2,
    status: 'succeeded',
    createdAt: '2026-11-03T10:00:00.000Z',
    assetIds: ['b'.repeat(64)],
  };

  it('porta l’immagine di partenza e cosa è stato chiesto', () => {
    const parsed = locationAttemptSchema.parse({
      ...attempt,
      retouch: { sourceAssetId: 'a'.repeat(64), operation: 'replace', instruction: 'una lampada' },
    });

    expect(parsed.retouch).toEqual({
      sourceAssetId: 'a'.repeat(64),
      operation: 'replace',
      instruction: 'una lampada',
    });
    expect(locationAttemptSchema.parse(attempt).retouch).toBeUndefined();
  });
});

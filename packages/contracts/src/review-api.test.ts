import { describe, expect, it } from 'vitest';

import { ROLE_OUTPUT_EXAMPLES } from './examples.js';
import {
  draftReviewSchema,
  editFinalBodySchema,
  reviewDifferenceSchema,
  writeFinalBodySchema,
} from './review-api.js';
import { screenplaySchema } from './screenplay.js';

const screenplay = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

const difference = {
  key: 'character:not_chosen:oste',
  kind: 'character',
  reason: 'not_chosen',
  name: 'L’oste',
  choices: ['adapt', 'keep'],
};

describe('reviewDifferenceSchema', () => {
  it('accetta una differenza su cui l’utente decide e una solo da leggere', () => {
    expect(reviewDifferenceSchema.parse(difference)).toEqual(difference);
    expect(
      reviewDifferenceSchema.parse({ ...difference, reason: 'not_in_draft', choices: [] }).choices,
    ).toEqual([]);
  });

  it('rifiuta un tipo, un motivo o una risposta inventati', () => {
    expect(reviewDifferenceSchema.safeParse({ ...difference, kind: 'scene' }).success).toBe(false);
    expect(reviewDifferenceSchema.safeParse({ ...difference, reason: 'altro' }).success).toBe(
      false,
    );
    // «Cambia la mia scelta» non è una risposta: è tornare al cast o ai luoghi.
    expect(reviewDifferenceSchema.safeParse({ ...difference, choices: ['change'] }).success).toBe(
      false,
    );
  });
});

describe('draftReviewSchema', () => {
  it('senza differenze il passo si salta: l’elenco è vuoto, non assente', () => {
    expect(draftReviewSchema.parse({ draftVersionId: 'v-1', differences: [] }).differences).toEqual(
      [],
    );
    expect(draftReviewSchema.safeParse({ draftVersionId: 'v-1' }).success).toBe(false);
  });
});

describe('writeFinalBodySchema', () => {
  it('accetta le risposte e la conferma del limite di spesa', () => {
    const body = {
      answers: [{ key: 'character:not_chosen:oste', decision: 'keep' }],
      spendConfirmed: true,
    };
    expect(writeFinalBodySchema.parse(body)).toEqual(body);
    expect(writeFinalBodySchema.parse({ answers: [] }).answers).toEqual([]);
  });

  it('rifiuta una risposta inventata e un campo in più', () => {
    expect(
      writeFinalBodySchema.safeParse({ answers: [{ key: 'x', decision: 'change' }] }).success,
    ).toBe(false);
    expect(writeFinalBodySchema.safeParse({ answers: [], extra: 1 }).success).toBe(false);
    expect(writeFinalBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('editFinalBodySchema', () => {
  it('accetta il testo intero e rifiuta un testo che non è una sceneggiatura', () => {
    expect(editFinalBodySchema.parse({ screenplay }).screenplay.title).toBe(screenplay.title);
    expect(editFinalBodySchema.safeParse({ screenplay: { title: 'Solo il titolo' } }).success).toBe(
      false,
    );
  });
});

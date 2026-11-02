import { describe, expect, it } from 'vitest';

import { ROLE_OUTPUT_EXAMPLES } from './examples.js';
import {
  REVISION_REQUEST_MAX_LENGTH,
  reviseBodySchema,
  screenplayEstimateBodySchema,
  screenplayVersionSchema,
  screenplayVersionSummarySchema,
  writeDraftBodySchema,
} from './screenplay-api.js';
import { screenplaySchema } from './screenplay.js';

const screenplay = screenplaySchema.parse(ROLE_OUTPUT_EXAMPLES.screenwriter);

const version = {
  id: 'v-1',
  projectId: 'film-1',
  stage: 'draft',
  version: 1,
  screenplay,
  createdAt: '2026-10-28T10:00:00.000Z',
};

describe('screenplayVersionSchema', () => {
  it('accetta una bozza senza richiesta (scritta da zero) e una con la richiesta che l’ha prodotta', () => {
    expect(screenplayVersionSchema.parse(version)).toEqual(version);
    expect(
      screenplayVersionSchema.parse({ ...version, version: 2, request: 'Rendila più cupa' })
        .request,
    ).toBe('Rendila più cupa');
  });

  it('rifiuta una tappa inventata e un numero di versione che non parte da 1', () => {
    expect(screenplayVersionSchema.safeParse({ ...version, stage: 'bozza' }).success).toBe(false);
    expect(screenplayVersionSchema.safeParse({ ...version, version: 0 }).success).toBe(false);
  });

  it('l’elenco ha il titolo ma non il testo intero', () => {
    const parsed = screenplayVersionSummarySchema.parse({ ...version, title: screenplay.title });

    expect(parsed.title).toBe(screenplay.title);
    // Il testo intero non entra nell'elenco: lo schema lo scarta anche se glielo si dà.
    expect('screenplay' in parsed).toBe(false);
  });
});

describe('i corpi delle richieste', () => {
  it('«Scrivi la bozza» non vuole niente, o solo la conferma del limite di spesa', () => {
    expect(writeDraftBodySchema.parse({})).toEqual({});
    expect(writeDraftBodySchema.parse({ spendConfirmed: true })).toEqual({ spendConfirmed: true });
    expect(writeDraftBodySchema.safeParse({ idea: 'altro' }).success).toBe(false);
  });

  it('una richiesta di modifica ha del testo, senza spazi attorno e non troppo lungo', () => {
    expect(reviseBodySchema.parse({ request: '  Rendila più cupa  ' }).request).toBe(
      'Rendila più cupa',
    );
    expect(reviseBodySchema.safeParse({ request: '   ' }).success).toBe(false);
    expect(
      reviseBodySchema.safeParse({ request: 'a'.repeat(REVISION_REQUEST_MAX_LENGTH + 1) }).success,
    ).toBe(false);
  });

  it('la stima può riguardare la bozza o una modifica', () => {
    expect(screenplayEstimateBodySchema.parse({ mode: 'draft' })).toEqual({ mode: 'draft' });
    expect(screenplayEstimateBodySchema.parse({ mode: 'revise', request: 'Più breve' })).toEqual({
      mode: 'revise',
      request: 'Più breve',
    });
    expect(screenplayEstimateBodySchema.safeParse({ mode: 'final' }).success).toBe(false);
  });
});

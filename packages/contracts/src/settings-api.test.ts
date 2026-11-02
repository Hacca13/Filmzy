import { describe, expect, it } from 'vitest';

import {
  appPreferencesSchema,
  DEFAULT_APP_PREFERENCES,
  draftViewSchema,
  publishBodySchema,
  publishResponseSchema,
  secretsViewSchema,
  setSecretBodySchema,
  updateCheckResultSchema,
} from './settings-api.js';

describe('publishBodySchema', () => {
  it('toglie gli spazi dalla nota', () => {
    expect(publishBodySchema.parse({ note: '  Nuovo modello  ' })).toEqual({
      note: 'Nuovo modello',
    });
  });

  it.each([{}, { note: '' }, { note: '   ' }, { note: 'a'.repeat(501) }])(
    'rifiuta %j',
    (invalid) => {
      expect(publishBodySchema.safeParse(invalid).success).toBe(false);
    },
  );
});

describe('setSecretBodySchema', () => {
  it('toglie gli spazi dalla chiave incollata', () => {
    expect(setSecretBodySchema.parse({ value: ' sk-abc \n' })).toEqual({ value: 'sk-abc' });
  });

  it.each([{}, { value: '' }, { value: '  ' }, { value: 'k'.repeat(4097) }])(
    'rifiuta %j',
    (invalid) => {
      expect(setSecretBodySchema.safeParse(invalid).success).toBe(false);
    },
  );
});

describe('secretsViewSchema', () => {
  it('descrive le chiavi senza il loro valore', () => {
    const view = {
      secrets: [{ name: 'FAL_KEY', source: 'env', present: false, connectionIds: ['fal'] }],
      writable: false,
    };
    expect(secretsViewSchema.parse(view)).toEqual(view);
  });

  it('scarta un valore che qualcuno provasse ad aggiungere', () => {
    const parsed = secretsViewSchema.parse({
      secrets: [
        { name: 'FAL_KEY', source: 'env', present: true, connectionIds: [], value: 'segreto' },
      ],
      writable: true,
    });
    expect(parsed.secrets[0]).not.toHaveProperty('value');
  });
});

describe('appPreferencesSchema', () => {
  it('i valori di partenza sono audio spento e controllo acceso (D43, D44)', () => {
    expect(appPreferencesSchema.parse(DEFAULT_APP_PREFERENCES)).toEqual({
      takeAudio: false,
      checkForUpdates: true,
    });
  });

  it('rifiuta una preferenza che non è sì o no', () => {
    expect(appPreferencesSchema.safeParse({ takeAudio: 'no', checkForUpdates: true }).success).toBe(
      false,
    );
  });
});

describe('updateCheckResultSchema', () => {
  it.each([
    { status: 'up_to_date' },
    { status: 'available', version: '0.4.0' },
    { status: 'unavailable' },
  ])('accetta %j', (result) => {
    expect(updateCheckResultSchema.parse(result)).toEqual(result);
  });

  it.each([{ status: 'available' }, { status: 'boh' }])('rifiuta %j', (invalid) => {
    expect(updateCheckResultSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('risposte con problemi', () => {
  it('una pubblicazione rifiutata ha i problemi e nessuna release', () => {
    const response = {
      issues: [{ severity: 'error', code: 'no_draft', message: "Non c'è nessuna bozza." }],
    };
    expect(publishResponseSchema.parse(response)).toEqual(response);
  });

  it('la vista della bozza richiede la configurazione intera', () => {
    expect(
      draftViewSchema.safeParse({ hasDraft: false, hasUnpublishedChanges: false, issues: [] })
        .success,
    ).toBe(false);
  });
});

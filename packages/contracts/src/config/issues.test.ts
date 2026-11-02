import { describe, expect, it } from 'vitest';

import { configIssueSchema } from './issues.js';

describe('configIssueSchema', () => {
  it('accetta un errore che nomina ruolo, modello e campo', () => {
    const issue = {
      severity: 'error',
      code: 'param_not_accepted',
      message: 'Il ruolo "screenwriter" chiede temperature, che il modello non accetta.',
      section: 'roles',
      key: 'screenwriter',
      role: 'screenwriter',
      modelId: 'claude-sonnet',
      field: 'params.temperature',
    };
    expect(configIssueSchema.parse(issue)).toEqual(issue);
  });

  it('accetta un avviso con i soli campi obbligatori', () => {
    const issue = { severity: 'warning', code: 'price_old', message: 'Il prezzo è vecchio.' };
    expect(configIssueSchema.parse(issue)).toEqual(issue);
  });

  it.each([
    { severity: 'info', code: 'x', message: 'm' },
    { severity: 'error', message: 'senza codice' },
    { severity: 'error', code: 'x', message: '' },
    { severity: 'error', code: 'x', message: 'm', section: 'inventata' },
  ])('rifiuta %j', (invalid) => {
    expect(configIssueSchema.safeParse(invalid).success).toBe(false);
  });
});

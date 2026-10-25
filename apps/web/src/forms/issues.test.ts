import { connectionSchema, paramSpecSchema, roleConfigEntrySchema } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { validate } from './issues';

const validConnection = {
  adapter: 'fake',
  api_key: 'none',
  timeout_s: 60,
  max_concurrency: 1,
  enabled: true,
};

describe('validate', () => {
  it('un valore giusto non ha problemi', () => {
    expect(validate(connectionSchema, validConnection).size).toBe(0);
  });

  it('indica il campo sbagliato, in parole semplici', () => {
    const issues = validate(connectionSchema, {
      ...validConnection,
      api_key: 'sbagliata',
      timeout_s: -1,
      enabled: 'si',
    });

    expect([...issues.keys()].sort()).toEqual(['api_key', 'enabled', 'timeout_s']);
    expect(issues.get('api_key')).toEqual(['Il formato non è quello giusto.']);
    expect(issues.get('timeout_s')).toEqual(['Deve essere più di 0.']);
    expect(issues.get('enabled')).toEqual(['Manca questo valore, oppure non è del tipo giusto.']);
  });

  it('un campo mancante e uno vuoto non sono la stessa cosa', () => {
    const issues = validate(connectionSchema, { ...validConnection, adapter: undefined });

    expect(issues.get('adapter')).toEqual(['Manca questo valore, oppure non è del tipo giusto.']);
  });

  it("un indirizzo sbagliato dice com'è fatto uno giusto", () => {
    const issues = validate(connectionSchema, { ...validConnection, base_url: 'non-un-indirizzo' });

    expect(issues.get('base_url')?.[0]).toContain('https://');
  });

  it('fra le alternative mostra quella che sbaglia di meno, col percorso intero', () => {
    const issues = validate(z.object({ p: paramSpecSchema }), { p: { min: 'a' } });

    expect([...issues.keys()]).toEqual(['p.min']);
  });

  it('un controllo fra due campi sta sulla voce intera, col messaggio dei contratti', () => {
    const issues = validate(roleConfigEntrySchema, { label: 'Ruolo', kind: 'llm' });

    expect(issues.get('')?.[0]).toContain('model e routing');
  });

  it('un campo non previsto in un oggetto chiuso lo nomina', () => {
    const issues = validate(connectionSchema, { ...validConnection, inventato: 1 });

    expect(issues.get('')?.[0]).toContain('inventato');
  });
});

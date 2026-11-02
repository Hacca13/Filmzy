import { describe, expect, it } from 'vitest';

import { checkRules, rulesSchema, valuesAt } from './eval-rules.js';

const output = {
  allowed: false,
  scenes: [
    { number: 1, durationS: 20, characterIds: ['anna', 'marco'] },
    { number: 2, durationS: 30, characterIds: ['anna'] },
  ],
  characters: [],
};
const input = {
  characters: [
    { id: 'anna', name: 'Anna' },
    { id: 'marco', name: 'Marco' },
  ],
};

describe('valuesAt', () => {
  it('segue il percorso, scorre gli elenchi con [*] e appiattisce un elenco in fondo', () => {
    expect(valuesAt(output, 'allowed')).toEqual([false]);
    expect(valuesAt(output, 'scenes[*].number')).toEqual([1, 2]);
    expect(valuesAt(output, 'scenes[*].characterIds')).toEqual(['anna', 'marco', 'anna']);
    expect(valuesAt(input, 'characters[*].id')).toEqual(['anna', 'marco']);
  });

  it('un percorso che non c’è non dà niente, senza errori', () => {
    expect(valuesAt(output, 'non.esiste')).toEqual([]);
    expect(valuesAt(output, 'allowed.dentro')).toEqual([]);
    expect(valuesAt(output, 'allowed[*]')).toEqual([]);
    expect(valuesAt(null, 'a')).toEqual([]);
  });
});

describe('checkRules', () => {
  const check = (rules: unknown) => checkRules(output, input, rulesSchema.parse(rules));

  it('senza regole non c’è niente da dire', () => {
    expect(checkRules(output, input, undefined)).toEqual([]);
    expect(check({})).toEqual([]);
  });

  it('le regole sul testo valgono sulla risposta intera, o sul prompt se la risposta ne ha uno', () => {
    expect(check({ contains: ['anna'], notContains: ['luca'], maxChars: 500 })).toEqual([]);
    expect(check({ contains: ['luca'] })).toEqual(['manca "luca"']);
    expect(check({ notContains: ['marco'] })).toEqual(['non dovrebbe contenere "marco"']);
    expect(check({ maxChars: 10 })[0]).toContain('il massimo è 10');
    expect(checkRules({ prompt: 'corto', altro: 'x'.repeat(500) }, {}, { maxChars: 10 })).toEqual(
      [],
    );
  });

  it('equals: il valore al percorso è quello atteso', () => {
    expect(check({ equals: { allowed: false } })).toEqual([]);
    expect(check({ equals: { allowed: true } })).toEqual([
      '"allowed" dovrebbe essere true, è false',
    ]);
    expect(check({ equals: { assente: 1 } })[0]).toContain('è undefined');
  });

  it('count: quanti valori ci sono al percorso', () => {
    expect(check({ count: { scenes: { min: 2, max: 2 }, characters: { max: 0 } } })).toEqual([]);
    expect(check({ count: { scenes: { min: 3 } } })).toEqual([
      '"scenes" ha 2 elementi, ne servono almeno 3',
    ]);
    expect(check({ count: { 'scenes[*].characterIds': { max: 2 } } })[0]).toContain(
      'ha 3 elementi',
    );
  });

  it('con lo stesso minimo e massimo il messaggio dice «esattamente»', () => {
    expect(check({ count: { scenes: { min: 3, max: 3 } } })).toEqual([
      '"scenes" ha 2 elementi, ne servono esattamente 3',
    ]);
  });

  it('range: ogni numero sta tra i limiti', () => {
    expect(check({ range: [{ values: 'scenes[*].durationS', min: 10, max: 30 }] })).toEqual([]);
    expect(check({ range: [{ values: 'scenes[*].durationS', max: 25 }] })).toEqual([
      '"scenes[*].durationS" ha 30, deve essere al massimo 25',
    ]);
  });

  it('sum: il totale sta tra i limiti', () => {
    expect(check({ sum: [{ values: 'scenes[*].durationS', min: 45, max: 55 }] })).toEqual([]);
    expect(check({ sum: [{ values: 'scenes[*].durationS', min: 60 }] })).toEqual([
      'la somma di "scenes[*].durationS" è 50, deve essere almeno 60',
    ]);
  });

  it('subset: si citano solo cose che l’ingresso ha dato', () => {
    const rule = { subset: [{ values: 'scenes[*].characterIds', of: 'characters[*].id' }] };
    expect(check(rule)).toEqual([]);
    expect(
      checkRules(
        { scenes: [{ characterIds: ['anna', 'fantasma'] }] },
        input,
        rulesSchema.parse(rule),
      ),
    ).toEqual([
      '"scenes[*].characterIds" cita "fantasma", che non c\'è in "characters[*].id" dell\'ingresso',
    ]);
  });

  it('disjoint: non si ripete niente di ciò che c’era già', () => {
    const rule = { disjoint: [{ values: 'scenes[*].characterIds', from: 'characters[*].id' }] };
    expect(check(rule)).toHaveLength(3);
    expect(
      checkRules({ scenes: [{ characterIds: ['luca'] }] }, input, rulesSchema.parse(rule)),
    ).toEqual([]);
  });
});

describe('rulesSchema', () => {
  it('rifiuta una regola inventata o con un campo sbagliato, invece di ignorarla in silenzio', () => {
    expect(rulesSchema.safeParse({ subset: [{ values: 'a' }] }).success).toBe(false);
    expect(rulesSchema.safeParse({ range: [{ values: 'a', massimo: 3 }] }).success).toBe(false);
    expect(rulesSchema.safeParse({ count: { a: { min: 'molti' } } }).success).toBe(false);
  });
});

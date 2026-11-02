import { describe, expect, it } from 'vitest';

import { checkRules, rulesSchema, valuesAt } from './eval-rules.js';

const output = {
  allowed: false,
  scenes: [
    { number: 1, durationS: 20, characterIds: ['anna', 'marco'] },
    { number: 2, durationS: 30, characterIds: ['anna'] },
  ],
  characters: [],
  suggestions: [
    { action: 'new', name: 'Luca' },
    { action: 'reuse', name: 'Anna' },
  ],
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

  it('[0] prende l’elemento in quella posizione, [campo=valore] quelli che hanno quel valore', () => {
    expect(valuesAt(output, 'scenes[0].durationS')).toEqual([20]);
    expect(valuesAt(output, 'scenes[5].durationS')).toEqual([]);
    expect(valuesAt(output, 'suggestions[action=new].name')).toEqual(['Luca']);
    expect(valuesAt(output, 'suggestions[action=boh].name')).toEqual([]);
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

  it('le regole sul testo non badano alle maiuscole e guardano i testi, non i nomi dei campi', () => {
    expect(check({ contains: ['ANNA'], notContains: ['zzz'], maxChars: 500 })).toEqual([]);
    expect(check({ contains: ['zzz'] })).toEqual(['manca "zzz"']);
    expect(check({ notContains: ['fantasma'] })).toEqual([]);
    expect(check({ notContains: ['LUCA'] })).toEqual(['non dovrebbe contenere "LUCA"']);
    // I nomi dei campi ("allowed", "scenes") non sono testo della risposta.
    expect(check({ notContains: ['allowed', 'scenes'] })).toEqual([]);
    expect(check({ maxChars: 3 })[0]).toContain('il massimo è 3');
  });

  it('le virgolette non rovinano la ricerca: si cercano nei testi, non in un JSON', () => {
    expect(
      checkRules({ nota: 'Ha detto "basta" e se n’è andata' }, {}, { contains: ['"basta"'] }),
    ).toEqual([]);
  });

  it('con un prompt le regole sul testo guardano solo quello', () => {
    expect(checkRules({ prompt: 'corto', altro: 'x'.repeat(500) }, {}, { maxChars: 10 })).toEqual(
      [],
    );
    expect(checkRules({ prompt: 'corto', altro: 'luca' }, {}, { notContains: ['luca'] })).toEqual(
      [],
    );
  });

  it('equals: tutti i valori al percorso sono quello atteso, e ce n’è almeno uno', () => {
    expect(check({ equals: { allowed: false } })).toEqual([]);
    expect(check({ equals: { allowed: true } })).toEqual([
      '"allowed" dovrebbe essere true, è false',
    ]);
    expect(check({ equals: { assente: 1 } })).toEqual([
      '"assente" non ha nessun valore, doveva essere 1',
    ]);
    expect(check({ equals: { 'scenes[*].number': 1 } })[0]).toContain('è [1,2]');
    expect(check({ equals: { 'scenes[0].number': 1 } })).toEqual([]);
  });

  it('equals con un elenco: i valori sono proprio quell’elenco', () => {
    expect(check({ equals: { 'scenes[*].characterIds': ['anna', 'marco', 'anna'] } })).toEqual([]);
    expect(check({ equals: { 'scenes[*].characterIds': ['anna'] } })).toHaveLength(1);
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

  it('range: ogni numero sta tra i limiti; un percorso senza numeri è un errore', () => {
    expect(check({ range: [{ values: 'scenes[*].durationS', min: 10, max: 30 }] })).toEqual([]);
    expect(check({ range: [{ values: 'scenes[*].durationS', max: 25 }] })).toEqual([
      '"scenes[*].durationS" ha 30, deve essere al massimo 25',
    ]);
    expect(check({ range: [{ values: 'scenes[*].durataS', max: 25 }] })).toEqual([
      '"scenes[*].durataS" non ha nessun numero da controllare',
    ]);
  });

  it('sum: il totale sta tra i limiti, senza errori di arrotondamento; un percorso senza numeri è un errore', () => {
    expect(check({ sum: [{ values: 'scenes[*].durationS', min: 45, max: 55 }] })).toEqual([]);
    expect(check({ sum: [{ values: 'scenes[*].durationS', min: 60 }] })).toEqual([
      'la somma di "scenes[*].durationS" è 50, deve essere almeno 60',
    ]);
    expect(checkRules({ n: [0.1, 0.2] }, {}, { sum: [{ values: 'n', max: 0.3 }] })).toEqual([]);
    expect(check({ sum: [{ values: 'niente', max: 5 }] })).toEqual([
      '"niente" non ha nessun numero da sommare',
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

  it('disjoint: non si ripete niente di ciò che c’era già, e il filtro lascia fuori i riusi', () => {
    const all = { disjoint: [{ values: 'suggestions[*].name', from: 'characters[*].name' }] };
    const onlyNew = {
      disjoint: [{ values: 'suggestions[action=new].name', from: 'characters[*].name' }],
    };

    expect(check(all)).toEqual([
      '"suggestions[*].name" ripete "Anna", che c\'è già in "characters[*].name" dell\'ingresso',
    ]);
    expect(check(onlyNew)).toEqual([]);
  });
});

describe('rulesSchema', () => {
  it('rifiuta una regola inventata o con un campo sbagliato, invece di ignorarla in silenzio', () => {
    expect(rulesSchema.safeParse({ notcontains: ['x'] }).success).toBe(false);
    expect(rulesSchema.safeParse({ maxChar: 5 }).success).toBe(false);
    expect(rulesSchema.safeParse({ subset: [{ values: 'a' }] }).success).toBe(false);
    expect(rulesSchema.safeParse({ range: [{ values: 'a', massimo: 3 }] }).success).toBe(false);
    expect(rulesSchema.safeParse({ count: { a: { min: 'molti' } } }).success).toBe(false);
  });

  it('rifiuta un percorso rotto e accetta quelli con indice e filtro', () => {
    expect(rulesSchema.safeParse({ equals: { 'scenes[*': 1 } }).success).toBe(false);
    expect(rulesSchema.safeParse({ equals: { 'a..b': 1 } }).success).toBe(false);
    expect(rulesSchema.safeParse({ equals: { 'a[]': 1 } }).success).toBe(false);
    expect(rulesSchema.safeParse({ equals: { 'shots[0].continuity.entry': 1 } }).success).toBe(
      true,
    );
    expect(
      rulesSchema.safeParse({ count: { 'suggestions[action=new].name': { min: 1 } } }).success,
    ).toBe(true);
  });
});

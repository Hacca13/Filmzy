import {
  connectionSchema,
  featuresSchema,
  limitsSchema,
  modelEntrySchema,
  modelPricingSchema,
  roleConfigEntrySchema,
  stylePresetSchema,
} from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  classify,
  defaultValue,
  pickVariant,
  toFormSchema,
  variantLabel,
  withField,
  type JsonSchema,
} from './json-schema';

function kindOf(schema: z.ZodType) {
  return classify(toFormSchema(schema));
}

describe('classify', () => {
  it('riconosce i campi semplici', () => {
    expect(kindOf(z.string())).toEqual({ kind: 'text' });
    expect(kindOf(z.boolean())).toEqual({ kind: 'switch' });
    expect(kindOf(z.enum(['a', 'b']))).toEqual({ kind: 'choice', options: ['a', 'b'] });
    expect(kindOf(z.literal('polling'))).toEqual({ kind: 'fixed', value: 'polling' });
  });

  it('distingue interi e decimali, con i limiti', () => {
    expect(kindOf(z.number().int().min(1).max(10))).toEqual({
      kind: 'number',
      integer: true,
      min: 1,
      max: 10,
    });
    expect(kindOf(z.number())).toEqual({ kind: 'number', integer: false });
  });

  it('non prende per un limite il «nessun massimo» di Zod sugli interi', () => {
    expect(kindOf(z.number().int())).toEqual({ kind: 'number', integer: true });
  });

  it('un valore che può essere testo, numero o sì/no si sceglie fra tre varianti', () => {
    const kind = kindOf(z.union([z.string(), z.number(), z.boolean()]));

    expect(kind.kind).toBe('variants');
    expect(kind.kind === 'variants' ? kind.variants.map((v, i) => variantLabel(v, i)) : []).toEqual(
      ['Testo', 'Numero', 'Sì o no'],
    );
  });

  it('un oggetto è un gruppo, e i campi facoltativi lo restano', () => {
    const kind = kindOf(z.object({ nome: z.string(), nota: z.string().optional() }));

    expect(kind).toMatchObject({
      kind: 'group',
      fields: [
        { name: 'nome', required: true },
        { name: 'nota', required: false },
      ],
    });
  });

  it('un oggetto chiuso (strictObject) lo dice', () => {
    expect(kindOf(z.strictObject({ a: z.string() }))).toMatchObject({ closed: true });
    expect(kindOf(z.object({ a: z.string() }))).toMatchObject({ closed: false });
  });

  it('una mappa con le chiavi scelte da un elenco le conosce', () => {
    expect(kindOf(z.partialRecord(z.enum(['uno', 'due']), z.number()))).toMatchObject({
      kind: 'map',
      keys: ['uno', 'due'],
    });
    expect(kindOf(z.record(z.string(), z.number()))).toMatchObject({ kind: 'map' });
  });

  it('un elenco ha il suo tipo di elemento', () => {
    expect(kindOf(z.array(z.string()))).toMatchObject({ kind: 'list', item: { type: 'string' } });
  });

  it('scarta fra le alternative il tipo che il JSON Schema non sa dire (una data JS)', () => {
    expect(kindOf(z.union([z.iso.date(), z.date()]))).toEqual({ kind: 'text' });
  });

  it('un valore libero si modifica come JSON', () => {
    expect(kindOf(z.record(z.string(), z.unknown()))).toMatchObject({
      kind: 'map',
      value: {},
    });
    expect(kindOf(z.unknown())).toEqual({ kind: 'raw' });
  });
});

/** Ogni campo che i contratti dichiarano deve avere un disegno: niente «non so come mostrarlo». */
function rawPaths(schema: JsonSchema, path = ''): string[] {
  const kind = classify(schema);
  switch (kind.kind) {
    case 'raw':
      return [path];
    case 'group':
      return kind.fields.flatMap((field) => rawPaths(field.schema, `${path}.${field.name}`));
    case 'map':
      return rawPaths(kind.value, `${path}.*`);
    case 'list':
      return rawPaths(kind.item, `${path}[]`);
    case 'variants':
      return kind.variants.flatMap((variant) => rawPaths(variant, path));
    default:
      return [];
  }
}

describe('gli schemi della configurazione si disegnano per intero', () => {
  it.each([
    ['connessione', connectionSchema, []],
    ['ruolo', roleConfigEntrySchema, []],
    ['funzioni', featuresSchema, []],
    ['limiti', limitsSchema, []],
    ['stile', stylePresetSchema, []],
    // I voti delle prove sono l'unico valore libero che il catalogo ammette.
    ['modello', modelEntrySchema, ['.quality.*']],
  ])('%s', (_name, schema, allowed) => {
    expect([...new Set(rawPaths(toFormSchema(schema)))]).toEqual(allowed);
  });
});

describe('defaultValue', () => {
  it('una voce nuova ha solo i campi obbligatori, con un valore che si vede', () => {
    expect(defaultValue(toFormSchema(connectionSchema))).toEqual({
      adapter: '',
      api_key: '',
      timeout_s: 1,
      max_concurrency: 1,
      enabled: false,
    });
  });

  it('una mappa e un elenco partono vuoti', () => {
    expect(defaultValue(toFormSchema(z.record(z.string(), z.number())))).toEqual({});
    expect(defaultValue(toFormSchema(z.array(z.string())))).toEqual([]);
  });

  it('con più varianti parte dalla prima', () => {
    const value = defaultValue(toFormSchema(modelEntrySchema)) as { kind: string };

    expect(value.kind).toBe('llm');
  });
});

describe('pickVariant', () => {
  const models = classify(toFormSchema(modelEntrySchema));
  const variants = models.kind === 'variants' ? models.variants : [];

  it('sceglie il tipo di servizio dal valore fisso che lo distingue', () => {
    const labels = variants.map((variant, index) => variantLabel(variant, index));

    expect(labels).toEqual(['llm', 'image', 'video', 'music', 'sfx', 'voice']);
    expect(variants[pickVariant(variants, { kind: 'video', label: 'x' })]).toBeDefined();
    expect(pickVariant(variants, { kind: 'video' })).toBe(2);
    expect(pickVariant(variants, { kind: 'voice' })).toBe(5);
  });

  it("sceglie il prezzo dall'unità", () => {
    const pricing = classify(toFormSchema(modelPricingSchema));
    const pricingVariants = pricing.kind === 'variants' ? pricing.variants : [];

    expect(pickVariant(pricingVariants, { unit: 'per_second', value: 0.3 })).toBe(2);
    expect(pickVariant(pricingVariants, { unit: 'per_mtok', input: 1, output: 2 })).toBe(0);
  });

  it('fra due oggetti chiusi sceglie quello che ha i campi del valore', () => {
    const range = classify(
      toFormSchema(
        z.union([
          z.strictObject({ min: z.number().optional() }),
          z.strictObject({ values: z.array(z.string()) }),
        ]),
      ),
    );
    const options = range.kind === 'variants' ? range.variants : [];

    expect(pickVariant(options, { values: ['a'] })).toBe(1);
    expect(pickVariant(options, { min: 1 })).toBe(0);
  });
});

describe('withField', () => {
  it("cambiando un campo che c'è già l'ordine resta lo stesso", () => {
    const next = withField({ a: 1, b: 2, c: 3 }, 'b', 9);

    expect(Object.keys(next)).toEqual(['a', 'b', 'c']);
    expect(next.b).toBe(9);
  });

  it('un campo nuovo va in fondo, e con undefined sparisce', () => {
    expect(Object.keys(withField({ a: 1 }, 'z', 2))).toEqual(['a', 'z']);
    expect(withField({ a: 1, b: 2 }, 'a', undefined)).toEqual({ b: 2 });
  });
});

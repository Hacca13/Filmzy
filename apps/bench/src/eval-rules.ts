import { z } from 'zod';

/**
 * Le regole semplici delle valutazioni (architettura §4.13, T3.10): solo cose verificabili, niente
 * giudizi di gusto. Le regole sul testo (`maxChars`, `contains`, `notContains`) valgono sul
 * `prompt` della risposta se c'è, altrimenti su tutta la risposta scritta in JSON. Le altre
 * guardano i campi: un percorso come `scenes[*].characterIds` indica tutti i personaggi citati
 * dalle scene (`[*]` scorre un elenco, e un elenco in fondo al percorso si appiattisce).
 *
 * I percorsi `values` valgono sulla **risposta**; `of` e `from` sull'**ingresso** dell'esempio:
 * così si controlla, per esempio, che la stesura citi solo i personaggi che le sono stati dati.
 */

const path = z.string().min(1);
const bounds = { min: z.number().optional(), max: z.number().optional() };

export const rulesSchema = z.object({
  maxChars: z.number().int().positive().optional(),
  contains: z.array(z.string().min(1)).optional(),
  notContains: z.array(z.string().min(1)).optional(),
  /** Il valore al percorso (primo che si trova) è proprio questo: `{ "allowed": false }`. */
  equals: z.record(path, z.unknown()).optional(),
  /** Quanti valori ci sono al percorso: `{ "suggestions": { "min": 2, "max": 2 } }`. */
  count: z
    .record(
      path,
      z.strictObject({ min: z.number().int().optional(), max: z.number().int().optional() }),
    )
    .optional(),
  /** Ogni numero al percorso sta tra `min` e `max`. */
  range: z.array(z.strictObject({ values: path, ...bounds })).optional(),
  /** La somma dei numeri al percorso sta tra `min` e `max`. */
  sum: z.array(z.strictObject({ values: path, ...bounds })).optional(),
  /** Tutti i valori della risposta stanno fra quelli dell'ingresso. */
  subset: z.array(z.strictObject({ values: path, of: path })).optional(),
  /** Nessun valore della risposta è fra quelli dell'ingresso (per esempio: niente doppioni). */
  disjoint: z.array(z.strictObject({ values: path, from: path })).optional(),
});

export type EvalRules = z.infer<typeof rulesSchema>;

/** I valori a un percorso; un elenco in fondo si appiattisce di un livello, un percorso assente non dà nulla. */
export function valuesAt(root: unknown, valuePath: string): unknown[] {
  let current: unknown[] = [root];
  for (const segment of valuePath.split('.')) {
    const spread = segment.endsWith('[*]');
    const key = spread ? segment.slice(0, -3) : segment;
    current = current.flatMap((value) => {
      if (typeof value !== 'object' || value === null) return [];
      const next = (value as Record<string, unknown>)[key];
      if (next === undefined) return [];
      return spread ? (Array.isArray(next) ? (next as unknown[]) : []) : [next];
    });
  }
  return current.flatMap((value) => (Array.isArray(value) ? (value as unknown[]) : [value]));
}

const show = (value: unknown): string => JSON.stringify(value);

/** Il testo su cui valgono le regole di parole: il prompt dei ruoli che ne scrivono uno, altrimenti tutto. */
function checkedText(output: unknown): string {
  if (typeof output === 'object' && output !== null && 'prompt' in output) {
    const { prompt } = output;
    if (typeof prompt === 'string') return prompt;
  }
  return JSON.stringify(output);
}

const numbersAt = (output: unknown, valuePath: string): number[] =>
  valuesAt(output, valuePath).filter((value): value is number => typeof value === 'number');

function outside(value: number, limits: { min?: number | undefined; max?: number | undefined }) {
  return (
    (limits.min !== undefined && value < limits.min) ||
    (limits.max !== undefined && value > limits.max)
  );
}

const limitsText = (limits: { min?: number | undefined; max?: number | undefined }): string =>
  limits.min !== undefined && limits.min === limits.max
    ? `esattamente ${String(limits.min)}`
    : [
        limits.min === undefined ? undefined : `almeno ${String(limits.min)}`,
        limits.max === undefined ? undefined : `al massimo ${String(limits.max)}`,
      ]
        .filter((part) => part !== undefined)
        .join(' e ');

/** Cosa non va nella risposta secondo le regole: vuoto se è tutto a posto. */
export function checkRules(
  output: unknown,
  input: unknown,
  rules: EvalRules | undefined,
): string[] {
  if (rules === undefined) return [];
  const problems: string[] = [];

  const text = checkedText(output);
  if (rules.maxChars !== undefined && text.length > rules.maxChars) {
    problems.push(
      `la risposta è lunga ${String(text.length)} caratteri, il massimo è ${String(rules.maxChars)}`,
    );
  }
  for (const needle of rules.contains ?? []) {
    if (!text.includes(needle)) problems.push(`manca "${needle}"`);
  }
  for (const needle of rules.notContains ?? []) {
    if (text.includes(needle)) problems.push(`non dovrebbe contenere "${needle}"`);
  }

  for (const [valuePath, expected] of Object.entries(rules.equals ?? {})) {
    const [found] = valuesAt(output, valuePath);
    if (show(found) !== show(expected)) {
      problems.push(`"${valuePath}" dovrebbe essere ${show(expected)}, è ${show(found)}`);
    }
  }

  for (const [valuePath, limits] of Object.entries(rules.count ?? {})) {
    const found = valuesAt(output, valuePath).length;
    if (outside(found, limits)) {
      problems.push(
        `"${valuePath}" ha ${String(found)} elementi, ne servono ${limitsText(limits)}`,
      );
    }
  }

  for (const rule of rules.range ?? []) {
    for (const value of numbersAt(output, rule.values)) {
      if (outside(value, rule)) {
        problems.push(`"${rule.values}" ha ${String(value)}, deve essere ${limitsText(rule)}`);
      }
    }
  }

  for (const rule of rules.sum ?? []) {
    const total = numbersAt(output, rule.values).reduce((sum, value) => sum + value, 0);
    if (outside(total, rule)) {
      problems.push(
        `la somma di "${rule.values}" è ${String(Math.round(total * 100) / 100)}, deve essere ${limitsText(rule)}`,
      );
    }
  }

  for (const rule of rules.subset ?? []) {
    const allowed = new Set(valuesAt(input, rule.of).map(show));
    for (const value of valuesAt(output, rule.values)) {
      if (!allowed.has(show(value))) {
        problems.push(
          `"${rule.values}" cita ${show(value)}, che non c'è in "${rule.of}" dell'ingresso`,
        );
      }
    }
  }

  for (const rule of rules.disjoint ?? []) {
    const taken = new Set(valuesAt(input, rule.from).map(show));
    for (const value of valuesAt(output, rule.values)) {
      if (taken.has(show(value))) {
        problems.push(
          `"${rule.values}" ripete ${show(value)}, che c'è già in "${rule.from}" dell'ingresso`,
        );
      }
    }
  }

  return problems;
}

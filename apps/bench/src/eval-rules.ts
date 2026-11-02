import { z } from 'zod';

/**
 * Le regole semplici delle valutazioni (architettura §4.13, T3.10): solo cose verificabili, niente
 * giudizi di gusto. Le regole sul testo (`maxChars`, `contains`, `notContains`) valgono sul
 * `prompt` della risposta se c'è, altrimenti su tutti i testi della risposta (senza i nomi dei
 * campi), e `contains`/`notContains` non badano a maiuscole e minuscole. Le altre guardano i campi.
 *
 * Un percorso è fatto di nomi separati da punti, e un nome può avere una scelta fra parentesi:
 * `[*]` scorre un elenco (`scenes[*].characterIds`), `[0]` prende l'elemento in quella posizione
 * (`shots[0]` è la prima inquadratura), `[action=new]` tiene gli elementi con quel valore
 * (`suggestions[action=new].name`). Un elenco in fondo al percorso si appiattisce.
 *
 * I percorsi `values` valgono sulla **risposta**; `of` e `from` sull'**ingresso** dell'esempio:
 * così si controlla, per esempio, che la stesura citi solo i personaggi che le sono stati dati.
 * Una regola scritta male (nome sbagliato, percorso rotto) è un errore: non si ignora in silenzio.
 */

const SELECTOR = String.raw`(?:\[(?:\*|\d+|[^=\[\]]+=[^\[\]]*)\])?`;
const SEGMENT = String.raw`[^.\[\]]+${SELECTOR}`;
const PATH_PATTERN = new RegExp(`^${SEGMENT}(?:\\.${SEGMENT})*$`);

const path = z.string().regex(PATH_PATTERN, 'percorso non valido');
const bounds = { min: z.number().optional(), max: z.number().optional() };

export const rulesSchema = z.strictObject({
  maxChars: z.number().int().positive().optional(),
  contains: z.array(z.string().min(1)).optional(),
  notContains: z.array(z.string().min(1)).optional(),
  /** Tutti i valori al percorso (e ce n'è almeno uno) sono questo; se si dà un elenco, i valori sono proprio quell'elenco. */
  equals: z.record(path, z.unknown()).optional(),
  /** Quanti valori ci sono al percorso: `{ "suggestions": { "min": 2, "max": 2 } }`. */
  count: z
    .record(
      path,
      z.strictObject({ min: z.number().int().optional(), max: z.number().int().optional() }),
    )
    .optional(),
  /** Ogni numero al percorso sta tra `min` e `max`; se non ce n'è nessuno, il percorso è sbagliato. */
  range: z.array(z.strictObject({ values: path, ...bounds })).optional(),
  /** La somma dei numeri al percorso sta tra `min` e `max`; se non ce n'è nessuno, il percorso è sbagliato. */
  sum: z.array(z.strictObject({ values: path, ...bounds })).optional(),
  /** Tutti i valori della risposta stanno fra quelli dell'ingresso. */
  subset: z.array(z.strictObject({ values: path, of: path })).optional(),
  /** Nessun valore della risposta è fra quelli dell'ingresso (per esempio: niente doppioni). */
  disjoint: z.array(z.strictObject({ values: path, from: path })).optional(),
});

export type EvalRules = z.infer<typeof rulesSchema>;

const SEGMENT_PARTS = /^([^.[\]]+)(?:\[(\*|\d+|[^=[\]]+=[^[\]]*)\])?$/;

/** I valori a un percorso; un percorso assente non dà nulla, e un elenco in fondo si appiattisce. */
export function valuesAt(root: unknown, valuePath: string): unknown[] {
  let current: unknown[] = [root];
  for (const segment of valuePath.split('.')) {
    const [, key, selector] = SEGMENT_PARTS.exec(segment) ?? [];
    if (key === undefined) return [];
    current = current.flatMap((value) => {
      if (typeof value !== 'object' || value === null) return [];
      const next = (value as Record<string, unknown>)[key];
      if (next === undefined) return [];
      return select(next, selector);
    });
  }
  return current.flatMap((value) => (Array.isArray(value) ? (value as unknown[]) : [value]));
}

function select(value: unknown, selector: string | undefined): unknown[] {
  if (selector === undefined) return [value];
  if (!Array.isArray(value)) return [];
  const items = value as unknown[];
  if (selector === '*') return items;
  if (/^\d+$/.test(selector))
    return Number(selector) < items.length ? [items[Number(selector)]] : [];
  const [field = '', expected = ''] = selector.split('=');
  return items.filter(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      String((item as Record<string, unknown>)[field]) === expected,
  );
}

const show = (value: unknown): string => JSON.stringify(value);

/**
 * Il testo su cui valgono le regole di parole: il prompt dei ruoli che ne scrivono uno, altrimenti
 * tutti i testi della risposta, uno per riga (non i nomi dei campi, né le virgolette di un JSON).
 */
function checkedText(output: unknown): string {
  if (typeof output === 'object' && output !== null && 'prompt' in output) {
    const { prompt } = output;
    if (typeof prompt === 'string') return prompt;
  }
  return allStrings(output).join('\n');
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return (value as unknown[]).flatMap(allStrings);
  if (typeof value === 'object' && value !== null) {
    return Object.values(value as Record<string, unknown>).flatMap(allStrings);
  }
  return [];
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

/** Un numero senza il pulviscolo dei decimali (0.1 + 0.2 sia 0.3): si confronta e si mostra così. */
const tidy = (value: number): number => Math.round(value * 1e6) / 1e6;

/** Cosa non va nella risposta secondo le regole: vuoto se è tutto a posto. */
export function checkRules(
  output: unknown,
  input: unknown,
  rules: EvalRules | undefined,
): string[] {
  if (rules === undefined) return [];
  const problems: string[] = [];

  const text = checkedText(output);
  const lower = text.toLowerCase();
  if (rules.maxChars !== undefined && text.length > rules.maxChars) {
    problems.push(
      `la risposta è lunga ${String(text.length)} caratteri, il massimo è ${String(rules.maxChars)}`,
    );
  }
  for (const needle of rules.contains ?? []) {
    if (!lower.includes(needle.toLowerCase())) problems.push(`manca "${needle}"`);
  }
  for (const needle of rules.notContains ?? []) {
    if (lower.includes(needle.toLowerCase())) problems.push(`non dovrebbe contenere "${needle}"`);
  }

  for (const [valuePath, expected] of Object.entries(rules.equals ?? {})) {
    const found = valuesAt(output, valuePath);
    const right = Array.isArray(expected)
      ? show(found) === show(expected)
      : found.length > 0 && found.every((value) => show(value) === show(expected));
    if (!right) {
      problems.push(
        found.length === 0
          ? `"${valuePath}" non ha nessun valore, doveva essere ${show(expected)}`
          : `"${valuePath}" dovrebbe essere ${show(expected)}, è ${show(found.length === 1 ? found[0] : found)}`,
      );
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
    const numbers = numbersAt(output, rule.values);
    if (numbers.length === 0) problems.push(`"${rule.values}" non ha nessun numero da controllare`);
    for (const value of numbers) {
      if (outside(value, rule)) {
        problems.push(`"${rule.values}" ha ${String(value)}, deve essere ${limitsText(rule)}`);
      }
    }
  }

  for (const rule of rules.sum ?? []) {
    const numbers = numbersAt(output, rule.values);
    const total = tidy(numbers.reduce((sum, value) => sum + value, 0));
    if (numbers.length === 0) {
      problems.push(`"${rule.values}" non ha nessun numero da sommare`);
    } else if (outside(total, rule)) {
      problems.push(
        `la somma di "${rule.values}" è ${String(total)}, deve essere ${limitsText(rule)}`,
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

import type { z } from 'zod';

/**
 * I problemi di un modulo, trovati dallo schema Zod vero dei contratti e messi in parole semplici
 * (regola 12 di CLAUDE.md), indicizzati per percorso (`pricing.value`) così ogni campo mostra i
 * suoi.
 */
export type FieldIssue = z.core.$ZodIssue;
export type IssueIndex = ReadonlyMap<string, string[]>;

export function pathKey(path: readonly PropertyKey[]): string {
  return path.map(String).join('.');
}

/** Una unione di schemi dà un elenco di tentativi: si mostra quello che sbaglia di meno. */
function flatten(issues: readonly FieldIssue[]): FieldIssue[] {
  return issues.flatMap((issue) => {
    if (issue.code !== 'invalid_union' || issue.errors.length === 0) return [issue];

    const closest = issue.errors.reduce((best, attempt) =>
      attempt.length < best.length ? attempt : best,
    );
    // I percorsi dei tentativi sono relativi all'unione: si rimettono per intero.
    return flatten(closest).map((inner) => ({ ...inner, path: [...issue.path, ...inner.path] }));
  });
}

export function friendlyMessage(issue: FieldIssue): string {
  switch (issue.code) {
    case 'invalid_type':
      return 'Manca questo valore, oppure non è del tipo giusto.';
    case 'too_small':
      return issue.origin === 'string' || issue.origin === 'array'
        ? 'Qui non può essere vuoto.'
        : `Deve essere ${issue.inclusive ? 'almeno' : 'più di'} ${String(issue.minimum)}.`;
    case 'too_big':
      return `Deve essere ${issue.inclusive ? 'al massimo' : 'meno di'} ${String(issue.maximum)}.`;
    case 'invalid_format':
      return issue.format === 'url'
        ? 'Deve essere un indirizzo web, per esempio https://…'
        : 'Il formato non è quello giusto.';
    case 'invalid_value':
      return 'Scegli uno dei valori ammessi.';
    case 'unrecognized_keys':
      return `Campo non previsto: ${issue.keys.join(', ')}.`;
    default:
      // `custom` e il resto: i messaggi dei contratti sono già in italiano e nominano il campo.
      return issue.message;
  }
}

/** Chiave per i problemi che non stanno su un campo solo (un controllo fra due campi). */
export const WHOLE_ENTRY = '';

export function issuesByPath(error: z.ZodError | undefined): IssueIndex {
  const index = new Map<string, string[]>();
  if (error === undefined) return index;

  for (const issue of flatten(error.issues)) {
    const key = pathKey(issue.path);
    index.set(key, [...(index.get(key) ?? []), friendlyMessage(issue)]);
  }
  return index;
}

/** Controlla un valore con lo schema e dà i problemi per campo (vuoto se va bene). */
export function validate(schema: z.ZodType, value: unknown): IssueIndex {
  const result = schema.safeParse(value);
  return issuesByPath(result.success ? undefined : result.error);
}

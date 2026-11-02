import type { ConfigIssue } from '@filmzy/contracts';

// Il tipo vive nei contratti (attraversa il confine col server, regola d'oro 3): qui si ri-esporta
// perché il validatore e chi lo usa continuino a importarlo da dove lo cercano.
export type { ConfigIssue };

export function hasErrors(issues: readonly ConfigIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

/** Il motivo di un errore in forma leggibile, da mettere dentro un messaggio. */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

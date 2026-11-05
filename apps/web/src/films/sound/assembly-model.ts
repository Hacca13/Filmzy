import type { AssemblyGap, AssemblyView } from '@filmzy/contracts';

/**
 * Le piccole decisioni del montaggio (T5.7), fuori dai componenti così si provano a parte. Cosa manca e
 * a che punto è lo dice il server: qui si dice come scriverlo.
 */

export function assemblyIsWorking(view: AssemblyView): boolean {
  const status = view.latest?.status;
  return status === 'queued' || status === 'running';
}

/** «Scena 2: 3 inquadrature senza video». */
export function gapText({ sceneNumber, kind, missing = 1 }: AssemblyGap): string {
  const scene = `Scena ${String(sceneNumber)}`;
  switch (kind) {
    case 'not_planned':
      return `${scene}: le inquadrature sono ancora da pensare`;
    case 'stale':
      return `${scene}: è cambiata, rifai le inquadrature`;
    case 'no_take':
      return missing === 1
        ? `${scene}: un’inquadratura senza video`
        : `${scene}: ${String(missing)} inquadrature senza video`;
  }
}

const FAILURES: Record<string, string> = {
  ffmpeg_missing: 'Manca il programma che monta i video. Reinstalla Filmzy.',
  not_found: 'Un video o un suono del film non c’è più sul computer. Rifallo, poi monta di nuovo.',
  invalid_request: 'Mentre aspettava è cambiato qualcosa. Controlla cosa manca e riprova.',
  timeout: 'Il montaggio ci ha messo troppo. Chiudi gli altri programmi e riprova.',
};

/** Perché il montaggio non è riuscito, in parole semplici. */
export function assemblyFailureText(code: string | undefined): string {
  return (
    (code === undefined ? undefined : FAILURES[code]) ??
    'Il montaggio non è riuscito. Riprova; se succede ancora, controlla che i video si vedano.'
  );
}

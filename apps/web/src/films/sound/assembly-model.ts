import { JOB_INTERRUPTED, type AssemblyGap, type AssemblyView } from '@filmzy/contracts';

import { ApiError } from '../../api/client';
import { formatDateTime } from '../../lib/format';
import { describeError } from '../../settings/messages';
import { formatDuration } from '../model';

/**
 * Le piccole decisioni del montaggio (T5.7), fuori dai componenti così si provano a parte. Cosa manca e
 * a che punto è lo dice il server: qui si dice come scriverlo.
 */

export function assemblyIsWorking(view: AssemblyView): boolean {
  const status = view.latest?.status;
  return status === 'queued' || status === 'running';
}

/** «Scena 2: 3 inquadrature senza video». */
export function gapText({ sceneNumber = 1, kind, missing = 1 }: AssemblyGap): string {
  const scene = `Scena ${String(sceneNumber)}`;
  switch (kind) {
    case 'no_scenes':
      return 'La storia non ha ancora nessuna scena';
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
  [JOB_INTERRUPTED]:
    'Il programma si è chiuso mentre montava. Non riparte da solo: monta di nuovo quando vuoi.',
  ffmpeg_missing: 'Manca il programma che monta i video. Reinstalla Filmzy.',
  not_found: 'Un video o un suono del film non c’è più sul computer. Rifallo, poi monta di nuovo.',
  invalid_request: 'Mentre aspettava è cambiato qualcosa. Controlla cosa manca e riprova.',
  timeout: 'Il montaggio ci ha messo troppo. Chiudi gli altri programmi e riprova.',
};

/** «5 novembre 2026, 14:20 · 1 min 2 s»: i film di prima si riconoscono da quando sono stati montati. */
export function earlierFilmLabel({
  createdAt,
  durationS,
}: Pick<NonNullable<AssemblyView['film']>, 'createdAt' | 'durationS'>): string {
  const when = formatDateTime(createdAt);
  return durationS === undefined ? when : `${when} · ${formatDuration(Math.round(durationS))}`;
}

/** Perché un film di prima non si è tolto: su Windows un file aperto non si cancella. */
export function removeFilmFailureText(error: unknown): string {
  return error instanceof ApiError && error.serverCode === 'media_failed'
    ? 'Non riesco a togliere questo film: forse è aperto. Fermalo o chiudilo, poi riprova.'
    : describeError(error);
}

/** Perché il montaggio non è riuscito, in parole semplici. */
export function assemblyFailureText(code: string | undefined): string {
  return (
    (code === undefined ? undefined : FAILURES[code]) ??
    'Il montaggio non è riuscito. Riprova; se succede ancora, controlla che i video si vedano.'
  );
}

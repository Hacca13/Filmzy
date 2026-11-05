import { JOB_INTERRUPTED, type ExportSource, type ExportView } from '@filmzy/contracts';

import { ApiError } from '../../api/client';
import { describeError } from '../../settings/messages';

/**
 * Le piccole decisioni dell'esportazione (T5.8), fuori dai componenti così si provano a parte. Cosa si può
 * fare e a che punto è lo dice il server: qui si dice come scriverlo.
 */

export function exportIsWorking(view: ExportView): boolean {
  const status = view.latest?.status;
  return status === 'queued' || status === 'running';
}

/** «Alta definizione · 1080p». */
export function qualityLabel(shortSide: number): string {
  const size = `${String(shortSide)}p`;
  if (shortSide >= 2160) return `4K · ${size}`;
  if (shortSide >= 1080) return `Alta definizione · ${size}`;
  if (shortSide >= 720) return `HD · ${size}`;
  if (shortSide >= 480) return `Leggera · ${size}`;
  return size;
}

const KNOWN_RATIOS: readonly (readonly [number, number])[] = [
  [16, 9],
  [9, 16],
  [4, 3],
  [3, 4],
  [1, 1],
  [21, 9],
];

/** Quanto può scostarsi un formato da uno noto: le misure pari arrotondano un po'. */
const RATIO_TOLERANCE = 0.02;

/** «16:9 · Orizzontale». Un formato che non ha un nome si dice con le sue misure. */
export function formatLabel({ width, height }: Pick<ExportSource, 'width' | 'height'>): string {
  const shape = width > height ? 'Orizzontale' : width < height ? 'Verticale' : 'Quadrato';
  const known = KNOWN_RATIOS.find(([a, b]) => Math.abs(width / height - a / b) < RATIO_TOLERANCE);
  const size =
    known === undefined
      ? `${String(width)}×${String(height)}`
      : `${String(known[0])}:${String(known[1])}`;
  return `${size} · ${shape}`;
}

const FAILURES: Record<string, string> = {
  [JOB_INTERRUPTED]:
    'Il programma si è chiuso mentre esportava. Non riparte da solo: esporta di nuovo quando vuoi.',
  ffmpeg_missing: 'Manca il programma che lavora i video. Reinstalla Filmzy.',
  not_found: 'Il film montato non c’è più sul computer. Montalo di nuovo, poi esporta.',
  disk_full: 'Il disco è pieno. Libera un po’ di spazio e riprova.',
  file_in_use: 'Il file di prima è aperto in un altro programma. Chiudilo e riprova.',
  timeout: 'L’esportazione ci ha messo troppo. Chiudi gli altri programmi e riprova.',
};

/** Perché l'esportazione non è riuscita, in parole semplici. */
export function exportFailureText(code: string | undefined): string {
  return (
    (code === undefined ? undefined : FAILURES[code]) ??
    'L’esportazione non è riuscita. Controlla che ci sia spazio sul disco e riprova.'
  );
}

/** Perché la cartella non si è aperta: il percorso è scritto lì, e si può aprire a mano. */
export function openFolderFailureText(error: unknown): string {
  return error instanceof ApiError && error.serverCode === 'media_failed'
    ? 'Non riesco ad aprire la cartella. Il percorso è scritto qui sopra: puoi aprirla a mano.'
    : describeError(error);
}

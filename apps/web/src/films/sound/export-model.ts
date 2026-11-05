import {
  JOB_INTERRUPTED,
  hasAspect,
  type ExportAspect,
  type ExportContainer,
  type ExportSource,
  type ExportView,
} from '@filmzy/contracts';

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

/** «16:9 · Orizzontale». Un formato che non ha un nome si dice con le sue misure. */
export function formatLabel({ width, height }: Pick<ExportSource, 'width' | 'height'>): string {
  const shape = width > height ? 'Orizzontale' : width < height ? 'Verticale' : 'Quadrato';
  const known = KNOWN_RATIOS.find(([a, b]) =>
    hasAspect({ width, height }, { width: a, height: b }),
  );
  const size =
    known === undefined
      ? `${String(width)}×${String(height)}`
      : `${String(known[0])}:${String(known[1])}`;
  return `${size} · ${shape}`;
}

/** Cosa ha scelto l'utente nel modulo: una scelta non fatta segue quella di partenza. */
export interface ExportChoice {
  shortSide?: number;
  aspect?: ExportAspect | undefined;
  container: ExportContainer;
}

export const INITIAL_EXPORT_CHOICE: ExportChoice = { container: 'mp4' };

/** La qualità e il formato da usare: una scelta di prima può non valere più, un film nuovo ha le sue. */
export function validChoice(choice: ExportChoice, source: ExportSource | undefined) {
  const { shortSide, aspect, container } = choice;
  return {
    shortSide:
      shortSide !== undefined && source?.qualities.includes(shortSide) === true
        ? shortSide
        : source?.qualities[0],
    aspect: aspect !== undefined && source?.aspects.includes(aspect) === true ? aspect : undefined,
    container,
  };
}

const CONTAINER_LABELS: Record<ExportContainer, string> = {
  mp4: 'MP4 · va bene quasi ovunque',
  mov: 'MOV · per i programmi di montaggio',
  webm: 'WebM · per il web, più leggero',
};

export function containerLabel(container: ExportContainer): string {
  return CONTAINER_LABELS[container];
}

const FAILURES: Record<string, string> = {
  [JOB_INTERRUPTED]:
    'Il programma si è chiuso mentre esportava. Non riparte da solo: esporta di nuovo quando vuoi.',
  ffmpeg_missing: 'Manca il programma che lavora i video. Reinstalla Filmzy.',
  not_found: 'Il film montato non c’è più sul computer. Montalo di nuovo, poi esporta.',
  disk_full: 'Il disco è pieno. Libera un po’ di spazio e riprova.',
  file_in_use: 'Il file di prima è aperto in un altro programma. Chiudilo e riprova.',
  no_permission: 'Non riesco a scrivere nella cartella del film. Controlla che non sia protetta.',
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

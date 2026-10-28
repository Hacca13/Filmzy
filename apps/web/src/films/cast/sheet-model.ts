import type { CharacterSheet, SheetAngle, SheetAttempt, SheetImageStatus } from '@filmzy/contracts';

import { describeCode } from '../../settings/messages';

/**
 * Le piccole decisioni della scheda del personaggio (T3.6), fuori dai componenti così si provano a
 * parte. Cosa è pronto lo dice il server; qui si dice solo come mostrarlo.
 */

const ANGLE_LABELS: Record<SheetAngle, string> = {
  front: 'Fronte',
  profile: 'Profilo',
  three_quarter: 'Tre quarti',
};

export function angleLabel(angle: SheetAngle): string {
  return ANGLE_LABELS[angle];
}

/** Cosa si scrive al posto di un'immagine che non c'è ancora o non è riuscita. */
export function imageStatusText(status: SheetImageStatus, errorCode?: string): string {
  switch (status) {
    case 'queued':
      return 'In coda…';
    case 'running':
      return 'Sto disegnando…';
    case 'succeeded':
      return 'Pronta';
    case 'failed':
      return describeCode(errorCode) ?? 'Non è riuscita. Puoi riprovare con un altro tentativo.';
  }
}

/** Qualche immagine è ancora in coda o in lavorazione: serve continuare a guardare. */
export function sheetIsWorking(sheet: CharacterSheet): boolean {
  return sheet.attempts.some((attempt) =>
    attempt.images.some((image) => image.status === 'queued' || image.status === 'running'),
  );
}

/** Tutte e tre le immagini sono pronte: il tentativo si può scegliere. */
export function attemptIsComplete(attempt: SheetAttempt): boolean {
  return attempt.images.length > 0 && attempt.images.every((image) => image.status === 'succeeded');
}

/** «Tentativo 2», e quello su cui il volto è bloccato lo dice. */
export function attemptLabel(attempt: SheetAttempt, lockedAttempt: number | undefined): string {
  const name = `Tentativo ${String(attempt.attempt)}`;
  return attempt.attempt === lockedAttempt ? `${name} · volto bloccato` : name;
}

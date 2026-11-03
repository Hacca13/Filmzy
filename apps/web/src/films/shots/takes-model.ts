import type { ShotTake, ShotTakes } from '@filmzy/contracts';

import { formatEstimate } from '../../lib/format';
import { failureText } from '../failure';

/**
 * Le piccole decisioni dei take video (T4.3), fuori dai componenti così si provano a parte. Cosa è
 * pronto e quanto è costato lo dice il server; qui si dice solo come mostrarlo.
 */

/** Qualche take è ancora in coda o in lavorazione: serve continuare a guardare. */
export function takesAreWorking(takes: ShotTakes): boolean {
  return takes.takes.some((take) => take.status === 'queued' || take.status === 'running');
}

/** Cosa si scrive di un take che non ha ancora la clip, o che è fallito: in parole semplici. */
export function takeText(take: ShotTake): string {
  switch (take.status) {
    case 'queued':
      return 'In coda…';
    case 'running':
      return "Sto girando l'inquadratura… Può volerci qualche minuto.";
    case 'succeeded':
      return take.assetId === undefined ? 'Nessun video' : 'Pronto';
    case 'failed':
      return failureText(take.errorCode);
  }
}

/**
 * «Fatto con Kling · Standard · costato 0,42 $»: il servizio che ha lavorato davvero e il costo
 * vero (D36). Un take senza costo (il servizio non lo dice) nomina solo il servizio.
 */
export function takeCaption(take: ShotTake): string {
  const cost = take.costUsd === undefined ? '' : ` · costato ${formatEstimate(take.costUsd)}`;
  return `Fatto con ${take.modelLabel}${cost}`;
}

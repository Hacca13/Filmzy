import type { ShotTake, ShotTakes } from '@filmzy/contracts';

import { formatEstimate } from '../../lib/format';
import { failureText } from '../failure';

/**
 * Le piccole decisioni dei take video (T4.3), fuori dai componenti così si provano a parte. Cosa è
 * pronto e quanto è costato lo dice il server; qui si dice solo come mostrarlo.
 */

/**
 * Il take che la card fa vedere: quello che l'utente ha scelto di tenere, e se non ne ha scelto uno
 * (o il suo non è riuscito) il più recente riuscito. Lo stesso criterio del server per la clip.
 */
export function keptTake(takes: ShotTakes): ShotTake | undefined {
  const succeeded = takes.takes.filter((take) => take.status === 'succeeded');
  return succeeded.find((take) => take.chosen) ?? succeeded[0];
}

/**
 * Il momento a cui è il lettore del video, in secondi: tre decimali bastano, e un lettore che non c'è
 * ancora (o un valore che non è un tempo) vale l'inizio. Il server controlla comunque.
 */
export function timeInVideo(currentTime: number | undefined): number {
  return currentTime === undefined || !Number.isFinite(currentTime) || currentTime < 0
    ? 0
    : Math.round(currentTime * 1000) / 1000;
}

/** «1,5 s»: il momento del video, come si legge in italiano. */
export function formatMoment(atS: number): string {
  return `${atS.toLocaleString('it-IT', { maximumFractionDigits: 2 })} s`;
}

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

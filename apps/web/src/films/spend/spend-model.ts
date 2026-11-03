import { formatUsd } from '../../lib/format';

/**
 * Le piccole decisioni di «Quanto ho speso» (T4.7), fuori dai componenti così si provano a parte. I
 * conti li fa il server; qui si dice solo come presentarli.
 */

/**
 * Quanto è lunga la barra di ogni voce rispetto alla più grande, in percentuale. La voce più cara
 * riempie la barra; una voce che ha speso qualcosa non sparisce mai del tutto (almeno il 2%).
 */
export function barShares(amounts: readonly number[]): number[] {
  const largest = Math.max(0, ...amounts);
  return amounts.map((amount) =>
    largest <= 0 || amount <= 0 ? 0 : Math.max(2, Math.round((amount / largest) * 100)),
  );
}

/** «OTTOBRE 2026»: il mese a cui si riferisce la spesa, per il titoletto della schermata. */
export function monthTitle(monthStart: string): string {
  return new Date(monthStart)
    .toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

/** «3 film · 5 servizi utilizzati» (con il singolare quando è uno solo). */
export function monthCounts(films: number, services: number): string {
  const filmText = films === 1 ? '1 film' : `${String(films)} film`;
  const serviceText =
    services === 1 ? '1 servizio utilizzato' : `${String(services)} servizi utilizzati`;
  return `${filmText} · ${serviceText}`;
}

/** «3 chiamate» sotto una voce: quante volte il servizio ha lavorato (una fallita non conta). */
export function callsText(calls: number): string {
  return calls === 1 ? '1 chiamata' : `${String(calls)} chiamate`;
}

/** Quanto manca a un limite: «mancano 37,60 $», o niente se non c'è un limite o è già raggiunto. */
export function remainingText(spentUsd: number, capUsd: number | undefined): string | undefined {
  if (capUsd === undefined || spentUsd >= capUsd) return undefined;
  return `mancano ${formatUsd(capUsd - spentUsd)}`;
}

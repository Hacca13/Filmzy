/**
 * Un costo in dollari, come lo legge chi non programma: «0,0031 $». I costi di una prova sono
 * frazioni di centesimo, quindi servono fino a quattro decimali; sopra il dollaro bastano due.
 */
export function formatUsd(amount: number): string {
  const decimals = amount >= 1 || amount === 0 ? 2 : 4;
  return `${amount.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} $`;
}

/**
 * Una stima in dollari, come la si legge su un pulsante: da dieci centesimi in su bastano due
 * decimali («0,42 $»), sotto servono quattro per non scrivere «0,00 $». I prezzi di listino, che
 * vogliono la precisione, usano `formatUsd`.
 */
export function formatEstimate(amount: number): string {
  const decimals = amount >= 0.1 || amount === 0 ? 2 : 4;
  return `${amount.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} $`;
}

/** Una data e un'ora come si leggono in italiano: «27 ottobre 2026, 10:00». */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' });
}

/** Un valore qualsiasi, leggibile: oggetti e liste a capo e rientrati, il testo com'è. */
export function formatValue(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

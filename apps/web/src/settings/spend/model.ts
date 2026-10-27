import type { ProviderSpend, SpendBreach } from '@filmzy/contracts';

import { ApiError } from '../../api/client';
import { formatUsd } from '../../lib/format';

/** Le parole e le piccole decisioni delle spese (T3.1, D30), fuori dai componenti. */

/** Il limite superato, se l'errore è «questa generazione supera un limite di spesa». */
export function breachOf(error: unknown): SpendBreach | undefined {
  if (!(error instanceof ApiError) || error.serverCode !== 'spend_cap_reached') return undefined;
  return error.details?.spend;
}

/**
 * Perché si chiede conferma, in parole semplici: quanto costa la generazione, quale limite supera
 * e quanto si è già speso. `providerLabel` è il nome del fornitore, per il limite mensile.
 */
export function breachText(breach: SpendBreach, providerLabel?: string): string {
  const estimate = `Questa generazione costa circa ${formatUsd(breach.estimatedUsd)}`;
  const spent = `ne hai già spesi ${formatUsd(breach.spentUsd)} su ${formatUsd(breach.limitUsd)}`;

  switch (breach.limit) {
    case 'monthly_cap':
      return `${estimate} e supera il limite di questo mese${providerLabel === undefined ? '' : ` per ${providerLabel}`}: ${spent}.`;
    case 'film_budget':
      return `${estimate} e supera il limite per questo film: ${spent}.`;
    case 'confirm_above':
      return `${estimate}, più della cifra sopra cui hai chiesto di confermare (${formatUsd(breach.limitUsd)}).`;
  }
}

/**
 * Il nuovo limite che propone «Cambia il tetto»: abbastanza perché questa generazione rientri,
 * arrotondato al dollaro intero per non proporre cifre strane.
 */
export function raisedLimitUsd(breach: SpendBreach): number {
  const needed =
    breach.limit === 'confirm_above' ? breach.estimatedUsd : breach.spentUsd + breach.estimatedUsd;
  return Math.max(1, Math.ceil(needed));
}

/** «80% · Manca poco al limite» o «⚠ 100% · Limite raggiunto»: l'avviso accanto a un fornitore (D36). */
export function spendBadge(
  spend: ProviderSpend | undefined,
): { text: string; tone: 'warning' | 'reached' } | undefined {
  if (spend?.level === 'warning') {
    return {
      text: `${String(Math.round(spend.percent ?? 80))}% · Manca poco al limite`,
      tone: 'warning',
    };
  }
  if (spend?.level === 'reached') return { text: '⚠ 100% · Limite raggiunto', tone: 'reached' };
  return undefined;
}

/** La riga della spesa di un fornitore: «12,00 $ questo mese · limite 20,00 $ · 60%», o «nessun limite». */
export function spendLine(spend: ProviderSpend): string {
  const spent = `${formatUsd(spend.spentUsd)} questo mese`;
  if (spend.capUsd === undefined) return `${spent} · nessun limite`;

  const left = Math.max(0, spend.capUsd - spend.spentUsd);
  return `${spent} · limite ${formatUsd(spend.capUsd)} · mancano ${formatUsd(left)}`;
}

import type { SpendBreach } from '@filmzy/contracts';

import { setMonthlyCap, setFilmBudget } from '../../api/connections';
import { setConfirmAbove } from '../../api/spend';
import { Notice } from '../../components/ui';
import { breachText, raisedLimitUsd } from './model';

interface Props {
  breach: SpendBreach;
  /** Il nome del fornitore, per il limite mensile. */
  providerLabel?: string;
  busy: boolean;
  /** «Continua»: si prosegue questa volta sola, senza cambiare il limite. */
  onProceed: () => void;
  /** «Cambia il tetto»: il limite è stato alzato, si può riprovare. */
  onRaise: () => void;
  onCancel: () => void;
}

/** Alza il limite che si è superato, abbastanza perché la generazione rientri. */
export async function raiseLimit(
  breach: SpendBreach,
  connectionId: string | undefined,
): Promise<void> {
  const usd = raisedLimitUsd(breach);
  if (breach.limit === 'film_budget') await setFilmBudget(usd);
  else if (breach.limit === 'confirm_above') await setConfirmAbove(usd);
  else if (connectionId !== undefined) await setMonthlyCap(connectionId, usd);
}

/**
 * Superato un limite di spesa l'utente decide (D30): i limiti sono impostazioni, non muri.
 * «Continua» prosegue questa volta; «Cambia il tetto» lo alza; «Annulla» lascia perdere. Lo usa
 * ogni pulsante che genera qualcosa che costa.
 */
export function SpendConfirm({ breach, providerLabel, busy, onProceed, onRaise, onCancel }: Props) {
  return (
    <Notice tone="info">
      {breachText(breach, providerLabel)}
      <span className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy}
          onClick={onProceed}
        >
          Continua
        </button>
        <button type="button" className="button" disabled={busy} onClick={onRaise}>
          Cambia il tetto
        </button>
        <button type="button" className="button" disabled={busy} onClick={onCancel}>
          Annulla
        </button>
      </span>
    </Notice>
  );
}

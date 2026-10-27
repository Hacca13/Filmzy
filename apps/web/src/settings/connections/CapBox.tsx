import type { ConnectionsOverview, ProviderState } from '@filmzy/contracts';
import { useState } from 'react';

import { setMonthlyCap } from '../../api/connections';
import { Notice } from '../../components/ui';
import { useAction } from '../use-action';
import { parseUsd, usdToField } from './model';

interface Props {
  provider: ProviderState;
  onOverview: (overview: ConnectionsOverview) => void;
}

/**
 * Il limite di spesa mensile di un fornitore (D30, D36): facoltativo, **nessuno è preimpostato**.
 * Vuoto vuol dire nessun limite. Il promemoria ricorda che il fornitore ha un suo pannello dove
 * metterne uno anche lì: è la difesa che vale anche se Filmzy è chiuso.
 */
export function CapBox({ provider, onOverview }: Props) {
  const [text, setText] = useState(usdToField(provider.monthlyCapUsd));
  const action = useAction();
  const amount = parseUsd(text);

  const save = () => {
    if (amount === undefined) return;
    action.run(async () => {
      onOverview(await setMonthlyCap(provider.connectionId, amount));
    });
  };

  return (
    <div className="field">
      <label htmlFor={`cap-${provider.connectionId}`}>Limite di spesa mensile (facoltativo)</label>
      <div className="actions">
        <input
          id={`cap-${provider.connectionId}`}
          type="text"
          inputMode="decimal"
          placeholder="Importo in $ · lascia vuoto per nessun limite"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
        <button
          type="button"
          className="button"
          disabled={action.busy || amount === undefined}
          onClick={save}
        >
          Salva il limite
        </button>
      </div>
      {amount === undefined ? (
        <p className="field-error">Scrivi un importo maggiore di zero.</p>
      ) : null}
      <p className="hint">
        Conviene impostare un limite di spesa anche nel pannello di {provider.label}: lì vale anche
        quando Filmzy è chiuso.
      </p>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </div>
  );
}

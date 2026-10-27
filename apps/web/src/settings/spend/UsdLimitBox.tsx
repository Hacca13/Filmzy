import { useState } from 'react';

import { parseUsd, usdToField } from '../connections/model';

interface Props {
  /** Per collegare l'etichetta al campo. */
  id: string;
  label: string;
  /** Una riga di spiegazione sotto il campo. */
  hint?: string;
  placeholder: string;
  /** Il limite di adesso; senza, il campo parte vuoto («nessun limite»). */
  value: number | undefined;
  busy: boolean;
  /** `null` toglie il limite. */
  onSave: (usd: number | null) => void;
}

/**
 * Un limite di spesa facoltativo, in dollari (D30): **nessuno è preimpostato**, vuoto vuol dire
 * nessun limite. Lo usano il limite mensile di un fornitore, quello per film e «conferma sopra».
 */
export function UsdLimitBox({ id, label, hint, placeholder, value, busy, onSave }: Props) {
  const [text, setText] = useState(usdToField(value));
  const amount = parseUsd(text);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="actions">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
        <button
          type="button"
          className="button"
          disabled={busy || amount === undefined}
          onClick={() => {
            if (amount !== undefined) onSave(amount);
          }}
        >
          Salva il limite
        </button>
      </div>
      {amount === undefined ? (
        <p className="field-error">Scrivi un importo maggiore di zero.</p>
      ) : null}
      {hint === undefined ? null : <p className="hint">{hint}</p>}
    </div>
  );
}

import type { ModelOption } from '@filmzy/contracts';
import { useState } from 'react';

import { costText, qualityText, selectedOption } from './change-service';

interface Props {
  /** I servizi fra cui scegliere, già filtrati e con le stime: li dà il backend (`troupe.options`). */
  options: readonly ModelOption[] | undefined;
  /** Il servizio scelto; senza, vale il predefinito. */
  selectedId: string | undefined;
  /** L'elenco si sta caricando. */
  loading?: boolean;
  /** Chi lo usa carica l'elenco quando si apre: costa una chiamata al backend. */
  onOpen?: () => void;
  onSelect: (modelId: string) => void;
  /** Solo per i test: parte già aperto. */
  startOpen?: boolean;
}

/**
 * «Cambia servizio» (D36): accanto a ogni pulsante che genera qualcosa che costa, mostra gli altri
 * servizi con nome, costo stimato e voto delle prove. La stima segue il servizio scelto. Non decide
 * niente: l'elenco e i costi arrivano dal backend (regola 8), e un servizio non adatto alla
 * richiesta non compare (non si passa mai a un altro in silenzio).
 */
export function ChangeService({
  options,
  selectedId,
  loading = false,
  onOpen,
  onSelect,
  startOpen = false,
}: Props) {
  const [open, setOpen] = useState(startOpen);
  const chosen = options === undefined ? undefined : selectedOption(options, selectedId);

  return (
    <div className="change-service">
      <button
        type="button"
        className="button"
        aria-expanded={open}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }}
      >
        Cambia servizio ⌄
      </button>
      {chosen === undefined ? null : (
        <span className="hint">
          {' '}
          {chosen.label} · {costText(chosen)}
        </span>
      )}
      {!open ? null : loading || options === undefined ? (
        <p className="hint">Un attimo…</p>
      ) : options.length === 0 ? (
        <p className="hint">Nessun servizio adatto: attivane uno in Impostazioni › Connessioni.</p>
      ) : (
        <ul className="service-options" role="listbox" aria-label="Servizi">
          {options.map((option) => (
            <li key={option.modelId}>
              <button
                type="button"
                role="option"
                className="button"
                aria-selected={option.modelId === chosen?.modelId}
                onClick={() => {
                  onSelect(option.modelId);
                  setOpen(false);
                }}
              >
                <strong>{option.label}</strong> · {costText(option)} · {qualityText(option.quality)}
                {option.isDefault ? ' · di solito' : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

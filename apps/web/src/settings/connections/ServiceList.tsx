import type { ProviderState, ServiceState } from '@filmzy/contracts';

import { formatPrice, unusableText } from './labels';

interface Props {
  provider: ProviderState;
  disabled: boolean;
  /** Per chi tiene la scelta da parte (la procedura guidata): senza, vale quella già salvata. */
  isChecked?: (service: ServiceState) => boolean;
  onToggle: (modelId: string, on: boolean) => void;
  /** Se c'è, mostra «Scelto» / «Scegli» per il servizio predefinito del fornitore. */
  onChooseDefault?: (modelId: string) => void;
}

/**
 * I servizi di un fornitore in un gruppo: si attivano e si spengono, e se ne sceglie uno come
 * predefinito. Un servizio che oggi non si può usare resta scelto ma dice perché (D36: non si
 * toglie niente in silenzio).
 */
export function ServiceList({ provider, disabled, isChecked, onToggle, onChooseDefault }: Props) {
  return (
    <>
      {provider.services.map((service) => {
        const canTurnOn = service.usable || service.enabled;
        return (
          <div key={service.modelId} className="row">
            <div className="row-head">
              <label className="service-label">
                <input
                  type="checkbox"
                  checked={isChecked?.(service) ?? service.enabled}
                  disabled={disabled || !canTurnOn}
                  onChange={(event) => {
                    onToggle(service.modelId, event.target.checked);
                  }}
                />
                <span>
                  <strong>{service.label}</strong> · {formatPrice(service.price)}
                  {service.status === 'testing' ? ' · in prova' : ''}
                </span>
              </label>
              {onChooseDefault !== undefined && service.enabled ? (
                service.isProviderDefault ? (
                  <span className="badge" data-tone="accent">
                    ✓ Scelto
                  </span>
                ) : (
                  <button
                    type="button"
                    className="button"
                    disabled={disabled || !service.usable}
                    onClick={() => {
                      onChooseDefault(service.modelId);
                    }}
                  >
                    Scegli
                  </button>
                )
              ) : null}
            </div>
            {service.unusableReason === undefined ? null : (
              <p className="hint">Non si può usare: {unusableText(service.unusableReason)}.</p>
            )}
          </div>
        );
      })}
    </>
  );
}

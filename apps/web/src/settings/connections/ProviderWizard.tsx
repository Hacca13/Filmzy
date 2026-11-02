import type { ConnectionsOverview, GroupState, ProviderState } from '@filmzy/contracts';
import { useState } from 'react';

import { setGroupDefault, setProviderDefault, setServices } from '../../api/connections';
import { Notice, Panel } from '../../components/ui';
import { useAction } from '../use-action';
import { CapBox } from './CapBox';
import { KeyBox } from './KeyBox';
import { GROUP_LABELS, providerStatus } from './labels';
import { enabledServiceIds } from './model';
import { ServiceList } from './ServiceList';

export type WizardStep = 'provider' | 'key' | 'services' | 'cap';

const STEP_TITLES: Record<WizardStep, string> = {
  provider: 'Fornitore',
  key: 'Chiave',
  services: 'Servizi',
  cap: 'Spese',
};

interface Props {
  group: GroupState;
  overview: ConnectionsOverview;
  onOverview: (overview: ConnectionsOverview) => void;
  onReload: () => Promise<void>;
  onClose: () => void;
  /**
   * I passi da fare. Nella finestra «Aggiungi un fornitore» sono tre e il limite di spesa sta
   * insieme ai servizi; nella procedura del primo avvio le spese hanno il loro passo.
   */
  steps?: readonly WizardStep[];
  /** Il fornitore da cui partire, se già scelto (la procedura guidata lo sceglie prima). */
  initialConnectionId?: string;
}

const DEFAULT_STEPS: readonly WizardStep[] = ['provider', 'key', 'services'];

/**
 * «Aggiungi un fornitore» (T2.7): fornitore, chiave con «Prova la connessione», servizi da
 * attivare con un eventuale limite di spesa mensile. Le scelte valgono subito (D36).
 */
export function ProviderWizard({
  group,
  overview,
  onOverview,
  onReload,
  onClose,
  steps = DEFAULT_STEPS,
  initialConnectionId,
}: Props) {
  const [index, setIndex] = useState(initialConnectionId === undefined ? 0 : 1);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const step = steps[index];

  // Il fornitore si rilegge dal quadro a ogni disegno: dopo aver scritto la chiave è cambiato.
  const provider = group.providers.find((candidate) => candidate.connectionId === connectionId);

  const next = () => {
    if (index + 1 >= steps.length) onClose();
    else setIndex(index + 1);
  };

  return (
    <Panel title={`Aggiungi un fornitore · ${GROUP_LABELS[group.group]}`}>
      <p className="hint">
        Passo {String(index + 1)} di {String(steps.length)} ·{' '}
        {steps.map((name) => STEP_TITLES[name]).join(' → ')}
      </p>
      {step === 'provider' ? (
        <ChooseProvider
          group={group}
          selected={connectionId}
          onSelect={setConnectionId}
          onNext={next}
          onCancel={onClose}
        />
      ) : null}
      {step === 'key' && provider !== undefined ? (
        <KeyStep provider={provider} onReload={onReload} onNext={next} onCancel={onClose} />
      ) : null}
      {step === 'services' && provider !== undefined ? (
        <ServicesStep
          group={group}
          provider={provider}
          overview={overview}
          showCap={!steps.includes('cap')}
          onOverview={onOverview}
          onNext={next}
          onCancel={onClose}
        />
      ) : null}
      {step === 'cap' && provider !== undefined ? (
        <>
          <CapBox provider={provider} onOverview={onOverview} />
          <div className="actions">
            <button type="button" className="button" data-kind="primary" onClick={next}>
              Fine
            </button>
          </div>
        </>
      ) : null}
    </Panel>
  );
}

function ChooseProvider({
  group,
  selected,
  onSelect,
  onNext,
  onCancel,
}: {
  group: GroupState;
  selected: string | undefined;
  onSelect: (connectionId: string) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  // Un fornitore spento nella release non si può collegare da qui: si accende dalle avanzate.
  const available = group.providers.filter((provider) => provider.enabled);

  return (
    <>
      {available.length === 0 ? (
        <Notice tone="info">
          Non ci sono fornitori da collegare. Altri si accendono da Impostazioni › Avanzate.
        </Notice>
      ) : (
        available.map((provider) => (
          <label key={provider.connectionId} className="row service-label">
            <input
              type="radio"
              name="provider"
              checked={selected === provider.connectionId}
              onChange={() => {
                onSelect(provider.connectionId);
              }}
            />
            <span>
              <strong>{provider.label}</strong> · {providerStatus(provider).text}
            </span>
          </label>
        ))
      )}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={selected === undefined}
          onClick={onNext}
        >
          Continua
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </>
  );
}

function KeyStep({
  provider,
  onReload,
  onNext,
  onCancel,
}: {
  provider: ProviderState;
  onReload: () => Promise<void>;
  onNext: () => void;
  onCancel: () => void;
}) {
  const ready = !provider.keyRequired || provider.key?.present === true;

  return (
    <>
      <KeyBox provider={provider} onChanged={onReload} />
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={!ready}
          onClick={onNext}
        >
          Continua
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </>
  );
}

function ServicesStep({
  group,
  provider,
  overview,
  showCap,
  onOverview,
  onNext,
  onCancel,
}: {
  group: GroupState;
  provider: ProviderState;
  overview: ConnectionsOverview;
  showCap: boolean;
  onOverview: (overview: ConnectionsOverview) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  // Si parte da quelli già attivati; se non ce n'è nessuno, da quelli che si possono usare e non sono in prova.
  const [selected, setSelected] = useState<string[]>(() => {
    const already = provider.services.filter((service) => service.enabled).map((s) => s.modelId);
    return already.length > 0
      ? already
      : provider.services
          .filter((service) => service.usable && service.status === 'active')
          .map((service) => service.modelId);
  });
  const [defaultId, setDefaultId] = useState<string | undefined>(
    () => provider.services.find((service) => service.isProviderDefault)?.modelId,
  );
  const action = useAction();

  const finish = () => {
    action.run(async () => {
      const here = new Set(provider.services.map((service) => service.modelId));
      const others = enabledServiceIds(overview, provider.connectionId).filter(
        (id) => !here.has(id),
      );
      let latest = await setServices(provider.connectionId, [...others, ...selected]);

      const chosen =
        defaultId !== undefined && selected.includes(defaultId) ? defaultId : selected[0];
      if (chosen !== undefined) {
        latest = await setProviderDefault(provider.connectionId, chosen);
        // Se per questo tipo di lavoro non c'è ancora un fornitore di solito, diventa questo.
        if (group.defaultConnectionId === undefined) {
          latest = await setGroupDefault(group.group, provider.connectionId);
        }
      }
      onOverview(latest);
      onNext();
    });
  };

  return (
    <>
      <ServiceList
        provider={provider}
        disabled={action.busy}
        isChecked={(service) => selected.includes(service.modelId)}
        onToggle={(modelId, on) => {
          setSelected(on ? [...selected, modelId] : selected.filter((id) => id !== modelId));
        }}
      />
      {selected.length > 1 ? (
        <div className="field">
          <label htmlFor="wizard-default">Servizio di solito</label>
          <select
            id="wizard-default"
            value={
              defaultId !== undefined && selected.includes(defaultId) ? defaultId : selected[0]
            }
            onChange={(event) => {
              setDefaultId(event.target.value);
            }}
          >
            {provider.services
              .filter((service) => selected.includes(service.modelId))
              .map((service) => (
                <option key={service.modelId} value={service.modelId}>
                  {service.label}
                </option>
              ))}
          </select>
        </div>
      ) : null}
      {showCap ? <CapBox provider={provider} onOverview={onOverview} /> : null}
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={action.busy || selected.length === 0}
          onClick={finish}
        >
          Fine
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </>
  );
}

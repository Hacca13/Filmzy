import type { ConnectionsOverview, GroupState, ProviderState } from '@filmzy/contracts';

import { setGroupDefault, setProviderDefault, setServices } from '../../api/connections';
import { Notice } from '../../components/ui';
import { useAction } from '../use-action';
import { CapBox } from './CapBox';
import { KeyBox } from './KeyBox';
import { enabledServiceIds, withServiceToggled } from './model';
import { ServiceList } from './ServiceList';

interface Props {
  overview: ConnectionsOverview;
  group: GroupState;
  provider: ProviderState;
  onOverview: (overview: ConnectionsOverview) => void;
  /** Rilegge il quadro, dopo che si è toccata una chiave. */
  onReload: () => Promise<void>;
}

/**
 * «Gestisci» un fornitore (T2.7): Servizi, Chiave, limite di spesa e Chi lo usa. Ogni cambiamento
 * vale subito, senza pubblicare niente (D36).
 */
export function ProviderDetail({ overview, group, provider, onOverview, onReload }: Props) {
  const action = useAction();
  const isGroupDefault = group.defaultConnectionId === provider.connectionId;
  const hasEnabledHere = provider.services.some((service) => service.enabled && service.usable);

  const toggle = (modelId: string, on: boolean) => {
    action.run(async () => {
      const current = enabledServiceIds(overview, provider.connectionId);
      onOverview(
        await setServices(provider.connectionId, withServiceToggled(current, modelId, on)),
      );
    });
  };

  const chooseDefault = (modelId: string) => {
    action.run(async () => {
      onOverview(await setProviderDefault(provider.connectionId, modelId));
    });
  };

  const useForGroup = () => {
    action.run(async () => {
      onOverview(await setGroupDefault(group.group, provider.connectionId));
    });
  };

  return (
    <div className="row-form">
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}

      <h3 className="subtitle">Servizi</h3>
      <ServiceList
        provider={provider}
        disabled={action.busy}
        onToggle={toggle}
        onChooseDefault={chooseDefault}
      />
      {hasEnabledHere ? (
        isGroupDefault ? (
          <p className="hint">✓ È il fornitore che si usa di solito per questo tipo di lavoro.</p>
        ) : (
          <div className="actions">
            <button type="button" className="button" disabled={action.busy} onClick={useForGroup}>
              Usa questo fornitore di solito
            </button>
          </div>
        )
      ) : null}

      <h3 className="subtitle">Chiave</h3>
      <KeyBox provider={provider} onChanged={onReload} />

      <CapBox provider={provider} onOverview={onOverview} />

      <h3 className="subtitle">Chi lo usa</h3>
      {provider.usedBy.length === 0 ? (
        <p className="hint">Nessun ruolo, per ora.</p>
      ) : (
        <ul className="issues">
          {provider.usedBy.map((role) => (
            <li key={role.roleId}>{role.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

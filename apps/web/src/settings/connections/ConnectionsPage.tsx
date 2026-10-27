import type {
  ConnectionsOverview,
  GroupState,
  ProviderSpend,
  ProviderState,
} from '@filmzy/contracts';
import { useState, type ReactNode } from 'react';

import { fetchConnections } from '../../api/connections';
import { fetchSpend } from '../../api/spend';
import { Notice, Panel } from '../../components/ui';
import { formatUsd } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { spendBadge } from '../spend/model';
import { GROUP_LABELS, GROUP_ORDER, providerStatus } from './labels';
import { ProviderDetail } from './ProviderDetail';
import { ProviderWizard } from './ProviderWizard';

/**
 * Impostazioni › Connessioni (T2.7): i fornitori, divisi per tipo di lavoro, con le loro chiavi e i
 * servizi che si possono usare. Le scelte valgono subito, senza pubblicare niente (D36).
 */
export function ConnectionsPage() {
  const { state, setData } = useResource(fetchConnections);
  // La spesa serve solo agli avvisi sui limiti: se non si legge, la pagina funziona lo stesso.
  const spend = useResource(fetchSpend);
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const overview = state.data;
  const spendByConnection = new Map(
    spend.state.status === 'ready'
      ? spend.state.data.providers.map((entry) => [entry.connectionId, entry])
      : [],
  );
  const reload = async () => {
    try {
      setData(await fetchConnections());
      setProblem(undefined);
    } catch (error) {
      setProblem(describeError(error));
    }
  };

  return (
    <>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {GROUP_ORDER.map((name) => {
        const group = overview.groups.find((candidate) => candidate.group === name);
        return group === undefined ? null : (
          <GroupPanel
            key={name}
            group={group}
            overview={overview}
            spend={spendByConnection}
            onOverview={setData}
            onReload={reload}
          />
        );
      })}
    </>
  );
}

interface GroupProps {
  group: GroupState;
  overview: ConnectionsOverview;
  spend: ReadonlyMap<string, ProviderSpend>;
  onOverview: (overview: ConnectionsOverview) => void;
  onReload: () => Promise<void>;
}

function GroupPanel({ group, overview, spend, onOverview, onReload }: GroupProps) {
  const [managing, setManaging] = useState<string>();
  const [adding, setAdding] = useState(false);

  return (
    <Panel title={GROUP_LABELS[group.group]}>
      {group.group === 'vision' ? (
        <p className="hint">
          ✦ Riutilizziamo i fornitori e le chiavi del Testo: non devi collegarli due volte.
        </p>
      ) : null}
      {group.providers.map((provider) => (
        <ProviderRow
          key={provider.connectionId}
          provider={provider}
          spend={spend.get(provider.connectionId)}
          isGroupDefault={group.defaultConnectionId === provider.connectionId}
          open={managing === provider.connectionId}
          onToggle={() => {
            setManaging(managing === provider.connectionId ? undefined : provider.connectionId);
          }}
        >
          <ProviderDetail
            overview={overview}
            group={group}
            provider={provider}
            onOverview={onOverview}
            onReload={onReload}
          />
        </ProviderRow>
      ))}
      {adding ? (
        <ProviderWizard
          group={group}
          overview={overview}
          onOverview={onOverview}
          onReload={onReload}
          onClose={() => {
            setAdding(false);
          }}
        />
      ) : (
        <div className="actions">
          <button
            type="button"
            className="button"
            onClick={() => {
              setAdding(true);
            }}
          >
            Aggiungi un fornitore
          </button>
        </div>
      )}
    </Panel>
  );
}

function ProviderRow({
  provider,
  spend,
  isGroupDefault,
  open,
  onToggle,
  children,
}: {
  provider: ProviderState;
  spend: ProviderSpend | undefined;
  isGroupDefault: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const status = providerStatus(provider);
  const limit = spendBadge(spend);

  return (
    <div className="row" data-open={open}>
      <div className="row-head">
        <p>
          <strong>{provider.label}</strong>
          <span className="badge" data-tone={status.tone === 'ok' ? 'accent' : 'plain'}>
            {status.text}
          </span>
          {isGroupDefault ? <span className="badge">Di solito</span> : null}
          {limit === undefined ? null : (
            <span className="badge" data-tone={limit.tone === 'reached' ? 'accent' : 'plain'}>
              {limit.text}
            </span>
          )}
          {provider.monthlyCapUsd === undefined ? null : (
            <span className="hint"> · limite mensile {formatUsd(provider.monthlyCapUsd)}</span>
          )}
        </p>
        <button type="button" className="button" aria-expanded={open} onClick={onToggle}>
          {open ? 'Chiudi' : 'Gestisci'}
        </button>
      </div>
      {open ? children : null}
    </div>
  );
}

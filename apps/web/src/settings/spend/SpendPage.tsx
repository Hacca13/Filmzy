import type { ConnectionsOverview, ProviderSpend, SpendOverview } from '@filmzy/contracts';

import { fetchConnections, setFilmBudget, setMonthlyCap } from '../../api/connections';
import { fetchSpend, setConfirmAbove } from '../../api/spend';
import { Notice, Panel } from '../../components/ui';
import { formatUsd } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { useAction } from '../use-action';
import { UsdLimitBox } from './UsdLimitBox';
import { spendBadge, spendLine } from './model';

/**
 * Impostazioni › Spese e tetti (T3.1, D30, D36): quanto si è speso nel mese per ogni fornitore e
 * quanto manca al suo limite, e i limiti facoltativi (per film, «conferma sopra», mensile di un
 * fornitore). **Nessun limite è preimpostato**: senza, non si blocca niente e si vede solo la spesa.
 */
export function SpendPage() {
  const spend = useResource(fetchSpend);
  const connections = useResource(fetchConnections);

  if (spend.state.status === 'error') {
    return <Notice tone="error">{describeError(spend.state.error)}</Notice>;
  }
  if (connections.state.status === 'error') {
    return <Notice tone="error">{describeError(connections.state.error)}</Notice>;
  }
  if (spend.state.status === 'loading' || connections.state.status === 'loading') {
    return <p className="hint">Un attimo…</p>;
  }

  return (
    <SpendView
      spend={spend.state.data}
      connections={connections.state.data}
      onSpend={spend.setData}
      onConnections={connections.setData}
    />
  );
}

interface ViewProps {
  spend: SpendOverview;
  connections: ConnectionsOverview;
  onSpend: (spend: SpendOverview) => void;
  onConnections: (overview: ConnectionsOverview) => void;
}

function SpendView({ spend, connections, onSpend, onConnections }: ViewProps) {
  const action = useAction();

  /** Salva un limite e rilegge la spesa: i livelli (80%, 100%) cambiano con il limite. */
  const save = (change: () => Promise<ConnectionsOverview>) => {
    action.run(async () => {
      onConnections(await change());
      onSpend(await fetchSpend());
    });
  };

  const capOf = (connectionId: string): number | undefined =>
    connections.groups
      .flatMap((group) => group.providers)
      .find((provider) => provider.connectionId === connectionId)?.monthlyCapUsd;

  return (
    <>
      <Panel title="Spese e tetti">
        <p className="hint">
          ✦ Filmzy è gratuito. I costi vanno direttamente ai servizi che hai collegato.
        </p>
        <p>
          <strong>{formatUsd(spend.totalMonthUsd)}</strong> spesi questo mese.
        </p>
        {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
        <UsdLimitBox
          id="film-budget"
          label="Limite per film (facoltativo)"
          placeholder="Importo in $ · lascia vuoto per nessun limite"
          hint="Se una generazione lo supera ti chiediamo cosa fare: alzarlo o proseguire."
          value={spend.filmBudgetUsd}
          busy={action.busy}
          onSave={(usd) => {
            save(() => setFilmBudget(usd));
          }}
        />
        <UsdLimitBox
          id="confirm-above"
          label="Chiedi conferma sopra questo importo (facoltativo)"
          placeholder="Importo in $ · nessuna soglia impostata"
          hint="Una generazione che costa di più chiede conferma prima di partire."
          value={spend.confirmAboveUsd}
          busy={action.busy}
          onSave={(usd) => {
            save(() => setConfirmAbove(usd));
          }}
        />
      </Panel>

      <Panel title="Questo mese, per fornitore">
        {spend.providers.map((provider) => (
          <ProviderRow
            key={provider.connectionId}
            provider={provider}
            cap={capOf(provider.connectionId)}
            busy={action.busy}
            onSaveCap={(usd) => {
              save(() => setMonthlyCap(provider.connectionId, usd));
            }}
          />
        ))}
        <p className="hint">
          Conviene impostare un limite anche nel pannello di ogni fornitore: lì vale anche quando
          Filmzy è chiuso.
        </p>
      </Panel>

      {spend.films.length === 0 ? null : (
        <Panel title="Per film">
          {spend.films.map((film) => (
            <p key={film.projectId} className="hint">
              Film {film.projectId} · {formatUsd(film.spentUsd)}
            </p>
          ))}
        </Panel>
      )}
    </>
  );
}

function ProviderRow({
  provider,
  cap,
  busy,
  onSaveCap,
}: {
  provider: ProviderSpend;
  cap: number | undefined;
  busy: boolean;
  onSaveCap: (usd: number | null) => void;
}) {
  const badge = spendBadge(provider);

  return (
    <div className="row">
      <div className="row-head">
        <p>
          <strong>{provider.label}</strong> · {spendLine(provider)}
          {badge === undefined ? null : (
            <span className="badge" data-tone={badge.tone === 'reached' ? 'accent' : 'plain'}>
              {badge.text}
            </span>
          )}
        </p>
      </div>
      {provider.capUsd === undefined || provider.percent === undefined ? null : (
        <progress
          aria-label={`Spesa di ${provider.label}`}
          max={100}
          value={Math.min(100, provider.percent)}
        />
      )}
      <UsdLimitBox
        id={`cap-${provider.connectionId}`}
        label="Limite di spesa mensile"
        placeholder="Nessun limite · importo in $"
        value={cap}
        busy={busy}
        onSave={onSaveCap}
      />
    </div>
  );
}

import type { ConnectionsOverview, ProviderState } from '@filmzy/contracts';
import { useState } from 'react';

import { fetchConnections, setFilmBudget } from '../api/connections';
import { Notice, Panel } from '../components/ui';
import { skipWelcome } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { GROUP_LABELS, providerStatus } from '../settings/connections/labels';
import { mergedProviders, parseUsd, type MergedProvider } from '../settings/connections/model';
import { KeyStep, ServicesStep } from '../settings/connections/ProviderWizard';
import { describeError } from '../settings/messages';
import { useAction } from '../settings/use-action';

type Stage =
  | { name: 'choose' }
  | { name: 'provider'; index: number; step: 'key' | 'services' }
  | { name: 'spend' }
  | { name: 'done' };

interface Props {
  /** Dopo «Inizia il tuo primo film» o «Salta per ora»: la home ricontrolla e si mostra. */
  onFinish: () => void;
}

/**
 * «Benvenuto in Filmzy» (T2.7): al primo avvio, fornitori → chiave → servizi → spese. Riusa i
 * passi della finestra «Aggiungi un fornitore»: un fornitore è uno solo anche se lavora per più
 * tipi di lavoro (fal per immagini e video), con una chiave sola. Si può saltare e rifare più tardi
 * dalle Impostazioni.
 */
export function WelcomePage({ onFinish }: Props) {
  const { state, setData } = useResource(fetchConnections);
  const [stage, setStage] = useState<Stage>({ name: 'choose' });
  const [chosen, setChosen] = useState<string[]>([]);

  if (state.status === 'loading') return <p className="hint">Sto preparando Filmzy…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const overview = state.data;
  const offered = mergedProviders(overview);
  const picked = offered.filter((entry) => chosen.includes(entry.provider.connectionId));
  const reload = async () => {
    setData(await fetchConnections());
  };

  const skip = () => {
    skipWelcome();
    onFinish();
  };

  if (stage.name === 'choose') {
    return (
      <Panel title="Benvenuto in Filmzy">
        <p className="hint">
          Per fare un film servono alcuni servizi di intelligenza artificiale. Scegli quelli da
          collegare ora.
        </p>
        <ChooseProviders
          offered={offered}
          chosen={chosen}
          onChange={setChosen}
          onNext={() => {
            setStage({ name: 'provider', index: 0, step: 'key' });
          }}
          onSkip={skip}
        />
        <p className="hint">
          ✦ Le chiavi restano sul tuo computer. Puoi collegare altri servizi più avanti, nelle
          Impostazioni.
        </p>
      </Panel>
    );
  }

  if (stage.name === 'provider') {
    const current = picked[stage.index];
    // Nessun fornitore scelto da collegare (o finiti): si passa alle spese.
    if (current === undefined) {
      return (
        <SpendStep
          overview={overview}
          onOverview={setData}
          onNext={() => {
            setStage({ name: 'done' });
          }}
        />
      );
    }
    // Il fornitore si rilegge dal quadro: dopo aver scritto la chiave è cambiato.
    const fresh =
      mergedProviders(overview).find(
        (entry) => entry.provider.connectionId === current.provider.connectionId,
      ) ?? current;
    const goNext = () => {
      setStage(
        stage.index + 1 < picked.length
          ? { name: 'provider', index: stage.index + 1, step: 'key' }
          : { name: 'spend' },
      );
    };

    return (
      <Panel title="Benvenuto in Filmzy">
        <p className="hint">
          Fornitore {String(stage.index + 1)} di {String(picked.length)} · {fresh.provider.label}
        </p>
        {stage.step === 'key' ? (
          <>
            <p className="hint">
              Collega {fresh.provider.label}. La chiave viene salvata solo su questo computer.
            </p>
            <KeyStep
              provider={fresh.provider}
              onReload={reload}
              onNext={() => {
                setStage({ name: 'provider', index: stage.index, step: 'services' });
              }}
              onCancel={skip}
            />
          </>
        ) : (
          <>
            <p className="hint">Scegli i servizi da usare per questo fornitore.</p>
            <ServicesStep
              groups={fresh.groups}
              provider={fresh.provider}
              overview={overview}
              showCap
              onOverview={setData}
              onNext={goNext}
              onCancel={skip}
            />
          </>
        )}
      </Panel>
    );
  }

  if (stage.name === 'spend') {
    return (
      <SpendStep
        overview={overview}
        onOverview={setData}
        onNext={() => {
          setStage({ name: 'done' });
        }}
      />
    );
  }

  return (
    <Panel title="Tutto pronto">
      {picked.map((entry) => (
        <p key={entry.provider.connectionId}>
          ✓ {entry.provider.label} collegato ·{' '}
          {entry.groups.map(({ group }) => GROUP_LABELS[group].toLowerCase()).join(', ')}
        </p>
      ))}
      <div className="actions">
        <button type="button" className="button" data-kind="primary" onClick={onFinish}>
          Inizia il tuo primo film
        </button>
      </div>
    </Panel>
  );
}

export function ChooseProviders({
  offered,
  chosen,
  onChange,
  onNext,
  onSkip,
}: {
  offered: MergedProvider[];
  chosen: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      {offered.length === 0 ? (
        <Notice tone="info">
          Non ci sono fornitori da collegare. Si accendono da Impostazioni › Avanzate.
        </Notice>
      ) : (
        offered.map((entry) => (
          <ProviderChoice
            key={entry.provider.connectionId}
            entry={entry}
            checked={chosen.includes(entry.provider.connectionId)}
            onToggle={(on) => {
              const id = entry.provider.connectionId;
              onChange(on ? [...chosen, id] : chosen.filter((other) => other !== id));
            }}
          />
        ))
      )}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={chosen.length === 0}
          onClick={onNext}
        >
          Continua
        </button>
        <button type="button" className="button" onClick={onSkip}>
          Salta per ora
        </button>
      </div>
    </>
  );
}

function ProviderChoice({
  entry,
  checked,
  onToggle,
}: {
  entry: MergedProvider;
  checked: boolean;
  onToggle: (on: boolean) => void;
}) {
  const provider: ProviderState = entry.provider;
  return (
    <label className="row service-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onToggle(event.target.checked);
        }}
      />
      <span>
        <strong>{provider.label}</strong> ·{' '}
        {entry.groups.map(({ group }) => GROUP_LABELS[group].toLowerCase()).join(', ')} ·{' '}
        {providerStatus(provider).text}
      </span>
    </label>
  );
}

export function SpendStep({
  overview,
  onOverview,
  onNext,
}: {
  overview: ConnectionsOverview;
  onOverview: (overview: ConnectionsOverview) => void;
  onNext: () => void;
}) {
  const [text, setText] = useState(
    overview.limits.filmBudgetUsd === undefined ? '' : String(overview.limits.filmBudgetUsd),
  );
  const action = useAction();
  const amount = parseUsd(text);

  const save = () => {
    if (amount === undefined) return;
    action.run(async () => {
      onOverview(await setFilmBudget(amount));
      onNext();
    });
  };

  return (
    <Panel title="Quanto vuoi spendere?">
      <div className="field">
        <label htmlFor="film-budget">Limite per film</label>
        <input
          id="film-budget"
          type="text"
          inputMode="decimal"
          placeholder="Facoltativo · importo in $ · vuoto significa nessun limite"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
        {amount === undefined ? (
          <p className="field-error">Scrivi un importo maggiore di zero.</p>
        ) : null}
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={action.busy || amount === undefined}
          onClick={save}
        >
          Continua
        </button>
        <button type="button" className="button" onClick={onNext}>
          Salta, non mettere un limite
        </button>
      </div>
    </Panel>
  );
}

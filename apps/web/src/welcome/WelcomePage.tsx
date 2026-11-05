import type { ConnectionsOverview, ModelGroup, ProviderState } from '@filmzy/contracts';
import { useState, type ReactNode } from 'react';

import { fetchConnections, setFilmBudget } from '../api/connections';
import { Brand } from '../components/Brand';
import { Notice } from '../components/ui';
import { skipWelcome } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { GROUP_LABELS, isLinked, providerStatus } from '../settings/connections/labels';
import { mergedProviders, parseUsd, type MergedProvider } from '../settings/connections/model';
import { KeyStep, ServicesStep } from '../settings/connections/ProviderWizard';
import { describeError } from '../settings/messages';
import { useAction } from '../settings/use-action';

type Stage =
  | { name: 'choose' }
  | { name: 'provider'; index: number; step: 'key' | 'services' }
  | { name: 'spend' };

const STEP_NAMES = ['Fornitori', 'Chiave', 'Servizi', 'Spese'] as const;

function stepNumber(stage: Stage): number {
  if (stage.name === 'choose') return 1;
  if (stage.name === 'spend') return 4;
  return stage.step === 'key' ? 2 : 3;
}

/** Il passo prima: «Indietro» non fa perdere niente, le scelte fatte restano salvate. */
export function previousStage(stage: Stage, pickedCount: number): Stage {
  const lastServices = (index: number): Stage => ({ name: 'provider', index, step: 'services' });
  if (stage.name === 'spend') {
    return pickedCount > 0 ? lastServices(pickedCount - 1) : { name: 'choose' };
  }
  if (stage.name === 'provider' && stage.step === 'services') {
    return { name: 'provider', index: stage.index, step: 'key' };
  }
  if (stage.name === 'provider' && stage.index > 0) return lastServices(stage.index - 1);
  return { name: 'choose' };
}

/** Le sezioni della scelta, come nel disegno. Un fornitore sta una volta sola: è uno anche se fa più lavori. */
const SECTIONS: readonly { title: string; groups: readonly ModelGroup[] }[] = [
  { title: 'Testo', groups: ['text', 'vision'] },
  { title: 'Immagini e video', groups: ['image', 'video'] },
  { title: 'Musica ed effetti', groups: ['audio'] },
  { title: 'Voci', groups: ['voice'] },
];

export function providerSections(
  offered: readonly MergedProvider[],
): { title: string; entries: MergedProvider[] }[] {
  const placed = new Set<string>();
  return SECTIONS.flatMap(({ title, groups }) => {
    const entries = offered.filter((entry) => {
      const { connectionId } = entry.provider;
      if (placed.has(connectionId)) return false;
      if (!entry.groups.some(({ group }) => groups.includes(group))) return false;
      placed.add(connectionId);
      return true;
    });
    return entries.length === 0 ? [] : [{ title, entries }];
  });
}

const usesOf = (entry: MergedProvider): string =>
  entry.groups.map(({ group }) => GROUP_LABELS[group].toLowerCase()).join(', ');

interface Props {
  /** Dopo «Inizia il tuo primo film» o «Salta per ora»: la home ricontrolla e si mostra. */
  onFinish: () => void;
}

/**
 * «Benvenuto in Filmzy» (T2.7, T6.1): al primo avvio, fornitori → chiave → servizi → spese. Riusa i passi
 * della finestra «Aggiungi un fornitore»: un fornitore è uno solo anche se lavora per più tipi di lavoro
 * (fal per immagini e video), con una chiave sola. Si può saltare e rifare più tardi dalle Impostazioni.
 */
export function WelcomePage({ onFinish }: Props) {
  const { state, setData } = useResource(fetchConnections);
  const [stage, setStage] = useState<Stage>({ name: 'choose' });
  const [chosen, setChosen] = useState<string[]>([]);

  if (state.status === 'loading') {
    return (
      <main className="welcome">
        <p className="hint">Un attimo…</p>
      </main>
    );
  }
  if (state.status === 'error') {
    return (
      <main className="welcome">
        <header className="welcome-bar">
          <Brand />
        </header>
        <div className="welcome-failure">
          <Notice tone="error">{describeError(state.error)}</Notice>
          <div className="actions">
            <button type="button" className="button" onClick={onFinish}>
              Vai ai tuoi film
            </button>
          </div>
        </div>
      </main>
    );
  }

  const overview = state.data;
  // Si rilegge dal quadro a ogni disegno: dopo aver scritto una chiave il fornitore è cambiato.
  const offered = mergedProviders(overview);
  const picked = offered.filter((entry) => chosen.includes(entry.provider.connectionId));
  const reload = async () => {
    setData(await fetchConnections());
  };
  const back = () => {
    setStage(previousStage(stage, picked.length));
  };
  // Finita o saltata, la procedura non si ripropone: se nessun fornitore risultasse collegato tornerebbe qui.
  const leave = () => {
    skipWelcome();
    onFinish();
  };

  if (stage.name === 'choose') {
    return (
      <WelcomeLayout
        stage={stage}
        title="Collega i tuoi fornitori"
        intro="Filmzy è gratuito. Per cominciare servono un fornitore per il testo e uno per immagini e video. Collega le tue chiavi personali: paghi solo l’utilizzo dei servizi scelti."
      >
        <ChooseProviders
          offered={offered}
          chosen={chosen}
          onChange={setChosen}
          onNext={() => {
            setStage({ name: 'provider', index: 0, step: 'key' });
          }}
          onSkip={leave}
        />
        <p className="welcome-note">
          ✦ Le chiavi restano sul tuo computer. Puoi collegare altri servizi più avanti, nelle
          Impostazioni.
        </p>
      </WelcomeLayout>
    );
  }

  const current = stage.name === 'provider' ? picked[stage.index] : undefined;
  if (stage.name === 'provider' && current !== undefined) {
    const { provider, groups } = current;
    const counter = `Fornitore ${String(stage.index + 1)} di ${String(picked.length)} · ${provider.label}`;
    const goNext = () => {
      setStage(
        stage.index + 1 < picked.length
          ? { name: 'provider', index: stage.index + 1, step: 'key' }
          : { name: 'spend' },
      );
    };

    if (stage.step === 'key') {
      return (
        <WelcomeLayout
          stage={stage}
          title="Collega la tua chiave"
          eyebrow={counter}
          intro={`Collega ${provider.label}. La chiave viene salvata solo su questo computer.`}
        >
          <section className="welcome-card">
            <ProviderName entry={current} />
            <KeyStep
              provider={provider}
              onReload={reload}
              onNext={() => {
                setStage({ name: 'provider', index: stage.index, step: 'services' });
              }}
              onCancel={back}
              cancelLabel="Indietro"
            />
          </section>
          <section className="welcome-note">
            <strong>Tu scegli, tu controlli</strong>
            <p>
              Filmzy non vende utilizzi o abbonamenti. I costi delle generazioni vengono addebitati
              direttamente dal servizio scelto.
            </p>
          </section>
        </WelcomeLayout>
      );
    }

    return (
      <WelcomeLayout
        stage={stage}
        title="Scegli i servizi da usare"
        eyebrow={counter}
        intro={
          stage.index + 1 < picked.length
            ? `Scegli i servizi da usare per questo fornitore. Dopo passerai alla chiave e ai servizi del fornitore ${String(stage.index + 2)} di ${String(picked.length)}.`
            : 'Scegli i servizi da usare per questo fornitore.'
        }
      >
        <section className="welcome-card">
          <h2>{provider.label} · Servizi</h2>
          <p className="hint">I prezzi sono indicativi e dipendono dal contenuto richiesto.</p>
          <ServicesStep
            groups={groups}
            provider={provider}
            overview={overview}
            showCap
            onOverview={setData}
            onNext={goNext}
            onCancel={back}
            nextLabel="Continua"
            cancelLabel="Indietro"
          />
        </section>
        <p className="welcome-note">
          I servizi attivi compaiono subito in «Cambia servizio». Puoi cambiarli quando vuoi, nelle
          Impostazioni.
        </p>
      </WelcomeLayout>
    );
  }

  return (
    <WelcomeLayout
      stage={{ name: 'spend' }}
      title="Vuoi mettere un limite di spesa?"
      intro="Una precauzione in più, per stare tranquilli. Nessun tetto è impostato in partenza."
    >
      <SpendStep
        overview={overview}
        onOverview={setData}
        onNext={leave}
        onBack={back}
        ready={<ReadySummary entries={picked} />}
      />
    </WelcomeLayout>
  );
}

function WelcomeLayout({
  stage,
  title,
  eyebrow = 'INIZIA CON FILMZY',
  intro,
  children,
}: {
  stage: Stage;
  title: string;
  eyebrow?: string;
  intro: string;
  children: ReactNode;
}) {
  const current = stepNumber(stage);
  return (
    <main className="welcome">
      <header className="welcome-bar">
        <Brand />
      </header>
      <ol className="welcome-steps" aria-label="I passi">
        {STEP_NAMES.map((name, index) => (
          <li
            key={name}
            data-state={index + 1 === current ? 'current' : index + 1 < current ? 'done' : 'next'}
            {...(index + 1 === current ? { 'aria-current': 'step' as const } : {})}
          >
            <span>{String(index + 1)}</span> {name}
          </li>
        ))}
      </ol>
      <div className="welcome-body">
        <aside>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="hint">{intro}</p>
          <hr />
          <p className="hint">
            Il tuo piccolo grande cinema. Nessun account Filmzy, nessun abbonamento.
          </p>
          <span className="welcome-step-chip">Passo {String(current)} di 4</span>
        </aside>
        <div className="welcome-content">{children}</div>
      </div>
    </main>
  );
}

function ProviderName({ entry }: { entry: MergedProvider }) {
  const provider: ProviderState = entry.provider;
  return (
    <div className="welcome-provider">
      <span className="welcome-tile" aria-hidden="true">
        {provider.label.charAt(0)}
      </span>
      <span className="welcome-provider-text">
        <strong>{provider.label}</strong>
        <span className="hint">
          {usesOf(entry)}
          {isLinked(provider) ? ` · ${providerStatus(provider).text}` : ''}
        </span>
        {provider.keyRequired && provider.key?.present !== true && provider.keyUrl !== undefined ? (
          // Una pagina del fornitore: si apre fuori dal programma, senza dirgli da dove si arriva.
          <a href={provider.keyUrl} target="_blank" rel="noreferrer">
            Come ottengo la chiave? ↗
          </a>
        ) : null}
      </span>
    </div>
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
        providerSections(offered).map(({ title, entries }) => (
          <section key={title} className="welcome-card">
            <h2>{title}</h2>
            {entries.map((entry) => {
              const id = entry.provider.connectionId;
              const isChosen = chosen.includes(id);
              return (
                <div key={id} className="welcome-choice">
                  <ProviderName entry={entry} />
                  <button
                    type="button"
                    className="button"
                    aria-pressed={isChosen}
                    onClick={() => {
                      onChange(isChosen ? chosen.filter((other) => other !== id) : [...chosen, id]);
                    }}
                  >
                    {isChosen ? '✓ Scelto' : 'Scegli'}
                  </button>
                </div>
              );
            })}
          </section>
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

/** Per fare un film servono il testo, le immagini e il video: un fornitore solo può non bastare. */
const NEEDED_FOR_A_FILM: readonly ModelGroup[] = ['text', 'image', 'video'];

/** Cosa è pronto, prima di cominciare. Solo i fornitori collegati davvero. */
export function ReadySummary({ entries }: { entries: readonly MergedProvider[] }) {
  const linked = entries.filter((entry) => isLinked(entry.provider));
  if (linked.length === 0) return null;
  const covered = new Set(linked.flatMap((entry) => entry.groups.map(({ group }) => group)));
  const missing = NEEDED_FOR_A_FILM.filter((group) => !covered.has(group));
  return (
    <section className="welcome-card">
      <h2>{missing.length === 0 ? 'Tutto pronto per la tua prima storia' : 'Quasi pronto'}</h2>
      {linked.map((entry) => (
        <p key={entry.provider.connectionId}>
          ✓ {entry.provider.label} collegato · {usesOf(entry)}
        </p>
      ))}
      {missing.length === 0 ? null : (
        <p>
          Per fare un film manca ancora un fornitore per:{' '}
          {missing.map((group) => GROUP_LABELS[group].toLowerCase()).join(', ')}. Puoi collegarlo
          quando vuoi, nelle Impostazioni.
        </p>
      )}
      <p className="hint">Le tue idee e i tuoi film restano sul tuo computer.</p>
    </section>
  );
}

export function SpendStep({
  overview,
  onOverview,
  onNext,
  onBack,
  ready,
}: {
  overview: ConnectionsOverview;
  onOverview: (overview: ConnectionsOverview) => void;
  onNext: () => void;
  onBack?: () => void;
  ready?: ReactNode;
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
    <>
      <section className="welcome-card">
        <h2>Decidi tu quanto spendere</h2>
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
        <p className="hint">
          Filmzy ti mostra una stima prima di ogni generazione. Se scegli un limite, ti avvisa
          quando stai per superarlo.
        </p>
        {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
        <div className="actions">
          <button type="button" className="button" onClick={onNext}>
            Salta, non mettere un limite
          </button>
        </div>
      </section>
      {ready}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={action.busy || amount === undefined}
          onClick={save}
        >
          Inizia il tuo primo film
        </button>
        {onBack === undefined ? null : (
          <button type="button" className="button" onClick={onBack}>
            Indietro
          </button>
        )}
      </div>
    </>
  );
}

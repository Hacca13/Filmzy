import { useState } from 'react';

import { fetchPreferences, savePreferences } from '../api/preferences';
import { Notice, Panel, Toggle } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from './messages';

interface ViewProps {
  moderation: boolean;
  /** L'utente ha chiesto di spegnerlo e deve ancora confermare: prima l'avvertenza. */
  confirmingOff: boolean;
  busy: boolean;
  problem?: string | undefined;
  onToggle: (on: boolean) => void;
  onConfirmOff: () => void;
  onKeepOn: () => void;
}

/**
 * Impostazioni › Prudenza (T3.3, D54). Le accortezze sono accese all'inizio e l'utente può
 * cambiarle, ma spegnerle chiede una conferma che dice cosa rischia (D19, D28). Per ora c'è il
 * controllo dei testi; le altre due del design (solo personaggi generati, dicitura nei titoli)
 * arrivano con le funzioni che le usano.
 */
export function PrudenceView({
  moderation,
  confirmingOff,
  busy,
  problem,
  onToggle,
  onConfirmOff,
  onKeepOn,
}: ViewProps) {
  return (
    <Panel title="Prudenza">
      <p className="hint">Accortezze per creare con più consapevolezza. Sono accese all’inizio.</p>
      <Toggle
        label="Controlla i testi prima di ogni spesa"
        hint="Il moderatore controlla ciò che scrivi prima che venga inviato al servizio scelto."
        checked={moderation}
        disabled={busy || confirmingOff}
        onChange={onToggle}
      />
      {confirmingOff ? (
        <div className="confirm" role="alertdialog" aria-label="Conferma lo spegnimento">
          <p>
            Senza il controllo, i tuoi testi vanno al servizio così come sono: può rifiutarli, o
            bloccare il tuo account se non rispettano le sue regole. Resta tua la responsabilità di
            ciò che crei.
          </p>
          <div className="actions">
            <button type="button" className="button" disabled={busy} onClick={onKeepOn}>
              Lascia acceso
            </button>
            <button
              type="button"
              className="button"
              data-kind="danger"
              disabled={busy}
              onClick={onConfirmOff}
            >
              Spegni lo stesso
            </button>
          </div>
        </div>
      ) : null}
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </Panel>
  );
}

export function PrudencePage() {
  const { state, setData } = useResource(fetchPreferences);
  const [confirmingOff, setConfirmingOff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const preferences = state.data;

  const save = (moderation: boolean) => {
    setBusy(true);
    setProblem(undefined);
    savePreferences({ ...preferences, moderation })
      .then(setData, (error: unknown) => {
        setProblem(describeError(error));
      })
      .finally(() => {
        setBusy(false);
        setConfirmingOff(false);
      });
  };

  return (
    <PrudenceView
      moderation={preferences.moderation}
      confirmingOff={confirmingOff}
      busy={busy}
      problem={problem}
      // Accendere è sempre sicuro e subito; spegnere passa dall'avvertenza.
      onToggle={(on) => {
        if (on) save(true);
        else setConfirmingOff(true);
      }}
      onConfirmOff={() => {
        save(false);
      }}
      onKeepOn={() => {
        setConfirmingOff(false);
      }}
    />
  );
}

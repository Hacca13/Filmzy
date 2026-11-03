import { useState } from 'react';

import { fetchPreferences, savePreferences } from '../api/preferences';
import { Notice, Panel, Toggle } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from './messages';

/** Le accortezze che l'utente può spegnere: il controllo dei testi (D54) e quello delle foto (D19). */
export type PrudenceKey = 'moderation' | 'imageCheck';

interface ViewProps {
  moderation: boolean;
  imageCheck: boolean;
  /** L'accortezza che l'utente ha chiesto di spegnere e deve ancora confermare: prima l'avvertenza. */
  confirmingOff: PrudenceKey | undefined;
  busy: boolean;
  problem?: string | undefined;
  onToggle: (key: PrudenceKey, on: boolean) => void;
  onConfirmOff: () => void;
  onKeepOn: () => void;
}

/** Cosa si rischia a spegnere ognuna, in parole semplici (D19, D28). */
const WARNINGS: Record<PrudenceKey, string> = {
  moderation:
    'Senza il controllo, i tuoi testi vanno al servizio così come sono: può rifiutarli, o bloccare il tuo account se non rispettano le sue regole. Resta tua la responsabilità di ciò che crei.',
  imageCheck:
    'Senza il controllo, le foto che carichi si salvano così come sono, anche se ci sono persone, marchi o personaggi noti: il servizio che le userà può rifiutarle, o bloccare il tuo account. Resta tua la responsabilità di ciò che carichi.',
};

/**
 * Impostazioni › Prudenza (T3.3, T4.8, D54, D19). Le accortezze sono accese all'inizio e l'utente
 * può cambiarle, ma spegnerle chiede una conferma che dice cosa rischia (D19, D28). Ci sono il
 * controllo dei testi e quello delle foto caricate; le altre due del design (solo personaggi
 * generati, dicitura nei titoli) arrivano con le funzioni che le usano.
 */
export function PrudenceView({
  moderation,
  imageCheck,
  confirmingOff,
  busy,
  problem,
  onToggle,
  onConfirmOff,
  onKeepOn,
}: ViewProps) {
  const waiting = busy || confirmingOff !== undefined;

  return (
    <Panel title="Prudenza">
      <p className="hint">Accortezze per creare con più consapevolezza. Sono accese all’inizio.</p>
      <Toggle
        label="Controlla i testi prima di ogni spesa"
        hint="Il moderatore controlla ciò che scrivi prima che venga inviato al servizio scelto."
        checked={moderation}
        disabled={waiting}
        onChange={(on) => {
          onToggle('moderation', on);
        }}
      />
      <Toggle
        label="Controlla le foto che carichi"
        hint="Prima di salvare una foto, un servizio che legge le immagini guarda che non ci siano persone, marchi o personaggi noti. Una copia della foto va a quel servizio."
        checked={imageCheck}
        disabled={waiting}
        onChange={(on) => {
          onToggle('imageCheck', on);
        }}
      />
      {confirmingOff === undefined ? null : (
        <div className="confirm" role="alertdialog" aria-label="Conferma lo spegnimento">
          <p>{WARNINGS[confirmingOff]}</p>
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
      )}
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </Panel>
  );
}

export function PrudencePage() {
  const { state, setData } = useResource(fetchPreferences);
  const [confirmingOff, setConfirmingOff] = useState<PrudenceKey>();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const preferences = state.data;

  const save = (key: PrudenceKey, on: boolean) => {
    setBusy(true);
    setProblem(undefined);
    savePreferences({ ...preferences, [key]: on })
      .then(setData, (error: unknown) => {
        setProblem(describeError(error));
      })
      .finally(() => {
        setBusy(false);
        setConfirmingOff(undefined);
      });
  };

  return (
    <PrudenceView
      moderation={preferences.moderation}
      imageCheck={preferences.imageCheck}
      confirmingOff={confirmingOff}
      busy={busy}
      problem={problem}
      // Accendere è sempre sicuro e subito; spegnere passa dall'avvertenza.
      onToggle={(key, on) => {
        if (on) save(key, true);
        else setConfirmingOff(key);
      }}
      onConfirmOff={() => {
        if (confirmingOff !== undefined) save(confirmingOff, false);
      }}
      onKeepOn={() => {
        setConfirmingOff(undefined);
      }}
    />
  );
}

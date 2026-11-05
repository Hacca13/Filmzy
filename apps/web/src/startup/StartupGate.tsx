import type { StartupBlock } from '@filmzy/contracts';
import { useEffect, useState, type ReactNode } from 'react';

import spinner from '../assets/caricamento.svg';
import { waitUntilServerIsReady } from '../api/health';
import { openStartupFolder, retryStartup } from '../api/startup';
import { Brand } from '../components/Brand';
import { Notice } from '../components/ui';
import { openFolderFailureText } from '../films/sound/export-model';
import { useAction } from '../settings/use-action';

export type StartupState =
  | { name: 'waiting' }
  | { name: 'ready' }
  | { name: 'unreachable' }
  | { name: 'blocked'; block: StartupBlock };

/**
 * Finché il programma non è pronto non si vede nient'altro (§6.2): tutte le schermate danno per scontato che
 * il server risponda. All'avvio il server può metterci qualche secondo, per esempio se aggiorna i dati.
 */
export function StartupGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StartupState>({ name: 'waiting' });
  const [attempt, setAttempt] = useState(0);
  const action = useAction();

  useEffect(() => {
    const controller = new AbortController();
    waitUntilServerIsReady({ signal: controller.signal }).then(
      (health) => {
        setState(
          health.status === 'ok' ? { name: 'ready' } : { name: 'blocked', block: health.block },
        );
      },
      () => {
        // Se la pagina è stata chiusa durante l'attesa non è un errore da mostrare.
        if (!controller.signal.aborted) setState({ name: 'unreachable' });
      },
    );
    return () => {
      controller.abort();
    };
  }, [attempt]);

  if (state.name === 'ready') return children;
  return (
    <StartupScreen
      state={state}
      busy={action.busy}
      problem={action.problem}
      onRetry={() => {
        action.run(async () => {
          await retryStartup();
          setState({ name: 'waiting' });
          setAttempt(attempt + 1);
        });
      }}
      onOpenFolder={() => {
        action.run(openStartupFolder, openFolderFailureText);
      }}
    />
  );
}

/** Quello che si vede: senza stato, così si prova da solo. Nessuna parola tecnica (regola 12). */
export function StartupScreen({
  state,
  busy,
  problem,
  onRetry,
  onOpenFolder,
}: {
  state: Exclude<StartupState, { name: 'ready' }>;
  busy: boolean;
  problem: string | undefined;
  onRetry: () => void;
  onOpenFolder: () => void;
}) {
  if (state.name === 'waiting') {
    return (
      <main className="startup" role="status">
        <Brand size="large" />
        <p>Sto preparando Filmzy…</p>
        <img className="startup-spinner" src={spinner} alt="" />
      </main>
    );
  }
  if (state.name === 'unreachable') {
    return (
      <main className="startup" role="alert">
        <Brand size="large" />
        <h1>Filmzy non riesce a partire</h1>
        <p>Chiudi il programma e riaprilo.</p>
      </main>
    );
  }
  if (state.block.reason === 'database_too_new') {
    return (
      <main className="startup" role="alert">
        <Brand />
        <h1>Questi film sono stati creati con una versione più nuova di Filmzy</h1>
        <p>Per aprirli, aggiorna Filmzy. Non abbiamo cambiato niente nei tuoi film.</p>
      </main>
    );
  }

  const { backupFile } = state.block;
  return (
    <main className="startup" role="alert">
      <Brand />
      <h1>Non riesco ad aggiornare i tuoi dati</h1>
      <p>
        {backupFile === undefined
          ? 'I tuoi film sono al sicuro: non ho cambiato niente.'
          : 'I tuoi film sono al sicuro: ho rimesso la copia di prima.'}
      </p>
      {backupFile === undefined ? null : (
        <div className="field">
          <label htmlFor="startup-backup">La copia di sicurezza · sola lettura</label>
          <input id="startup-backup" type="text" readOnly value={backupFile} />
        </div>
      )}
      <div className="actions">
        <button type="button" className="button" disabled={busy} onClick={onRetry}>
          Riprova
        </button>
        <button type="button" className="button" disabled={busy} onClick={onOpenFolder}>
          Apri la cartella
        </button>
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </main>
  );
}

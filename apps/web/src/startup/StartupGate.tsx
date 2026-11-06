import type { StartupBlock } from '@filmzy/contracts';
import { useEffect, useState, type ReactNode } from 'react';

import spinner from '../assets/caricamento.svg';
import { waitUntilServerIsReady } from '../api/health';
import { openStartupFolder, retryStartup } from '../api/startup';
import { Brand } from '../components/Brand';
import { Notice } from '../components/ui';
import { closeDesktopApp, isDesktopApp } from '../lib/desktop';
import { openFolderFailureText } from '../films/sound/export-model';
import { useAction } from '../settings/use-action';

export type StartupState =
  | { name: 'waiting' }
  | { name: 'ready' }
  | { name: 'unreachable' }
  | { name: 'blocked'; block: StartupBlock };

/**
 * Aspetta il server, e non smette di controllare nemmeno dopo aver detto che non riesce a partire: un
 * aggiornamento dei dati su un disco lento può metterci più dei 30 secondi di attesa, e chi ha chiuso a metà
 * farebbe più danni di chi aspetta. Si ferma solo se la pagina si chiude.
 */
export async function watchStartup(
  onState: (state: StartupState) => void,
  signal: AbortSignal,
  wait: typeof waitUntilServerIsReady = waitUntilServerIsReady,
): Promise<void> {
  // Una funzione: il segnale cambia durante l'attesa, e il compilatore crederebbe di sapere già com'è.
  const closed = () => signal.aborted;
  while (!closed()) {
    try {
      const health = await wait({ signal });
      onState(
        health.status === 'ok' ? { name: 'ready' } : { name: 'blocked', block: health.block },
      );
      return;
    } catch {
      if (!closed()) onState({ name: 'unreachable' });
    }
  }
}

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
    void watchStartup(setState, controller.signal);
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
      {...(isDesktopApp() ? { onClose: closeDesktopApp } : {})}
    />
  );
}

function dataFailureText({ reason, backupFile }: StartupBlock): string {
  if (reason === 'database_unreadable') {
    return backupFile === undefined
      ? 'Non ho cambiato niente. Controlla che sul disco ci sia spazio, poi riprova.'
      : 'Non sono riuscito a rimettere la copia di prima, ma c’è ancora. Controlla che sul disco ci sia spazio, poi riprova.';
  }
  return backupFile === undefined
    ? 'I tuoi film sono al sicuro: non ho cambiato niente.'
    : 'I tuoi film sono al sicuro: ho rimesso la copia di prima.';
}

/** Quello che si vede: senza stato, così si prova da solo. Nessuna parola tecnica (regola 12). */
export function StartupScreen({
  state,
  busy,
  problem,
  onRetry,
  onOpenFolder,
  onClose,
}: {
  state: Exclude<StartupState, { name: 'ready' }>;
  busy: boolean;
  problem: string | undefined;
  onRetry: () => void;
  onOpenFolder: () => void;
  /** Solo nel programma per computer: lì la finestra si chiude da qui (T6.4). */
  onClose?: () => void;
}) {
  const closeButton =
    onClose === undefined ? null : (
      <button type="button" className="button" onClick={onClose}>
        Chiudi
      </button>
    );
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
        {closeButton === null ? null : <div className="actions">{closeButton}</div>}
      </main>
    );
  }
  if (state.block.reason === 'database_too_new') {
    return (
      <main className="startup" role="alert">
        <Brand />
        <h1>Questi film sono stati creati con una versione più nuova di Filmzy</h1>
        <p>Per aprirli, aggiorna Filmzy. Non abbiamo cambiato niente nei tuoi film.</p>
        {closeButton === null ? null : <div className="actions">{closeButton}</div>}
      </main>
    );
  }

  const { reason, backupFile, file } = state.block;
  const place = backupFile ?? file;
  return (
    <main className="startup" role="alert">
      <Brand />
      <h1>
        {reason === 'database_unreadable'
          ? 'Non riesco ad aprire i tuoi dati'
          : 'Non riesco ad aggiornare i tuoi dati'}
      </h1>
      <p>{dataFailureText(state.block)}</p>
      {place === undefined ? null : (
        <div className="field">
          <label htmlFor="startup-place">
            {backupFile === undefined ? 'I tuoi dati' : 'La copia di sicurezza'} · sola lettura
          </label>
          <input id="startup-place" type="text" readOnly value={place} />
        </div>
      )}
      <div className="actions">
        <button type="button" className="button" disabled={busy} onClick={onRetry}>
          Riprova
        </button>
        <button type="button" className="button" disabled={busy} onClick={onOpenFolder}>
          Apri la cartella
        </button>
        {closeButton}
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </main>
  );
}

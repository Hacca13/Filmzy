import { useEffect, useState } from 'react';

import { waitUntilServerIsReady } from '../api/health';

type Status = 'checking' | 'ready' | 'unreachable';

/** Testi per l'utente: semplici, senza termini tecnici (regola 12 di CLAUDE.md). */
const MESSAGES: Record<Status, string> = {
  checking: 'Sto preparando Filmzy…',
  ready: 'Tutto pronto.',
  unreachable: 'Filmzy non riesce a partire. Chiudi il programma e riaprilo.',
};

export function ServerStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();
    waitUntilServerIsReady({ signal: controller.signal }).then(
      () => {
        setStatus('ready');
      },
      () => {
        // Se la pagina è stata chiusa durante l'attesa non è un errore da mostrare.
        if (!controller.signal.aborted) {
          setStatus('unreachable');
        }
      },
    );
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <p className="status" data-status={status} role="status">
      {MESSAGES[status]}
    </p>
  );
}

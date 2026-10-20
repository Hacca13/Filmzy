import { useEffect, useState } from 'react';

import { fetchHealth } from '../api/health';

type Status = 'checking' | 'ready' | 'unreachable';

/** Testi per l'utente: semplici, senza termini tecnici (regola 12 di CLAUDE.md). */
const MESSAGES: Record<Status, string> = {
  checking: 'Sto controllando che tutto sia pronto…',
  ready: 'Tutto pronto.',
  unreachable: 'Filmzy non riesce a partire. Chiudi il programma e riaprilo.',
};

export function ServerStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();
    fetchHealth(controller.signal).then(
      () => {
        setStatus('ready');
      },
      () => {
        // Se la pagina è stata chiusa durante la richiesta non è un errore da mostrare.
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

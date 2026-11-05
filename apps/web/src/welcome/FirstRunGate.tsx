import type { ReactNode } from 'react';

import { fetchConnections } from '../api/connections';
import { fetchProjects } from '../api/projects';
import { isWelcomeSkipped } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { hasLinkedProvider } from '../settings/connections/model';
import { WelcomePage } from './WelcomePage';

/**
 * Il primo avvio (T2.7, T6.1): se non c'è nessun fornitore collegato, nessun film e l'utente non ha
 * saltato, la procedura «Benvenuto in Filmzy» prende tutta la finestra. Altrimenti si vede la home: chi ha
 * già dei film e ha tolto una chiave non deve perderli di vista. Il server è già pronto: lo controlla
 * `StartupGate`. Se la lettura fallisce si va alla home, che ha il suo messaggio.
 */
async function loadFirstRun(signal: AbortSignal) {
  const [connections, films] = await Promise.all([fetchConnections(signal), fetchProjects(signal)]);
  return { connections, hasFilms: films.projects.length > 0 };
}

export function FirstRunGate({
  onFinish,
  children,
}: {
  onFinish: () => void;
  children: ReactNode;
}) {
  const { state } = useResource(loadFirstRun);

  if (state.status === 'loading') return null;
  if (
    state.status === 'error' ||
    state.data.hasFilms ||
    hasLinkedProvider(state.data.connections) ||
    isWelcomeSkipped()
  ) {
    return children;
  }
  return <WelcomePage onFinish={onFinish} />;
}

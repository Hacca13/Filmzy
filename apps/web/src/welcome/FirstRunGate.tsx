import type { ReactNode } from 'react';

import { fetchConnections } from '../api/connections';
import { isWelcomeSkipped } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { hasLinkedProvider } from '../settings/connections/model';
import { WelcomePage } from './WelcomePage';

/**
 * Il primo avvio (T2.7, T6.1): se non c'è nessun fornitore collegato e l'utente non ha saltato, la
 * procedura «Benvenuto in Filmzy» prende tutta la finestra. Altrimenti si vede la home. Il server è già
 * pronto: lo controlla `StartupGate`. Se la lettura fallisce si va alla home, che ha il suo messaggio.
 */
export function FirstRunGate({
  onFinish,
  children,
}: {
  onFinish: () => void;
  children: ReactNode;
}) {
  const { state } = useResource(fetchConnections);

  if (state.status === 'loading') return null;
  if (state.status === 'error' || hasLinkedProvider(state.data) || isWelcomeSkipped()) {
    return children;
  }
  return <WelcomePage onFinish={onFinish} />;
}

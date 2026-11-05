import { fetchConnections } from '../api/connections';
import { isWelcomeSkipped } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { hasLinkedProvider } from '../settings/connections/model';
import { WelcomePage } from './WelcomePage';

/**
 * Il primo avvio (T2.7): se non c'è nessun fornitore collegato e l'utente non ha saltato, mostra la
 * procedura «Benvenuto in Filmzy». Altrimenti non si vede. Il server è già pronto: lo controlla
 * `StartupGate`. Se la lettura fallisce non mostra niente: la home ha il suo messaggio d'errore.
 */
export function FirstRunGate({ onFinish }: { onFinish: () => void }) {
  const { state } = useResource(fetchConnections);

  if (state.status !== 'ready') return null;
  if (hasLinkedProvider(state.data) || isWelcomeSkipped()) return null;
  return <WelcomePage onFinish={onFinish} />;
}

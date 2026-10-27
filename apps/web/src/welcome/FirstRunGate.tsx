import { fetchConnections } from '../api/connections';
import { waitUntilServerIsReady } from '../api/health';
import { isWelcomeSkipped } from '../lib/welcome';
import { useResource } from '../lib/use-resource';
import { hasLinkedProvider } from '../settings/connections/model';
import { WelcomePage } from './WelcomePage';

/** Aspetta il server (all'avvio può metterci qualche secondo) e poi chiede come sono i fornitori. */
async function loadConnections(signal: AbortSignal) {
  await waitUntilServerIsReady({ signal });
  return fetchConnections(signal);
}

/**
 * Il primo avvio (T2.7): se non c'è nessun fornitore collegato e l'utente non ha saltato, mostra la
 * procedura «Benvenuto in Filmzy». Altrimenti non si vede. Se il server non risponde non mostra
 * niente: lo dice già la schermata di caricamento.
 */
export function FirstRunGate({ onFinish }: { onFinish: () => void }) {
  const { state } = useResource(loadConnections);

  if (state.status !== 'ready') return null;
  if (hasLinkedProvider(state.data) || isWelcomeSkipped()) return null;
  return <WelcomePage onFinish={onFinish} />;
}

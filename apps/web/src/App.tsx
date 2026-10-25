import { ServerStatus } from './components/ServerStatus';
import { useHashPath } from './lib/route';
import { SettingsPage } from './settings/SettingsPage';

export function App() {
  const path = useHashPath();

  if (path.startsWith('/impostazioni')) return <SettingsPage path={path} />;

  return (
    <main className="app">
      <h1>Filmzy</h1>
      <p>I tuoi cortometraggi, con l'intelligenza artificiale.</p>
      <ServerStatus />
      <p>
        <a href="#/impostazioni/generazione">Impostazioni</a>
      </p>
    </main>
  );
}

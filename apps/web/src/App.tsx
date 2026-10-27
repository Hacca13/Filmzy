import { useState } from 'react';

import { ServerStatus } from './components/ServerStatus';
import { useHashPath } from './lib/route';
import { SettingsPage } from './settings/SettingsPage';
import { FirstRunGate } from './welcome/FirstRunGate';
import { WelcomePage } from './welcome/WelcomePage';

function Home() {
  // Chiudere la procedura fa ricontrollare i fornitori: se ora ce n'è uno, il benvenuto sparisce.
  const [checks, setChecks] = useState(0);

  return (
    <main className="app">
      <h1>Filmzy</h1>
      <p>I tuoi cortometraggi, con l'intelligenza artificiale.</p>
      <ServerStatus />
      <p>
        <a href="#/impostazioni/connessioni">Impostazioni</a>
      </p>
      <FirstRunGate
        key={checks}
        onFinish={() => {
          setChecks(checks + 1);
        }}
      />
    </main>
  );
}

export function App() {
  const path = useHashPath();

  if (path.startsWith('/impostazioni')) return <SettingsPage path={path} />;
  if (path === '/benvenuto') {
    return (
      <main className="app">
        <WelcomePage
          onFinish={() => {
            window.location.hash = '#/';
          }}
        />
      </main>
    );
  }
  return <Home />;
}

import { useState } from 'react';

import { ServerStatus } from './components/ServerStatus';
import { FilmPage } from './films/FilmPage';
import { FilmsHome } from './films/FilmsHome';
import { IdeaWizard } from './films/IdeaWizard';
import { parseFilmRoute, type FilmRoute } from './films/routes';
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
      <FilmsHome />
    </main>
  );
}

function FilmScreen({ route }: { route: FilmRoute }) {
  return (
    <main className="app">
      {route.page === 'new' ? <IdeaWizard /> : null}
      {route.page === 'idea' ? <IdeaWizard filmId={route.id} /> : null}
      {route.page === 'film' ? <FilmPage filmId={route.id} /> : null}
    </main>
  );
}

export function App() {
  const path = useHashPath();
  const filmRoute = parseFilmRoute(path);

  if (filmRoute !== undefined) return <FilmScreen route={filmRoute} />;
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

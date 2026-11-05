import { useState, type ReactNode } from 'react';

import { Brand } from './components/Brand';
import { FilmPage } from './films/FilmPage';
import { FilmsHome } from './films/FilmsHome';
import { IdeaWizard } from './films/IdeaWizard';
import { parseFilmRoute, type FilmRoute } from './films/routes';
import { FilmSpendPage } from './films/spend/FilmSpendPage';
import { useHashPath } from './lib/route';
import { SettingsPage } from './settings/SettingsPage';
import { StartupGate } from './startup/StartupGate';
import { FirstRunGate } from './welcome/FirstRunGate';
import { WelcomePage } from './welcome/WelcomePage';

/** La barra del programma: il marchio porta a casa, e le impostazioni sono sempre lì. */
function AppBar() {
  return (
    <header className="app-bar">
      <a href="#/" aria-label="I miei film">
        <Brand />
      </a>
      <a className="button" href="#/impostazioni/connessioni">
        Impostazioni
      </a>
    </header>
  );
}

function Framed({ page, children }: { page?: string; children: ReactNode }) {
  return (
    <>
      <AppBar />
      <main className="app" data-page={page}>
        {children}
      </main>
    </>
  );
}

function Home() {
  // Chiudere la procedura fa ricontrollare i fornitori: se ora ce n'è uno, il benvenuto sparisce.
  const [checks, setChecks] = useState(0);

  return (
    <FirstRunGate
      key={checks}
      onFinish={() => {
        setChecks(checks + 1);
      }}
    >
      <Framed page="home">
        <FilmsHome />
      </Framed>
    </FirstRunGate>
  );
}

function FilmScreen({ route }: { route: FilmRoute }) {
  return (
    <Framed>
      {route.page === 'new' ? <IdeaWizard /> : null}
      {route.page === 'idea' ? <IdeaWizard filmId={route.id} /> : null}
      {route.page === 'film' ? <FilmPage filmId={route.id} /> : null}
      {route.page === 'spend' ? <FilmSpendPage filmId={route.id} /> : null}
    </Framed>
  );
}

export function App() {
  return (
    <StartupGate>
      <Screens />
    </StartupGate>
  );
}

function Screens() {
  const path = useHashPath();
  const filmRoute = parseFilmRoute(path);

  if (filmRoute !== undefined) return <FilmScreen route={filmRoute} />;
  if (path.startsWith('/impostazioni')) return <SettingsPage path={path} />;
  if (path === '/benvenuto') {
    return (
      <WelcomePage
        onFinish={() => {
          window.location.hash = '#/';
        }}
      />
    );
  }
  return <Home />;
}

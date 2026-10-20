import { ServerStatus } from './components/ServerStatus';

export function App() {
  return (
    <main className="app">
      <h1>Filmzy</h1>
      <p>I tuoi cortometraggi, con l'intelligenza artificiale.</p>
      <ServerStatus />
    </main>
  );
}

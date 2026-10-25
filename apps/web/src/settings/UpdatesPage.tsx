import type { UpdateCheckResult } from '@filmzy/contracts';
import { useState } from 'react';

import { fetchPreferences, savePreferences } from '../api/preferences';
import { checkForUpdates } from '../api/updates';
import { Notice, Panel, Toggle } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from './messages';

function resultText(result: UpdateCheckResult): string {
  switch (result.status) {
    case 'up_to_date':
      return "Hai già l'ultima versione.";
    case 'available':
      return `C'è una versione nuova: ${result.version}.`;
    case 'unavailable':
      return 'Il controllo funziona nel programma installato.';
  }
}

export function UpdatesPage() {
  const { state, setData } = useResource(fetchPreferences);
  const [result, setResult] = useState<UpdateCheckResult>();
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const preferences = state.data;
  const fail = (error: unknown) => {
    setProblem(describeError(error));
  };

  const changeAutomaticCheck = (checkForUpdates: boolean) => {
    setProblem(undefined);
    savePreferences({ ...preferences, checkForUpdates }).then(setData, fail);
  };

  const checkNow = () => {
    setProblem(undefined);
    setChecking(true);
    checkForUpdates()
      .then(setResult, fail)
      .finally(() => {
        setChecking(false);
      });
  };

  return (
    <Panel title="Aggiornamenti">
      <Toggle
        label="Avvisami quando c'è una versione nuova"
        hint="Il controllo contatta GitHub, che vede il tuo indirizzo IP e la versione di Filmzy. Nient'altro."
        checked={preferences.checkForUpdates}
        onChange={changeAutomaticCheck}
      />
      <div className="actions">
        <button type="button" className="button" disabled={checking} onClick={checkNow}>
          Controlla adesso
        </button>
        {result === undefined ? null : <p className="hint">{resultText(result)}</p>}
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </Panel>
  );
}

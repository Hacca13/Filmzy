import { useState } from 'react';

import { fetchPreferences, savePreferences } from '../api/preferences';
import { Notice, Panel, Toggle } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from './messages';

export function GenerationPage() {
  const { state, setData } = useResource(fetchPreferences);
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const preferences = state.data;

  const changeTakeAudio = (takeAudio: boolean) => {
    setProblem(undefined);
    savePreferences({ ...preferences, takeAudio }).then(setData, (error: unknown) => {
      setProblem(describeError(error));
    });
  };

  return (
    <Panel title="Generazione">
      <Toggle
        label="Audio nelle clip video"
        hint="La voce cambia da una clip all'altra e su alcuni servizi costa di più. Lo puoi cambiare quando generi."
        checked={preferences.takeAudio}
        onChange={changeTakeAudio}
      />
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </Panel>
  );
}

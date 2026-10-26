import { useState } from 'react';

import { fetchInstructions } from '../../api/instructions';
import { Notice } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { withRole } from './model';
import { RoleInstructionsPanel } from './RoleInstructionsPanel';

/**
 * Impostazioni › Istruzioni (T2.4, D38): per ogni ruolo, le versioni del programma e quelle
 * dell'utente, con la possibilità di scriverne o caricarne una nuova e di scegliere quale usare.
 * Una scelta vale subito, senza pubblicare niente.
 */
export function InstructionsPage() {
  const { state, setData } = useResource(fetchInstructions);
  const [selected, setSelected] = useState<string>();
  const [problem, setProblem] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const overview = state.data;
  const role =
    overview.roles.find((candidate) => candidate.roleId === selected) ?? overview.roles[0];
  if (role === undefined) return <Notice tone="info">Non ci sono istruzioni da mostrare.</Notice>;

  const reload = () => {
    setProblem(undefined);
    fetchInstructions().then(setData, (error: unknown) => {
      setProblem(describeError(error));
    });
  };

  return (
    <>
      <div className="field">
        <label htmlFor="instructions-role">Ruolo</label>
        <select
          id="instructions-role"
          value={role.roleId}
          onChange={(event) => {
            setSelected(event.target.value);
          }}
        >
          {overview.roles.map((candidate) => (
            <option key={candidate.roleId} value={candidate.roleId}>
              {candidate.label}
            </option>
          ))}
        </select>
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      <RoleInstructionsPanel
        key={role.roleId}
        role={role}
        onRole={(updated) => {
          setData(withRole(overview, updated));
        }}
        onSaved={reload}
      />
    </>
  );
}

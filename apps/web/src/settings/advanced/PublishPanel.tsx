import type { ConfigChange } from '@filmzy/contracts';
import { useEffect, useState } from 'react';

import { fetchDraftDiff } from '../../api/release-history';
import { Notice, Panel } from '../../components/ui';
import { describeError } from '../messages';
import { ChangeList } from './ChangeList';

interface Props {
  busy: boolean;
  onPublish: (note: string) => void;
  onCancel: () => void;
}

/**
 * «Pubblica la bozza» (architettura §4.5 punto 3): prima si vede **cosa cambia** rispetto alla
 * configurazione attiva, poi si scrive la nota (obbligatoria: serve a ritrovarsi nello storico).
 */
export function PublishPanel({ busy, onPublish, onCancel }: Props) {
  const [note, setNote] = useState('');
  const [changes, setChanges] = useState<ConfigChange[]>();
  const [problem, setProblem] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    fetchDraftDiff(controller.signal).then(
      (diff) => {
        if (!controller.signal.aborted) setChanges(diff.changes);
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setProblem(describeError(error));
      },
    );
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Panel title="Pubblica la bozza">
      <h3 className="subtitle">Cosa cambia</h3>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {changes === undefined ? null : (
        <ChangeList
          changes={changes}
          empty="Niente: la bozza è uguale alla configurazione attiva."
        />
      )}
      <label htmlFor="publish-note">Perché questa modifica?</label>
      <input
        id="publish-note"
        type="text"
        placeholder="Una nota per ritrovarti nello storico"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
        }}
      />
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || note.trim() === ''}
          onClick={() => {
            onPublish(note);
          }}
        >
          Pubblica adesso
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </Panel>
  );
}

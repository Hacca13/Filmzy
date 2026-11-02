import type { Screenplay } from '@filmzy/contracts';
import { useState } from 'react';

import { applyEdits, canSave, editsOf, type FinalEdits } from './model';

interface Props {
  screenplay: Screenplay;
  busy: boolean;
  onSave: (screenplay: Screenplay) => void;
  onCancel: () => void;
}

/**
 * La sceneggiatura finale come testo da correggere (T3.8): titolo, trama e, per ogni scena,
 * intestazione, momento e riassunto. Non chiama lo sceneggiatore e non costa: ogni salvataggio è
 * una versione nuova, e il server controlla che le scene citino solo cast e luoghi del film.
 */
export function FinalEditor({ screenplay, busy, onSave, onCancel }: Props) {
  const [edits, setEdits] = useState<FinalEdits>(() => editsOf(screenplay));
  const savable = canSave(screenplay, edits);

  const setScene = (index: number, patch: Partial<FinalEdits['scenes'][number]>) => {
    setEdits((current) => ({
      ...current,
      scenes: current.scenes.map((scene, at) => (at === index ? { ...scene, ...patch } : scene)),
    }));
  };

  return (
    <form
      className="final-editor"
      onSubmit={(event) => {
        event.preventDefault();
        if (savable && !busy) onSave(applyEdits(screenplay, edits));
      }}
    >
      <label htmlFor="final-title">Titolo</label>
      <input
        id="final-title"
        value={edits.title}
        onChange={(event) => {
          setEdits({ ...edits, title: event.target.value });
        }}
      />
      <label htmlFor="final-logline">Trama in una riga</label>
      <textarea
        id="final-logline"
        rows={2}
        value={edits.logline}
        onChange={(event) => {
          setEdits({ ...edits, logline: event.target.value });
        }}
      />
      {edits.scenes.map((scene, index) => {
        const number = screenplay.scenes[index]?.number ?? index + 1;
        const id = `final-scene-${String(number)}`;
        return (
          <fieldset key={number} className="scene-edit">
            <legend>Scena {number}</legend>
            <label htmlFor={`${id}-heading`}>Dove e come inizia</label>
            <input
              id={`${id}-heading`}
              value={scene.heading}
              onChange={(event) => {
                setScene(index, { heading: event.target.value });
              }}
            />
            <label htmlFor={`${id}-time`}>Momento</label>
            <input
              id={`${id}-time`}
              value={scene.timeOfDay}
              onChange={(event) => {
                setScene(index, { timeOfDay: event.target.value });
              }}
            />
            <label htmlFor={`${id}-summary`}>Cosa succede</label>
            <textarea
              id={`${id}-summary`}
              rows={3}
              value={scene.summary}
              onChange={(event) => {
                setScene(index, { summary: event.target.value });
              }}
            />
          </fieldset>
        );
      })}
      <p className="hint">
        Ogni salvataggio crea una versione nuova: quella di prima resta. Chi compare in una scena e
        dove si svolge non si cambia da qui.
      </p>
      <div className="actions">
        <button type="submit" className="button" data-kind="primary" disabled={!savable || busy}>
          {busy ? 'Salvo…' : 'Salva la correzione'}
        </button>
        <button type="button" className="button" disabled={busy} onClick={onCancel}>
          Lascia perdere
        </button>
      </div>
    </form>
  );
}

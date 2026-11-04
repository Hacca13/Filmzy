import { useRef, useState, type ChangeEvent } from 'react';

import { Notice } from '../../components/ui';
import { AUDIO_ACCEPT, UPLOAD_NOTE, audioFileProblem } from './model';

/**
 * Scegliere un file audio (D27): prima si legge che il file resta sul computer, poi si sceglie. Un file
 * che sicuramente non va non parte nemmeno; il resto lo decide il server, e l'errore lo mostra chi chiama.
 */
export function AudioFilePicker({
  label,
  disabled = false,
  onPick,
  onCancel,
}: {
  label: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  onCancel?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string>();

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Si svuota il selettore: scegliere di nuovo lo stesso file deve far ripartire il caricamento.
    event.target.value = '';
    if (file === undefined) return;
    const found = audioFileProblem(file);
    setProblem(found);
    if (found === undefined) onPick(file);
  };

  return (
    <div className="sound-upload">
      <p className="hint">{UPLOAD_NOTE}</p>
      <input ref={input} type="file" accept={AUDIO_ACCEPT} hidden onChange={pick} />
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          {label}
        </button>
        {onCancel === undefined ? null : (
          <button type="button" className="button" disabled={disabled} onClick={onCancel}>
            Annulla
          </button>
        )}
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
    </div>
  );
}

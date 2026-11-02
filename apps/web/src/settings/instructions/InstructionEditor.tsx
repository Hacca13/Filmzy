import type {
  InstructionVersionInfo,
  PreviewInstructionsResponse,
  RoleInstructions,
} from '@filmzy/contracts';
import { useState } from 'react';

import { createInstructionVersion, previewInstructions } from '../../api/instructions';
import { IssueList, Notice } from '../../components/ui';
import { describeError } from '../messages';
import { sectionTitle } from './model';

interface Props {
  role: RoleInstructions;
  initialText: string;
  /** La versione da cui si parte: da lei si copiano le varianti. Senza, si parte da un file. */
  basedOn?: number;
  onSaved: (version: InstructionVersionInfo) => void;
  onClose: () => void;
}

/**
 * Dove si scrive, si prova e si salva un testo di istruzioni. Non cambia mai una versione che
 * esiste: salva sempre una versione nuova (architettura §4.4). Il controllo lo fa il server con
 * lo stesso rendering che userà la troupe, quindi quello che passa qui gira davvero.
 */
export function InstructionEditor({ role, initialText, basedOn, onSaved, onClose }: Props) {
  const [text, setText] = useState(initialText);
  const [based, setBased] = useState(basedOn);
  const [preview, setPreview] = useState<PreviewInstructionsResponse>();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  const run = (action: () => Promise<void>) => {
    setBusy(true);
    setProblem(undefined);
    action()
      .catch((error: unknown) => {
        setProblem(describeError(error));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const check = (candidate: string) => {
    run(async () => {
      setPreview(await previewInstructions(role.roleId, candidate));
    });
  };

  const save = () => {
    run(async () => {
      const result = await createInstructionVersion(role.roleId, text, based);
      if (result.version === undefined) {
        setPreview({ issues: result.issues });
        return;
      }
      onSaved(result.version);
    });
  };

  const loadFile = (file: File) => {
    run(async () => {
      const loaded = await file.text();
      // Un file caricato è una partenza nuova: non porta con sé le varianti di nessuna versione.
      setText(loaded);
      setBased(undefined);
      setPreview(await previewInstructions(role.roleId, loaded));
    });
  };

  return (
    <div className="row-form">
      <p className="hint">
        Parole che puoi usare nel testo:{' '}
        {role.availableVariables.map((name) => `{{ ${name} }}`).join('  ')}
      </p>
      <textarea
        className="editor"
        aria-label="Testo delle istruzioni"
        rows={18}
        spellCheck={false}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setPreview(undefined);
        }}
      />
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={busy}
          onClick={() => {
            check(text);
          }}
        >
          Prova con l’esempio fisso
        </button>
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || text.trim() === ''}
          onClick={save}
        >
          Salva come versione nuova
        </button>
        <label className="button file-button">
          Carica un file
          <input
            type="file"
            accept=".md,.txt,text/plain,text/markdown"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Si svuota il campo: scegliere di nuovo lo stesso file deve rileggerlo.
              event.target.value = '';
              if (file !== undefined) loadFile(file);
            }}
          />
        </label>
        <button type="button" className="button" onClick={onClose}>
          Chiudi
        </button>
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {preview === undefined ? null : (
        <>
          <IssueList issues={preview.issues} />
          {preview.rendered === undefined ? null : (
            <div className="preview">
              <p className="hint">Come diventa con l’esempio fisso:</p>
              {Object.entries(preview.rendered).map(([name, rendered]) => (
                <div key={name}>
                  <h3>{sectionTitle(name)}</h3>
                  <pre>{rendered}</pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

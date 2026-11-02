import type { InstructionVersionInfo, RoleInstructions } from '@filmzy/contracts';
import { useState } from 'react';

import { chooseInstructionVersion, fetchInstructionText } from '../../api/instructions';
import { Notice, Panel } from '../../components/ui';
import { downloadText } from '../../lib/download';
import { describeError } from '../messages';
import { InstructionEditor } from './InstructionEditor';
import {
  MODERATOR_WARNING,
  badgesOf,
  needsModeratorWarning,
  newerVersionNotice,
  templateFileName,
} from './model';

interface Props {
  role: RoleInstructions;
  /** Dopo una scelta il server restituisce il ruolo aggiornato. */
  onRole: (role: RoleInstructions) => void;
  /** Dopo aver salvato una versione nuova si rilegge tutto. */
  onSaved: () => void;
}

interface OpenEditor {
  /** Cambia a ogni apertura: un editor nuovo riparte da zero, non si porta dietro il vecchio testo. */
  key: number;
  text: string;
  basedOn?: number;
}

export function RoleInstructionsPanel({ role, onRole, onSaved }: Props) {
  const [editor, setEditor] = useState<OpenEditor>();
  const [openings, setOpenings] = useState(0);
  const [stayOnOld, setStayOnOld] = useState(false);
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

  const openEditor = (next: Omit<OpenEditor, 'key'>) => {
    setOpenings(openings + 1);
    setEditor({ ...next, key: openings + 1 });
  };

  const choose = (version: number | null) => {
    run(async () => {
      onRole(await chooseInstructionVersion(role.roleId, version));
    });
  };

  const open = (version: InstructionVersionInfo) => {
    run(async () => {
      const loaded = await fetchInstructionText(role.roleId, version.version);
      openEditor({ text: loaded.text, basedOn: version.version });
    });
  };

  /** Un modello da riempire: il testo della versione consigliata, con le sue parole al posto. */
  const downloadTemplate = () => {
    run(async () => {
      const loaded = await fetchInstructionText(role.roleId, role.recommended);
      downloadText(templateFileName(role.roleId), loaded.text);
    });
  };

  const newer = stayOnOld ? undefined : newerVersionNotice(role);

  return (
    <Panel title={role.label}>
      {newer === undefined ? null : (
        <Notice tone="info">
          C’è una versione più nuova: {newer.label}.
          {newer.changelog.length === 0 ? null : (
            <ul>
              {newer.changelog.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <span className="actions">
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                choose(newer.version);
              }}
            >
              Provala
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                setStayOnOld(true);
              }}
            >
              Resta con la vecchia
            </button>
          </span>
        </Notice>
      )}
      {needsModeratorWarning(role, editor !== undefined) ? (
        <Notice tone="error">{MODERATOR_WARNING}</Notice>
      ) : null}
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}

      {role.versions.map((version) => (
        <div key={version.version} className="row">
          <div className="row-head">
            <p>
              <strong>{version.label}</strong>
              {badgesOf(role, version).map((badge) => (
                <span key={badge.text} className="badge" data-tone={badge.tone}>
                  {badge.text}
                </span>
              ))}
            </p>
            <span className="actions">
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() => {
                  open(version);
                }}
              >
                Vedi e prova
              </button>
              {version.version === role.inUse ? null : (
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    choose(version.version);
                  }}
                >
                  Usa questa
                </button>
              )}
            </span>
          </div>
          {version.description === '' ? null : <p className="hint">{version.description}</p>}
          {version.variants.length === 0 ? null : (
            <p className="hint">Varianti per: {version.variants.join(', ')}</p>
          )}
        </div>
      ))}

      <div className="actions">
        {role.chosen === undefined ? null : (
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              choose(null);
            }}
          >
            Torna ai valori predefiniti
          </button>
        )}
        <button type="button" className="button" disabled={busy} onClick={downloadTemplate}>
          Scarica un modello
        </button>
        <button
          type="button"
          className="button"
          disabled={busy}
          onClick={() => {
            openEditor({ text: '' });
          }}
        >
          Carica le tue istruzioni
        </button>
      </div>

      {editor === undefined ? null : (
        <InstructionEditor
          key={editor.key}
          role={role}
          initialText={editor.text}
          {...(editor.basedOn === undefined ? {} : { basedOn: editor.basedOn })}
          onSaved={() => {
            setEditor(undefined);
            onSaved();
          }}
          onClose={() => {
            setEditor(undefined);
          }}
        />
      )}
    </Panel>
  );
}

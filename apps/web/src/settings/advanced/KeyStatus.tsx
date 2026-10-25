import type { SecretsView } from '@filmzy/contracts';
import { useState } from 'react';

import { removeSecret, saveSecret } from '../../api/secrets';
import { isPlainObject } from '../../forms/json-schema';
import { describeError } from '../messages';

/**
 * Lo stato della chiave di una connessione (D25): «presente» o «mancante», mai il valore. Una
 * chiave nel portachiavi (`secret:NOME`) si scrive e si toglie da qui, in sola scrittura; una
 * variabile d'ambiente (`env:NOME`) si imposta fuori dal programma, e qui si vede solo se c'è.
 */
const REFERENCE = /^(env|secret):([A-Z][A-Z0-9_]*)\??$/;

interface Props {
  connection: unknown;
  secrets: SecretsView;
  onChanged: (view: SecretsView) => void;
}

export function KeyStatus({ connection, secrets, onChanged }: Props) {
  const [value, setValue] = useState('');
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);

  const reference = isPlainObject(connection) ? connection.api_key : undefined;
  const match = typeof reference === 'string' ? REFERENCE.exec(reference) : null;
  if (match === null) return null;

  const [, source, name] = match;
  const status = secrets.secrets.find((secret) => secret.name === name && secret.source === source);
  if (name === undefined) return null;

  const change = (action: () => Promise<SecretsView>) => {
    setBusy(true);
    setProblem(undefined);
    action()
      .then((view) => {
        onChanged(view);
        setValue('');
      })
      .catch((error: unknown) => {
        setProblem(describeError(error));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  if (source === 'env') {
    return (
      <p className="hint">
        Chiave {name} (variabile d’ambiente): {status?.present === true ? 'presente' : 'mancante'}
      </p>
    );
  }

  return (
    <div className="key-status">
      <p className="hint">
        Chiave {name}:{' '}
        {status === undefined
          ? 'salva la bozza per vederla'
          : status.present
            ? 'presente'
            : 'mancante'}
      </p>
      {secrets.writable ? (
        <div className="actions">
          <input
            type="password"
            autoComplete="off"
            aria-label={`Chiave ${name}`}
            placeholder="Incolla la chiave"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
          <button
            type="button"
            className="button"
            disabled={busy || value.trim() === ''}
            onClick={() => {
              change(() => saveSecret(name, value));
            }}
          >
            Salva la chiave
          </button>
          {status?.present === true ? (
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                change(() => removeSecret(name));
              }}
            >
              Togli la chiave
            </button>
          ) : null}
        </div>
      ) : (
        <p className="hint">Le chiavi si salvano solo nel programma installato.</p>
      )}
      {problem === undefined ? null : (
        <p className="field-error" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}

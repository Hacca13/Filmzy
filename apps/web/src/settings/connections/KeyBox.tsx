import type { ProviderState } from '@filmzy/contracts';
import { useState } from 'react';

import { removeSecret, saveSecret } from '../../api/secrets';
import { testConnection } from '../../api/connections';
import { Notice } from '../../components/ui';
import { useAction } from '../use-action';
import { describeTestError, keyOriginText } from './labels';

interface Props {
  provider: ProviderState;
  /** Dopo aver scritto o tolto una chiave la pagina rilegge il quadro. */
  onChanged: () => Promise<void>;
  /** Dopo una prova riuscita (la procedura guidata aspetta questo per proseguire). */
  onTested?: () => void;
}

/**
 * La chiave di un fornitore (D25): «presente» o «mancante», mai il valore. Si scrive e si
 * sostituisce, ma dopo l'inserimento non si rivede più. Senza il portachiavi del sistema (prima
 * dell'app installata, D45) non si può scrivere: si dice dove metterla e si può comunque provare
 * la connessione con quella che c'è.
 */
export function KeyBox({ provider, onChanged, onTested }: Props) {
  const [value, setValue] = useState('');
  const [tested, setTested] = useState(false);
  const saving = useAction();
  const testing = useAction();

  if (!provider.keyRequired || provider.key === undefined) {
    return <p className="hint">Non serve una chiave.</p>;
  }
  const { name, present } = provider.key;
  const stored = provider.key.foundIn === 'stored';

  const save = () => {
    setTested(false);
    saving.run(async () => {
      await saveSecret(name, value);
      setValue('');
      await onChanged();
    });
  };

  const remove = () => {
    setTested(false);
    saving.run(async () => {
      await removeSecret(name);
      await onChanged();
    });
  };

  const test = () => {
    testing.run(async () => {
      await testConnection(provider.connectionId);
      setTested(true);
      onTested?.();
    }, describeTestError);
  };

  return (
    <div className="key-status">
      <p className="hint">{keyOriginText(provider)}</p>
      {provider.keyWritable ? (
        <div className="actions">
          <input
            type="password"
            autoComplete="off"
            aria-label={`Chiave di ${provider.label}`}
            placeholder={present ? 'Incolla una chiave nuova' : 'Incolla la chiave'}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
          <button
            type="button"
            className="button"
            disabled={saving.busy || value.trim() === ''}
            onClick={save}
          >
            {present ? 'Sostituisci' : 'Salva la chiave'}
          </button>
          {stored ? (
            <button type="button" className="button" disabled={saving.busy} onClick={remove}>
              Rimuovi
            </button>
          ) : null}
        </div>
      ) : (
        <p className="hint">
          Le chiavi si salvano solo nel programma installato. Per ora scrivi {name} nel file .env.
        </p>
      )}
      {provider.canTest ? (
        <div className="actions">
          <button
            type="button"
            className="button"
            disabled={testing.busy || !present}
            onClick={test}
          >
            {testing.busy ? 'Sto provando…' : 'Prova la connessione'}
          </button>
          {tested ? <span className="hint">✓ La connessione funziona</span> : null}
        </div>
      ) : null}
      {saving.problem === undefined ? null : <Notice tone="error">{saving.problem}</Notice>}
      {testing.problem === undefined ? null : <Notice tone="error">⚠ {testing.problem}</Notice>}
    </div>
  );
}

import type { ModelOption, SheetOptions, StartSheetBody } from '@filmzy/contracts';
import { useState } from 'react';

import { ChangeService } from '../components/ChangeService';
import { generateLabel, selectedOption } from '../components/change-service';
import { Notice } from '../components/ui';
import { useResource } from '../lib/use-resource';
import { describeError } from '../settings/messages';
import { SpendConfirm } from '../settings/spend/SpendConfirm';
import { useGuardedRun } from '../settings/spend/use-guarded-run';

/**
 * La parte che ogni «Genera» ha in comune (immagini dei luoghi, storyboard, video): l'elenco dei
 * servizi con la stima, la scelta del servizio (D36), il limite di spesa che chiede conferma (D30) e
 * i messaggi di errore in parole semplici. Chi genera ci mette solo cosa chiedere e cosa fare del
 * risultato; la logica sta nel server (regola 8).
 */

interface Args<T> {
  /** `loadOptions` deve essere stabile (`useCallback`): rilegge i servizi quando cambia. */
  loadOptions: (signal: AbortSignal) => Promise<SheetOptions>;
  start: (body: StartSheetBody) => Promise<T>;
  /** Cosa fare quando il server ha messo in coda il lavoro. */
  onStarted: (result: T) => void;
}

export function useGeneration<T>({ loadOptions, start, onStarted }: Args<T>) {
  const options = useResource(loadOptions);
  const [modelId, setModelId] = useState<string>();
  const created = useGuardedRun<T>(onStarted);

  const choices: readonly ModelOption[] | undefined =
    options.state.status === 'ready' ? options.state.data.options : undefined;
  const chosen = choices === undefined ? undefined : selectedOption(choices, modelId);

  return {
    options,
    choices,
    chosen,
    created,
    setModelId,
    /** Sta lavorando la richiesta, o il suo limite di spesa: mentre dura non si chiede altro. */
    busy: created.running || created.raising,
    run: () => {
      created.run((spendConfirmed) =>
        start({ ...(modelId === undefined ? {} : { modelId }), spendConfirmed }),
      );
    },
  };
}

export type Generation<T> = ReturnType<typeof useGeneration<T>>;

/**
 * Il pulsante «Crea…» con la stima, «Cambia servizio» accanto, e sotto gli avvisi (errori, limite di
 * spesa). `disabled` spegne il pulsante mentre qualcos'altro lavora (un tentativo già in corso, un
 * salvataggio); `otherBusy` blocca anche la conferma del limite.
 */
export function GenerateBar<T>({
  generation,
  createVerb,
  disabled,
  otherBusy = false,
  children,
}: {
  generation: Generation<T>;
  createVerb: string;
  disabled: boolean;
  otherBusy?: boolean;
  /** Altri avvisi da mostrare insieme (per esempio un errore di lettura). */
  children?: React.ReactNode;
}) {
  const { options, choices, chosen, created, setModelId } = generation;
  const busy = generation.busy || otherBusy;

  return (
    <>
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || disabled || chosen === undefined}
          onClick={generation.run}
        >
          {created.running
            ? 'Sto preparando…'
            : generateLabel(chosen).replace('Genera', createVerb)}
        </button>
        <ChangeService
          options={choices}
          selectedId={chosen?.modelId}
          loading={options.state.status === 'loading'}
          onSelect={setModelId}
        />
      </div>

      {options.state.status === 'error' ? (
        <Notice tone="error">{describeError(options.state.error)}</Notice>
      ) : null}
      {children}
      {created.problem === undefined ? null : <Notice tone="error">{created.problem}</Notice>}
      {created.breach === undefined ? null : (
        <SpendConfirm
          breach={created.breach}
          busy={busy}
          onProceed={created.proceed}
          onRaise={created.raiseAndRetry}
          onCancel={created.cancel}
        />
      )}
    </>
  );
}

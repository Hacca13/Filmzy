import type { SpendBreach } from '@filmzy/contracts';
import { useState } from 'react';

import { ApiError } from '../../api/client';
import { describeError } from '../messages';
import { raiseLimit } from './SpendConfirm';
import { breachOf } from './model';

/** Un lavoro che costa: riceve «l'utente ha già confermato il limite di spesa» e dà il risultato. */
type Task<T> = (spendConfirmed: boolean) => Promise<T>;

interface Pending<T> {
  breach: SpendBreach;
  connectionId?: string;
  task: Task<T>;
}

/**
 * Lancia un lavoro che costa (scrivere una bozza, una modifica…) e gestisce il limite di spesa
 * (D30): se lo supera non parte e si chiede cosa fare (`breach`); «Continua» lo rilancia confermato,
 * «Cambia il tetto» alza il limite e riprova, «Annulla» lascia perdere. Ogni altro errore diventa
 * una frase semplice in `problem`. Lo usano tutti i pulsanti che generano con un servizio a pagamento.
 */
export function useGuardedRun<T>(onResult: (result: T) => void) {
  const [running, setRunning] = useState(false);
  const [raising, setRaising] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [pending, setPending] = useState<Pending<T>>();

  const execute = (task: Task<T>, spendConfirmed: boolean) => {
    setRunning(true);
    setProblem(undefined);
    setPending(undefined);
    task(spendConfirmed)
      .then(onResult, (error: unknown) => {
        const breach = breachOf(error);
        if (breach === undefined) {
          setProblem(describeError(error));
          return;
        }
        const connectionId = error instanceof ApiError ? error.details?.connectionId : undefined;
        setPending({ breach, ...(connectionId === undefined ? {} : { connectionId }), task });
      })
      .finally(() => {
        setRunning(false);
      });
  };

  return {
    running,
    raising,
    problem,
    breach: pending?.breach,
    run: (task: Task<T>) => {
      execute(task, false);
    },
    proceed: () => {
      if (pending !== undefined) execute(pending.task, true);
    },
    raiseAndRetry: () => {
      if (pending === undefined) return;
      const { breach, connectionId, task } = pending;
      setRaising(true);
      raiseLimit(breach, connectionId)
        .then(
          () => {
            execute(task, false);
          },
          (error: unknown) => {
            setProblem(describeError(error));
          },
        )
        .finally(() => {
          setRaising(false);
        });
    },
    cancel: () => {
      setPending(undefined);
    },
  };
}

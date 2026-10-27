import { useState } from 'react';

import { describeError } from './messages';

/**
 * Lo stato di un'azione che chiama il server: «sta lavorando» e «cosa è andato storto», con il
 * messaggio già in parole semplici. Evita di riscrivere lo stesso giro in ogni pulsante: si lancia
 * con `run`, e se fallisce l'errore finisce in `problem`, mai in un'eccezione grezza.
 */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  const run = (
    action: () => Promise<void>,
    describe: (error: unknown) => string = describeError,
  ) => {
    setBusy(true);
    setProblem(undefined);
    action()
      .catch((error: unknown) => {
        setProblem(describe(error));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return {
    busy,
    problem,
    run,
    clearProblem: () => {
      setProblem(undefined);
    },
  };
}

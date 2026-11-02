import type { useGuardedRun } from '../settings/spend/use-guarded-run';
import { Notice } from '../components/ui';
import { SpendConfirm } from '../settings/spend/SpendConfirm';

/** Una scrittura che costa, come la gestisce `useGuardedRun`. */
export type Written<T> = ReturnType<typeof useGuardedRun<T>>;

/**
 * Il limite di spesa e l'errore di una scrittura (D30), uguali per la bozza, le modifiche e la
 * sceneggiatura finale: se supera un limite si chiede cosa fare, altrimenti si dice cosa non va.
 */
export function WriteOutcome<T>({ written }: { written: Written<T> }) {
  return (
    <>
      {written.problem === undefined ? null : <Notice tone="error">{written.problem}</Notice>}
      {written.breach === undefined ? null : (
        <SpendConfirm
          breach={written.breach}
          busy={written.running || written.raising}
          onProceed={written.proceed}
          onRaise={written.raiseAndRetry}
          onCancel={written.cancel}
        />
      )}
    </>
  );
}

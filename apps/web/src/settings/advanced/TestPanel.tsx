import type { DraftTestEstimate, DraftTestResult, SpendBreach } from '@filmzy/contracts';
import { useEffect, useState } from 'react';

import { ApiError } from '../../api/client';
import { estimateTest, fetchTestableRoles, runTest } from '../../api/draft-test';
import { Notice, Panel } from '../../components/ui';
import { formatUsd, formatValue } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { raiseLimit, SpendConfirm } from '../spend/SpendConfirm';
import { breachOf } from '../spend/model';

interface Props {
  /** Falso quando la bozza ha modifiche non salvate: il server prova quella salvata. */
  saved: boolean;
  /** Cambia a ogni salvataggio: la stima si rifà, perché la bozza è un'altra. */
  draftVersion: number;
}

/**
 * La prova (architettura §4.5 punto 2): un ruolo eseguito sulla **bozza** con il suo esempio fisso,
 * prima di pubblicare. Con un fornitore vero costa: si vede la stima prima, parte solo quando si
 * preme il pulsante, e dopo si vede il costo vero.
 */
export function TestPanel({ saved, draftVersion }: Props) {
  const roles = useResource(fetchTestableRoles);
  const [selected, setSelected] = useState<string>();

  if (roles.state.status === 'loading') return null;
  if (roles.state.status === 'error') {
    return (
      <Panel title="Prova">
        <Notice tone="error">{describeError(roles.state.error)}</Notice>
      </Panel>
    );
  }

  const options = roles.state.data.roles;
  const roleId = options.find((role) => role.roleId === selected)?.roleId ?? options[0]?.roleId;
  if (roleId === undefined) return null;

  return (
    <Panel title="Prova">
      <div className="field">
        <label htmlFor="test-role">Ruolo da provare</label>
        <select
          id="test-role"
          value={roleId}
          onChange={(event) => {
            setSelected(event.target.value);
          }}
        >
          {options.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
      <RoleTest key={roleId} roleId={roleId} saved={saved} draftVersion={draftVersion} />
    </Panel>
  );
}

function RoleTest({ roleId, saved, draftVersion }: Props & { roleId: string }) {
  const [estimate, setEstimate] = useState<DraftTestEstimate>();
  const [estimateProblem, setEstimateProblem] = useState<string>();
  const [result, setResult] = useState<DraftTestResult>();
  const [running, setRunning] = useState(false);
  const [problem, setProblem] = useState<string>();
  // Una prova che supera un limite di spesa non parte: si chiede cosa fare (D30).
  const [breach, setBreach] = useState<{ breach: SpendBreach; connectionId?: string }>();
  const [raising, setRaising] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setEstimate(undefined);
    setEstimateProblem(undefined);
    estimateTest(roleId, controller.signal).then(
      (next) => {
        if (!controller.signal.aborted) setEstimate(next);
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setEstimateProblem(describeError(error));
      },
    );
    return () => {
      controller.abort();
    };
  }, [roleId, draftVersion]);

  const run = (spendConfirmed = false) => {
    setRunning(true);
    setProblem(undefined);
    setResult(undefined);
    setBreach(undefined);
    runTest(roleId, { spendConfirmed })
      .then(setResult, (error: unknown) => {
        const found = breachOf(error);
        if (found === undefined) {
          setProblem(describeError(error));
          return;
        }
        const connectionId = error instanceof ApiError ? error.details?.connectionId : undefined;
        setBreach({ breach: found, ...(connectionId === undefined ? {} : { connectionId }) });
      })
      .finally(() => {
        setRunning(false);
      });
  };

  /** «Cambia il tetto»: alza il limite abbastanza perché la prova rientri, e riprova. */
  const raiseAndRetry = (pending: { breach: SpendBreach; connectionId?: string }) => {
    setRaising(true);
    raiseLimit(pending.breach, pending.connectionId)
      .then(
        () => {
          run();
        },
        (error: unknown) => {
          setProblem(describeError(error));
        },
      )
      .finally(() => {
        setRaising(false);
      });
  };

  return (
    <>
      {saved ? null : (
        <Notice tone="info">Salva la bozza prima di provarla: la prova usa quella salvata.</Notice>
      )}
      {estimateProblem === undefined ? null : <Notice tone="error">{estimateProblem}</Notice>}
      {estimate === undefined ? null : (
        <p className="hint">
          La prova esegue l’esempio fisso di questo ruolo con «{estimate.estimate.modelLabel}» ·
          circa {formatUsd(estimate.estimate.estimatedCostUsd)}
        </p>
      )}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={running || !saved || estimate === undefined}
          onClick={() => {
            run();
          }}
        >
          {running ? 'Sto provando…' : 'Prova con un esempio fisso'}
        </button>
      </div>
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {breach === undefined ? null : (
        <SpendConfirm
          breach={breach.breach}
          busy={running || raising}
          onProceed={() => {
            run(true);
          }}
          onRaise={() => {
            raiseAndRetry(breach);
          }}
          onCancel={() => {
            setBreach(undefined);
          }}
        />
      )}
      {result === undefined ? null : <TestResult result={result} />}
    </>
  );
}

export function TestResult({ result }: { result: DraftTestResult }) {
  const { receipt } = result;
  return (
    <div className="preview">
      <h3>Esempio fisso</h3>
      <pre>{formatValue(result.example)}</pre>
      <h3>Risultato</h3>
      <pre>{formatValue(result.output)}</pre>
      <p className="hint">
        Servizio: {receipt.modelLabel} · costo {formatUsd(receipt.actualCostUsd ?? 0)} (stimato{' '}
        {formatUsd(receipt.estimatedCostUsd)})
        {receipt.durationMs === undefined
          ? ''
          : ` · ${(receipt.durationMs / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} secondi`}
      </p>
    </div>
  );
}

import type { ScriptCheckIssue, ScriptCheckView } from '@filmzy/contracts';
import { useCallback } from 'react';

import { estimateScriptCheck, fetchScriptCheck, runScriptCheck } from '../../api/script-check';
import { setFlagIgnored } from '../../api/shots';
import { Chip, Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useLastReady } from '../../lib/use-last-ready';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { WriteOutcome } from '../WriteOutcome';
import { FlagNote } from './FlagNote';

/** Dove è il problema, a parole: «Scena 2 · Inquadratura 1». Vuoto se riguarda il film intero. */
export function issuePlace(issue: ScriptCheckIssue): string {
  return [
    issue.sceneNumber === undefined ? undefined : `Scena ${String(issue.sceneNumber)}`,
    issue.shotNumber === undefined ? undefined : `Inquadratura ${String(issue.shotNumber)}`,
  ]
    .filter((part) => part !== undefined)
    .join(' · ');
}

/** Il riassunto del controllo in una riga: sempre a parole, mai solo colore. */
export function checkSummary(check: ScriptCheckView): {
  tone: 'confirmed' | 'warning' | 'info';
  text: string;
} {
  if (check.state === 'outdated') return { tone: 'info', text: 'Da rifare: la storia è cambiata' };
  if (check.issues.length === 0) return { tone: 'confirmed', text: 'Tutto torna' };
  const open = check.issues.filter((issue) => !issue.ignored);
  if (open.length === 0) return { tone: 'info', text: 'Segnalazioni ignorate' };
  const count = open.length;
  return {
    tone: open.every((issue) => issue.light) ? 'info' : 'warning',
    text: count === 1 ? 'Una cosa da guardare' : `${String(count)} cose da guardare`,
  };
}

interface Props {
  filmId: string;
  /** Cambia quando cambiano le scene pensate: la stima si rilegge. */
  stamp: string;
  /** Il controllo è cambiato: le scene e le card hanno nuovi gialli da leggere. */
  onChecked: () => void;
}

/**
 * «Controlla la storia» (T5.2, §8): la segretaria di edizione legge la stesura e le inquadrature e
 * dice dove la trama non torna. Non cambia niente da sola: le segnalazioni compaiono qui e, quando
 * si sa dove, sulla scena o sull'inquadratura. Costa una chiamata: la stima si vede prima e un
 * limite di spesa si chiede come ovunque (D30).
 */
export function ScriptCheckSection({ filmId, stamp, onChecked }: Props) {
  // Quando cambiano le scene pensate (`stamp`) il controllo potrebbe essere diventato vecchio e la
  // stima è un'altra: si rileggono.
  const loadCheck = useCallback(
    (signal: AbortSignal) => fetchScriptCheck(filmId, signal),
    [filmId, stamp],
  );
  const check = useResource(loadCheck);
  const loadEstimate = useCallback(
    (signal: AbortSignal) => estimateScriptCheck(filmId, signal),
    [filmId, stamp],
  );
  const estimate = useResource(loadEstimate);
  const action = useAction();
  const written = useGuardedRun<ScriptCheckView>((result) => {
    check.setData(result);
    onChecked();
  });

  const estimateUsd =
    estimate.state.status === 'ready' ? estimate.state.data.estimate.estimatedCostUsd : undefined;
  // Mentre si rilegge resta il controllo di prima: l'elenco non lampeggia.
  const view = useLastReady(check.state);
  const label =
    view === undefined || view.state === 'none' ? 'Controlla la storia' : 'Controlla di nuovo';
  const summary = view === undefined || view.state === 'none' ? undefined : checkSummary(view);

  return (
    <section className="script-check" aria-labelledby="script-check-title">
      <div className="scene-head">
        <h3 id="script-check-title">Controlla la storia</h3>
        {summary === undefined ? null : <Chip tone={summary.tone}>{summary.text}</Chip>}
      </div>
      <p className="hint">
        La segretaria di edizione legge la storia e le inquadrature e dice dove qualcosa non torna.
        Non cambia niente da sola: decidi tu se rifare.
      </p>
      {check.state.status === 'error' ? (
        <Notice tone="error">{describeError(check.state.error)}</Notice>
      ) : null}
      {view?.state === 'outdated' ? (
        <Notice tone="info" title="Informazione">
          Dopo l&apos;ultimo controllo la storia o le inquadrature sono cambiate. Queste
          segnalazioni potrebbero non valere più: rifai il controllo.
        </Notice>
      ) : null}
      {view === undefined || view.issues.length === 0 ? null : (
        <ul className="script-issues">
          {view.issues.map((issue) => (
            <li key={issue.id}>
              {issuePlace(issue) === '' ? null : <p className="shot-number">{issuePlace(issue)}</p>}
              <FlagNote
                flag={issue}
                // Una nuova lettura sostituisce le segnalazioni: mentre lavora, e su un controllo vecchio, non si sceglie.
                busy={action.busy || written.running}
                onIgnored={
                  view.state === 'current'
                    ? (ignored) => {
                        action.run(async () => {
                          await setFlagIgnored(filmId, { key: issue.key, ignored });
                          check.reload();
                          onChecked();
                        });
                      }
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind={view?.state === 'none' ? 'primary' : undefined}
          disabled={written.running}
          onClick={() => {
            written.run((spendConfirmed) => runScriptCheck(filmId, { spendConfirmed }));
          }}
        >
          {written.running
            ? 'Sto controllando…'
            : estimateUsd === undefined
              ? label
              : `${label} · circa ${formatEstimate(estimateUsd)}`}
        </button>
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      <WriteOutcome written={written} />
    </section>
  );
}

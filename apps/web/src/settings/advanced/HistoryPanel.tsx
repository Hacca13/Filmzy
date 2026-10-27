import type { ConfigChange, ConfigIssue, ReleaseList } from '@filmzy/contracts';
import { useEffect, useState } from 'react';

import { fetchReleaseDiff, fetchReleases, restoreRelease } from '../../api/release-history';
import { IssueList, Notice, Panel } from '../../components/ui';
import { formatDateTime } from '../../lib/format';
import { describeError } from '../messages';
import { ChangeList } from './ChangeList';

type ReleaseItem = ReleaseList['releases'][number];

/** Quante versioni si vedono prima di «Vedi tutte». */
const VISIBLE = 5;

function titleOf(release: ReleaseItem): string {
  return release.number === undefined ? 'Versione' : `Versione ${String(release.number)}`;
}

interface Props {
  /** Cambia a ogni pubblicazione o ripristino: l'elenco si rilegge. */
  refreshKey: number;
  /** Dopo un ripristino la pagina rilegge la bozza e la configurazione attiva. */
  onRestored: () => void;
}

/**
 * Lo storico (architettura §4.5 punto 4): le versioni pubblicate, dalla più recente. Ripristinarne
 * una la pubblica di nuovo come versione nuova: lo storico resta lineare e non si perde niente.
 */
export function HistoryPanel({ refreshKey, onRestored }: Props) {
  const [releases, setReleases] = useState<ReleaseItem[]>();
  const [problem, setProblem] = useState<string>();
  const [showAll, setShowAll] = useState(false);
  const [restoring, setRestoring] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    fetchReleases(controller.signal).then(
      (list) => {
        if (!controller.signal.aborted) setReleases(list.releases);
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setProblem(describeError(error));
      },
    );
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  if (problem !== undefined) {
    return (
      <Panel title="Storico">
        <Notice tone="error">{problem}</Notice>
      </Panel>
    );
  }
  if (releases === undefined) return null;

  const shown = showAll ? releases : releases.slice(0, VISIBLE);
  const nextNumber = Math.max(0, ...releases.map((release) => release.number ?? 0)) + 1;

  return (
    <Panel title="Storico">
      {shown.map((release) => (
        <div key={release.id} className="row">
          <div className="row-head">
            <p>
              <strong>{titleOf(release)}</strong> · {formatDateTime(release.createdAt)}
              {release.note === undefined ? '' : ` · ${release.note}`}
              {release.isActive ? (
                <span className="badge" data-tone="accent">
                  Attiva
                </span>
              ) : null}
            </p>
            {release.isActive ? null : (
              <button
                type="button"
                className="button"
                aria-expanded={restoring === release.id}
                onClick={() => {
                  setRestoring(restoring === release.id ? undefined : release.id);
                }}
              >
                Ripristina
              </button>
            )}
          </div>
          {restoring === release.id ? (
            <RestoreBox
              release={release}
              nextNumber={nextNumber}
              onDone={() => {
                setRestoring(undefined);
                onRestored();
              }}
              onCancel={() => {
                setRestoring(undefined);
              }}
            />
          ) : null}
        </div>
      ))}
      {releases.length > VISIBLE ? (
        <button
          type="button"
          className="button"
          onClick={() => {
            setShowAll(!showAll);
          }}
        >
          {showAll ? 'Mostra solo le ultime' : `Vedi tutte le ${String(releases.length)} versioni`}
        </button>
      ) : null}
    </Panel>
  );
}

function RestoreBox({
  release,
  nextNumber,
  onDone,
  onCancel,
}: {
  release: ReleaseItem;
  nextNumber: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [changes, setChanges] = useState<ConfigChange[]>();
  const [note, setNote] = useState(`Ripristino della ${titleOf(release).toLowerCase()}`);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [refused, setRefused] = useState<ConfigIssue[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchReleaseDiff(release.id, controller.signal).then(
      (diff) => {
        if (!controller.signal.aborted) setChanges(diff.changes);
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setProblem(describeError(error));
      },
    );
    return () => {
      controller.abort();
    };
  }, [release.id]);

  const restore = () => {
    setBusy(true);
    setProblem(undefined);
    setRefused([]);
    restoreRelease(release.id, note)
      .then((result) => {
        if (result.release === undefined) {
          setRefused(result.issues.filter((issue) => issue.severity === 'error'));
          return;
        }
        onDone();
      })
      .catch((error: unknown) => {
        setProblem(describeError(error));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <div className="row-form">
      <h3 className="subtitle">Cosa tornerebbe com’era</h3>
      {changes === undefined ? null : (
        <ChangeList changes={changes} empty="Niente: è uguale alla configurazione attiva." />
      )}
      <label htmlFor={`restore-note-${release.id}`}>Nota della nuova versione</label>
      <input
        id={`restore-note-${release.id}`}
        type="text"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
        }}
      />
      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      {refused.length === 0 ? null : (
        <>
          <Notice tone="error">
            Non ho ripristinato niente: oggi questa versione non passerebbe i controlli. Resta
            attiva quella di prima.
          </Notice>
          <IssueList issues={refused} />
        </>
      )}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || note.trim() === ''}
          onClick={restore}
        >
          Ripristina come versione {String(nextNumber)}
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Annulla
        </button>
      </div>
    </div>
  );
}

import type { ScreenplayVersion, ScreenplayVersionSummary } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import {
  estimateScreenplay,
  fetchScreenplayVersion,
  fetchScreenplayVersions,
  reviseScreenplay,
  writeScreenplayDraft,
} from '../../api/screenplay';
import { Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { SpendConfirm } from '../../settings/spend/SpendConfirm';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { ReviseBox } from './ReviseBox';
import { ScreenplayView, VersionPicker } from './ScreenplayView';

/**
 * «La storia» (T3.4): la bozza della sceneggiatura scritta dallo sceneggiatore, le richieste di
 * modifica e le versioni. Ogni scrittura costa: la stima si vede prima, e se supera un limite di
 * spesa si chiede cosa fare (D30).
 */
export function StoryPanel({ filmId }: { filmId: string }) {
  const loadVersions = useCallback(
    (signal: AbortSignal) => fetchScreenplayVersions(filmId, signal),
    [filmId],
  );
  const versions = useResource(loadVersions);
  // La versione che si sta rileggendo; senza scelta, l'ultima.
  const [chosenId, setChosenId] = useState<string>();

  const written = useGuardedRun<ScreenplayVersion>(() => {
    setChosenId(undefined);
    versions.reload();
  });

  if (versions.state.status === 'error') {
    return <Notice tone="error">{describeError(versions.state.error)}</Notice>;
  }
  if (versions.state.status === 'loading') return <p className="hint">Un attimo…</p>;

  const list = versions.state.data.versions;
  const newest = list[0];

  return (
    <section className="panel story">
      <h2>La storia</h2>
      {newest === undefined ? (
        <FirstDraft filmId={filmId} written={written} />
      ) : (
        <Story
          filmId={filmId}
          versions={list}
          newest={newest}
          selectedId={chosenId ?? newest.id}
          onSelect={setChosenId}
          written={written}
        />
      )}
    </section>
  );
}

type Written = ReturnType<typeof useGuardedRun<ScreenplayVersion>>;

/** Il limite di spesa e l'errore di una scrittura, uguali per la bozza e per le modifiche. */
function WriteOutcome({ written }: { written: Written }) {
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

/**
 * Quanto costerebbe, letto quando la schermata si apre (D30). `lastVersionId` fa rileggere la stima
 * a ogni versione nuova: la bozza su cui lavora una modifica è cambiata.
 */
function useEstimate(
  filmId: string,
  mode: 'draft' | 'revise',
  lastVersionId?: string,
): number | undefined {
  const load = useCallback(
    (signal: AbortSignal) => estimateScreenplay(filmId, { mode }, signal),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la versione non entra nella chiamata: serve solo a rifarla
    [filmId, mode, lastVersionId],
  );
  const { state } = useResource(load);
  // Una stima che non arriva non blocca niente: si scrive lo stesso, solo senza la cifra.
  return state.status === 'ready' ? state.data.estimate.estimatedCostUsd : undefined;
}

function FirstDraft({ filmId, written }: { filmId: string; written: Written }) {
  const estimateUsd = useEstimate(filmId, 'draft');

  return (
    <>
      <p className="hint">
        Lo sceneggiatore scrive una bozza breve partendo dalla tua idea: una trama, le scene
        riassunte e i personaggi e i luoghi che servono. Poi puoi chiedere le modifiche che vuoi.
      </p>
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={written.running}
          onClick={() => {
            written.run((spendConfirmed) => writeScreenplayDraft(filmId, { spendConfirmed }));
          }}
        >
          {written.running
            ? 'Sto scrivendo…'
            : estimateUsd === undefined
              ? 'Scrivi la bozza'
              : `Scrivi la bozza · circa ${formatEstimate(estimateUsd)}`}
        </button>
      </div>
      <WriteOutcome written={written} />
    </>
  );
}

interface StoryProps {
  filmId: string;
  versions: readonly ScreenplayVersionSummary[];
  newest: ScreenplayVersionSummary;
  selectedId: string;
  onSelect: (versionId: string | undefined) => void;
  written: Written;
}

function Story({ filmId, versions, newest, selectedId, onSelect, written }: StoryProps) {
  const [request, setRequest] = useState('');
  const loadVersion = useCallback(
    (signal: AbortSignal) => fetchScreenplayVersion(filmId, selectedId, signal),
    [filmId, selectedId],
  );
  const version = useResource(loadVersion);
  const estimateUsd = useEstimate(filmId, 'revise', newest.id);
  const draftEstimateUsd = useEstimate(filmId, 'draft', newest.id);
  const readingOld = selectedId !== newest.id;

  return (
    <>
      <VersionPicker
        versions={versions}
        selectedId={selectedId}
        onSelect={(id) => {
          onSelect(id === newest.id ? undefined : id);
        }}
      />
      {version.state.status === 'error' ? (
        <Notice tone="error">{describeError(version.state.error)}</Notice>
      ) : version.state.status === 'loading' ? (
        <p className="hint">Un attimo…</p>
      ) : (
        <ScreenplayView screenplay={version.state.data.screenplay} />
      )}
      {readingOld ? (
        <Notice tone="info">
          Stai rileggendo una versione precedente: le modifiche si chiedono sull&apos;ultima.
        </Notice>
      ) : null}
      <ReviseBox
        request={request}
        onChange={setRequest}
        estimateUsd={estimateUsd}
        busy={written.running}
        onSubmit={() => {
          written.run((spendConfirmed) =>
            reviseScreenplay(filmId, { request, spendConfirmed }).then((created) => {
              setRequest('');
              return created;
            }),
          );
        }}
      />
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={written.running}
          onClick={() => {
            written.run((spendConfirmed) => writeScreenplayDraft(filmId, { spendConfirmed }));
          }}
        >
          {draftEstimateUsd === undefined
            ? 'Riscrivi la bozza da zero'
            : `Riscrivi la bozza da zero · circa ${formatEstimate(draftEstimateUsd)}`}
        </button>
      </div>
      <WriteOutcome written={written} />
    </>
  );
}

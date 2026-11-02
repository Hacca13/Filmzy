import type {
  DraftReview,
  ReviewDecision,
  ScreenplayVersion,
  ScreenplayVersionSummary,
} from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { ApiError } from '../../api/client';
import { fetchCast } from '../../api/cast';
import {
  editFinal,
  estimateFinal,
  fetchFinalVersion,
  fetchFinalVersions,
  fetchReview,
  writeFinal,
} from '../../api/final';
import { fetchLocations } from '../../api/locations';
import { Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { VersionPicker } from '../story/ScreenplayView';
import { WriteOutcome } from '../WriteOutcome';
import { FinalEditor } from './FinalEditor';
import { FinalView } from './FinalView';
import { ReviewList } from './ReviewList';
import { answersFor, canWrite, finalVersionNote } from './model';

/** I pannelli del cast e dei luoghi hanno questi `id`: «Cambia la mia scelta» porta lì. */
const PANEL_OF_KIND = { character: 'il-cast', location: 'i-luoghi' } as const;

/**
 * «Il riepilogo e la sceneggiatura finale» (T3.8, D18): il codice confronta la bozza con le scelte
 * e mostra le differenze; per ognuna l'utente risponde; poi lo sceneggiatore scrive la stesura
 * ufficiale, che si legge, si corregge a mano e ha le sue versioni. Scrivere costa: la stima si
 * vede prima e un limite di spesa si chiede come ovunque (D30).
 */
export function FinalPanel({ filmId }: { filmId: string }) {
  const loadReview = useCallback((signal: AbortSignal) => fetchReview(filmId, signal), [filmId]);
  const loadVersions = useCallback(
    (signal: AbortSignal) => fetchFinalVersions(filmId, signal),
    [filmId],
  );
  const review = useResource(loadReview);
  const versions = useResource(loadVersions);

  return (
    <section className="panel final" id="la-sceneggiatura-finale">
      <h2>Il riepilogo e la sceneggiatura finale</h2>
      {review.state.status === 'error' ? (
        isNotFound(review.state.error) ? (
          <p className="hint">
            Quando avrai scritto la bozza nella sezione «La storia», qui la confronteremo con le tue
            scelte e potrai chiedere la sceneggiatura finale.
          </p>
        ) : (
          <Notice tone="error">{describeError(review.state.error)}</Notice>
        )
      ) : versions.state.status === 'error' ? (
        <Notice tone="error">{describeError(versions.state.error)}</Notice>
      ) : review.state.status === 'loading' || versions.state.status === 'loading' ? (
        <p className="hint">Un attimo…</p>
      ) : (
        <FinalSection
          filmId={filmId}
          review={review.state.data}
          versions={versions.state.data.versions}
          reload={() => {
            review.reload();
            versions.reload();
          }}
        />
      )}
    </section>
  );
}

const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.serverCode === 'not_found';

interface SectionProps {
  filmId: string;
  review: DraftReview;
  versions: readonly ScreenplayVersionSummary[];
  reload: () => void;
}

function FinalSection({ filmId, review, versions, reload }: SectionProps) {
  const [answers, setAnswers] = useState<Record<string, ReviewDecision>>({});
  const [chosenId, setChosenId] = useState<string>();
  const written = useGuardedRun<ScreenplayVersion>(() => {
    setChosenId(undefined);
    reload();
  });
  const newest = versions[0];
  const estimateUsd = useFinalEstimate(filmId, review.draftVersionId, newest?.id);
  const ready = canWrite(review.differences, answers);
  const verb = newest === undefined ? 'Scrivi' : 'Riscrivi';

  return (
    <>
      <p className="hint">
        Prima si confronta la bozza con le tue scelte; poi lo sceneggiatore scrive la sceneggiatura
        finale usando solo i personaggi e i luoghi che hai scelto.
      </p>
      <h3>Il riepilogo</h3>
      <ReviewList
        differences={review.differences}
        answers={answers}
        busy={written.running}
        onAnswer={(key, decision) => {
          setAnswers((current) => ({ ...current, [key]: decision }));
        }}
        onChangeChoice={(kind) => {
          document
            .getElementById(PANEL_OF_KIND[kind])
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
      {ready ? null : <p className="hint">Rispondi a ogni differenza per poter continuare.</p>}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={!ready || written.running}
          onClick={() => {
            written.run((spendConfirmed) =>
              writeFinal(filmId, {
                answers: answersFor(review.differences, answers),
                spendConfirmed,
              }),
            );
          }}
        >
          {written.running
            ? 'Sto scrivendo…'
            : estimateUsd === undefined
              ? `${verb} la sceneggiatura finale`
              : `${verb} la sceneggiatura finale · circa ${formatEstimate(estimateUsd)}`}
        </button>
        <button type="button" className="button" disabled={written.running} onClick={reload}>
          Aggiorna il riepilogo
        </button>
      </div>
      <WriteOutcome written={written} />
      {newest === undefined ? null : (
        <FinalStory
          filmId={filmId}
          versions={versions}
          newestId={newest.id}
          selectedId={chosenId ?? newest.id}
          onSelect={setChosenId}
          onSaved={() => {
            setChosenId(undefined);
            reload();
          }}
        />
      )}
    </>
  );
}

/** Quanto costerebbe scriverla, riletto a ogni bozza o stesura nuova (D30). */
function useFinalEstimate(
  filmId: string,
  draftVersionId: string,
  finalVersionId: string | undefined,
): number | undefined {
  const load = useCallback(
    (signal: AbortSignal) => estimateFinal(filmId, signal),
    [filmId, draftVersionId, finalVersionId],
  );
  const { state } = useResource(load);
  // Una stima che non arriva non blocca niente: si scrive lo stesso, solo senza la cifra.
  return state.status === 'ready' ? state.data.estimate.estimatedCostUsd : undefined;
}

interface StoryProps {
  filmId: string;
  versions: readonly ScreenplayVersionSummary[];
  newestId: string;
  selectedId: string;
  onSelect: (versionId: string | undefined) => void;
  onSaved: () => void;
}

/** La stesura ufficiale: si rilegge, si scelgono le versioni e, sull'ultima, si corregge il testo. */
function FinalStory({ filmId, versions, newestId, selectedId, onSelect, onSaved }: StoryProps) {
  const [editing, setEditing] = useState(false);
  const action = useAction();
  const loadVersion = useCallback(
    (signal: AbortSignal) => fetchFinalVersion(filmId, selectedId, signal),
    [filmId, selectedId],
  );
  const loadCast = useCallback((signal: AbortSignal) => fetchCast(filmId, signal), [filmId]);
  const loadLocations = useCallback(
    (signal: AbortSignal) => fetchLocations(filmId, signal),
    [filmId],
  );
  const version = useResource(loadVersion);
  const cast = useResource(loadCast);
  const locations = useResource(loadLocations);
  const readingOld = selectedId !== newestId;

  return (
    <>
      <h3>La sceneggiatura finale</h3>
      <VersionPicker
        versions={versions}
        selectedId={selectedId}
        noteOf={finalVersionNote}
        label="Versioni della sceneggiatura finale"
        onSelect={(id) => {
          setEditing(false);
          onSelect(id === newestId ? undefined : id);
        }}
      />
      {version.state.status === 'error' ? (
        <Notice tone="error">{describeError(version.state.error)}</Notice>
      ) : version.state.status === 'loading' ? (
        <p className="hint">Un attimo…</p>
      ) : editing && !readingOld ? (
        <FinalEditor
          screenplay={version.state.data.screenplay}
          busy={action.busy}
          onSave={(screenplay) => {
            action.run(async () => {
              await editFinal(filmId, { screenplay });
              setEditing(false);
              onSaved();
            });
          }}
          onCancel={() => {
            setEditing(false);
            action.clearProblem();
          }}
        />
      ) : (
        <>
          <FinalView
            screenplay={version.state.data.screenplay}
            characters={cast.state.status === 'ready' ? cast.state.data.characters : []}
            locations={locations.state.status === 'ready' ? locations.state.data.locations : []}
          />
          {readingOld ? (
            <Notice tone="info">
              Stai rileggendo una versione precedente: le correzioni si fanno sull&apos;ultima.
            </Notice>
          ) : (
            <div className="actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  setEditing(true);
                }}
              >
                Correggi il testo
              </button>
            </div>
          )}
        </>
      )}
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
    </>
  );
}

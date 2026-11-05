import type { FilmEstimate, FilmKind, FilmKindOption } from '@filmzy/contracts';
import { useEffect, useState } from 'react';

import { fetchFilmEstimate } from '../api/projects';
import { describeError } from '../settings/messages';
import {
  FILM_KIND_TEXTS,
  formatCostRange,
  formatLength,
  lengthForKind,
  noEstimateText,
} from './model';

/** Quanto aspettare che il cursore si fermi prima di chiedere il costo: si muove a scatti rapidi. */
const ESTIMATE_DELAY_MS = 200;

/** Cosa si sa del costo indicativo. Mentre arriva il nuovo resta quello di prima, così non salta. */
export type EstimateState =
  | { status: 'loading' }
  | { status: 'ready'; estimate: FilmEstimate }
  | { status: 'failed'; problem: string };

function useFilmEstimate(durationS: number | undefined): EstimateState {
  const [state, setState] = useState<EstimateState>({ status: 'loading' });
  useEffect(() => {
    if (durationS === undefined) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchFilmEstimate(durationS, controller.signal)
        .then((estimate) => {
          setState({ status: 'ready', estimate });
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setState({ status: 'failed', problem: describeError(error) });
          }
        });
    }, ESTIMATE_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [durationS]);
  return state;
}

interface FieldProps {
  kinds: readonly FilmKindOption[];
  kind: FilmKind | undefined;
  durationS: number | undefined;
  onChange: (changes: { kind?: FilmKind; durationS?: number }) => void;
}

/**
 * «Che film vuoi fare?» (D85): il tipo di film, quanto dura più o meno e il costo indicativo. La durata serve
 * allo sceneggiatore e alla stima, non è un obbligo: il film durerà quello che si monta.
 */
export function FilmKindField(props: FieldProps) {
  return <FilmKindBody {...props} estimate={useFilmEstimate(props.durationS)} />;
}

/** Quello che si vede: senza stato, così si prova da solo. */
export function FilmKindBody({
  kinds,
  kind,
  durationS,
  onChange,
  estimate,
}: FieldProps & { estimate: EstimateState }) {
  const chosen = kinds.find(({ id }) => id === kind);

  return (
    <fieldset className="film-kind-field">
      <legend>Che film vuoi fare?</legend>
      <p className="hint">Serve allo sceneggiatore per capire quanta storia scrivere.</p>
      <div className="film-kinds">
        {kinds.map((option) => {
          const texts = FILM_KIND_TEXTS[option.id];
          return (
            <label
              key={option.id}
              className="film-kind"
              data-selected={option.id === kind}
              data-available={option.available}
            >
              <input
                type="radio"
                name="kind"
                value={option.id}
                checked={option.id === kind}
                disabled={!option.available}
                onChange={() => {
                  onChange({ kind: option.id, durationS: lengthForKind(option, durationS) });
                }}
              />
              {option.available ? null : <span className="chip">Nella prossima versione</span>}
              <span className="film-kind-name">{texts.name}</span>
              <span className="hint">{texts.idea}</span>
              <span className="hint">{texts.length}</span>
            </label>
          );
        })}
      </div>
      <p className="hint">
        I film lunghi vanno scritti a parti: arrivano nella prossima versione di Filmzy.
      </p>

      {chosen === undefined || durationS === undefined ? null : (
        <div className="film-length">
          <div className="film-length-column">
            <div className="film-length-row">
              <label htmlFor="film-length">Quanto dura, più o meno?</label>
              <strong>circa {formatLength(durationS)}</strong>
            </div>
            <div className="film-length-slider">
              <span className="hint">{formatLength(chosen.minS)}</span>
              <input
                id="film-length"
                type="range"
                min={chosen.minS}
                max={chosen.maxS}
                step={chosen.stepS}
                value={durationS}
                onChange={(event) => {
                  onChange({ durationS: Number(event.target.value) });
                }}
              />
              {chosen.maxS === undefined ? null : (
                <span className="hint">{formatLength(chosen.maxS)}</span>
              )}
            </div>
            <p className="hint">
              È solo un’indicazione: puoi cambiarla quando vuoi, e alla fine il film durerà quello
              che monti.
            </p>
          </div>
          <div className="film-length-column">
            <p className="hint">Costo indicativo</p>
            <EstimateBody state={estimate} />
            <p className="hint">
              Non spendi niente adesso: prima di ogni generazione vedi quanto costa.
            </p>
          </div>
        </div>
      )}
    </fieldset>
  );
}

function EstimateBody({ state }: { state: EstimateState }) {
  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'failed') {
    return (
      <>
        <p>{state.problem}</p>
        <p className="hint">Puoi comunque creare il film.</p>
      </>
    );
  }
  const { estimate } = state;
  if (!estimate.available) {
    return (
      <>
        <p>{noEstimateText(estimate.reason)}</p>
        <p>
          <a className="button" href="#/impostazioni/connessioni">
            Vai alle impostazioni
          </a>
        </p>
        <p className="hint">Puoi comunque creare il film.</p>
      </>
    );
  }
  return (
    <>
      <p className="film-cost">{formatCostRange(estimate.lowUsd, estimate.highUsd)}</p>
      <p className="hint">
        Per video e storyboard. Il numero più basso vale se tieni il primo video di ogni
        inquadratura, il più alto se li rifai tutti una volta. Personaggi, luoghi e suoni sono a
        parte.
      </p>
    </>
  );
}

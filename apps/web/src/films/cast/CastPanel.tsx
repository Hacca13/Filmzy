import type { Cast, CastSuggestions, CastingSuggestion } from '@filmzy/contracts';
import { useCallback, useRef, useState } from 'react';

import {
  addCharacter,
  estimateCast,
  fetchCast,
  removeCharacter,
  suggestCast,
  updateCharacter,
} from '../../api/cast';
import { Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { SpendConfirm } from '../../settings/spend/SpendConfirm';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { CharacterCard, SuggestionCard } from './Cards';
import { countOptions, slotsLeft } from './model';

/**
 * «I personaggi» (T3.5, D18, D22): il direttore del casting propone i personaggi a partire dalla
 * storia, e l'utente li aggiunge, cambia o scarta. Quante proposte e quanti personaggi al massimo lo
 * decide il server. Chiedere le proposte costa: la stima si vede prima, e sopra un limite di spesa
 * si chiede cosa fare (D30).
 */
export function CastPanel({ filmId }: { filmId: string }) {
  const loadCast = useCallback((signal: AbortSignal) => fetchCast(filmId, signal), [filmId]);
  const cast = useResource(loadCast);

  if (cast.state.status === 'error') {
    return <Notice tone="error">{describeError(cast.state.error)}</Notice>;
  }
  if (cast.state.status === 'loading') return <p className="hint">Un attimo…</p>;

  return <CastView filmId={filmId} cast={cast.state.data} reload={cast.reload} />;
}

interface ViewProps {
  filmId: string;
  cast: Cast;
  reload: () => void;
}

function CastView({ filmId, cast, reload }: ViewProps) {
  const slots = slotsLeft(cast);
  const [chosenCount, setChosenCount] = useState<number>();
  const count = Math.min(chosenCount ?? slots, slots);
  // Le proposte sul tavolo: non si salvano, restano finché l'utente sceglie.
  const [suggestions, setSuggestions] = useState<CastingSuggestion[]>([]);
  // Quale proposta sta venendo cambiata, se non si sta chiedendo il cast da zero.
  const replacing = useRef<number | undefined>(undefined);
  const action = useAction();

  const received = useGuardedRun<CastSuggestions>((result) => {
    const index = replacing.current;
    replacing.current = undefined;
    setSuggestions((current) =>
      index === undefined
        ? result.suggestions
        : current.flatMap((item, position) =>
            position === index ? (result.suggestions[0] ?? []) : [item],
          ),
    );
  });

  const askForCast = () => {
    replacing.current = undefined;
    received.run((spendConfirmed) =>
      suggestCast(filmId, { count, pending: suggestions, spendConfirmed }),
    );
  };

  const changeOne = (index: number) => {
    replacing.current = index;
    received.run((spendConfirmed) =>
      suggestCast(filmId, { count: 1, pending: suggestions, spendConfirmed }),
    );
  };

  const add = (index: number) => {
    const suggestion = suggestions[index];
    if (suggestion === undefined) return;
    action.run(async () => {
      await addCharacter(filmId, suggestion);
      setSuggestions((current) => current.filter((_, position) => position !== index));
      reload();
    });
  };

  const busy = received.running || received.raising || action.busy;

  return (
    <section className="panel cast">
      <h2>I personaggi</h2>
      <p className="hint">
        Puoi avere al massimo {cast.maxCharacters} personaggi principali. Il casting li propone
        partendo dalla storia: tu li aggiungi, li cambi o li scarti.
      </p>

      {cast.characters.length === 0 ? null : (
        <ul className="characters">
          {cast.characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              tags={cast.tags}
              busy={busy}
              onSave={(changes) => {
                action.run(async () => {
                  await updateCharacter(filmId, character.id, changes);
                  reload();
                });
              }}
              onRemove={() => {
                action.run(async () => {
                  await removeCharacter(filmId, character.id);
                  reload();
                });
              }}
            />
          ))}
        </ul>
      )}

      {suggestions.length === 0 ? null : (
        <ul className="characters">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={`${suggestion.name}-${String(index)}`}
              suggestion={suggestion}
              tags={cast.tags}
              busy={busy}
              canAdd={slots > 0}
              onAdd={() => {
                add(index);
              }}
              onChange={() => {
                changeOne(index);
              }}
              onDiscard={() => {
                setSuggestions((current) => current.filter((_, position) => position !== index));
              }}
            />
          ))}
        </ul>
      )}

      {slots === 0 ? (
        <p className="hint">Il cast è completo. Togli un personaggio per proporne un altro.</p>
      ) : (
        <Ask
          filmId={filmId}
          slots={slots}
          count={count}
          castSize={cast.characters.length}
          busy={busy}
          running={received.running}
          onCount={setChosenCount}
          onAsk={askForCast}
        />
      )}

      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      {received.problem === undefined ? null : <Notice tone="error">{received.problem}</Notice>}
      {received.breach === undefined ? null : (
        <SpendConfirm
          breach={received.breach}
          busy={received.running || received.raising}
          onProceed={received.proceed}
          onRaise={received.raiseAndRetry}
          onCancel={() => {
            replacing.current = undefined;
            received.cancel();
          }}
        />
      )}
    </section>
  );
}

interface AskProps {
  filmId: string;
  slots: number;
  count: number;
  castSize: number;
  busy: boolean;
  running: boolean;
  onCount: (count: number) => void;
  onAsk: () => void;
}

/** «Quanti personaggi?» e il pulsante che li chiede, con la stima che segue la quantità (D30). */
function Ask({ filmId, slots, count, castSize, busy, running, onCount, onAsk }: AskProps) {
  const loadEstimate = useCallback(
    (signal: AbortSignal) => estimateCast(filmId, count, signal),
    // `castSize` fa rifare la stima quando il cast cambia: il casting riceve un cast diverso.
    [filmId, count, castSize],
  );
  const estimate = useResource(loadEstimate);
  // Una stima che non arriva non blocca niente: si chiede lo stesso, solo senza la cifra.
  const estimateUsd =
    estimate.state.status === 'ready' ? estimate.state.data.estimate.estimatedCostUsd : undefined;

  return (
    <div className="ask">
      <div className="field">
        <label htmlFor="cast-count">Quanti personaggi?</label>
        <select
          id="cast-count"
          value={count}
          disabled={busy}
          onChange={(event) => {
            onCount(Number(event.target.value));
          }}
        >
          {countOptions(slots).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || count < 1}
          onClick={onAsk}
        >
          {running
            ? 'Sto cercando…'
            : estimateUsd === undefined
              ? 'Proponi il cast'
              : `Proponi il cast · circa ${formatEstimate(estimateUsd)}`}
        </button>
      </div>
    </div>
  );
}

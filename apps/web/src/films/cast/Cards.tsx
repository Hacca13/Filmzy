import type { CastingSuggestion, Character, ProjectChoice } from '@filmzy/contracts';
import { useState } from 'react';

import { SheetSection } from './SheetSection';
import {
  appearanceSummary,
  profileDraftOf,
  sameProfile,
  tagLabel,
  toProfile,
  type ProfileDraft,
} from './model';

interface SuggestionCardProps {
  suggestion: CastingSuggestion;
  tags: readonly ProjectChoice[];
  busy: boolean;
  /** Si può aggiungere solo se c'è ancora posto nel cast. */
  canAdd: boolean;
  onAdd: () => void;
  onChange: () => void;
  onDiscard: () => void;
}

/** Una proposta del casting: l'utente la aggiunge al film, ne chiede un'altra o la scarta. */
export function SuggestionCard({
  suggestion,
  tags,
  busy,
  canAdd,
  onAdd,
  onChange,
  onDiscard,
}: SuggestionCardProps) {
  const details = [
    ['Carattere', suggestion.profile?.personality],
    ['Come si comporta', suggestion.profile?.behavior],
    ['Cosa vuole', suggestion.profile?.goal],
  ].filter(([, text]) => text !== undefined);

  return (
    <li className="character-card" data-kind="suggestion">
      <h4>{suggestion.name}</h4>
      <p className="hint">
        {tagLabel(tags, suggestion.tag) ?? 'Personaggio'} · {suggestion.role}
      </p>
      <p>{suggestion.description}</p>
      <p className="hint">Rapporto con il protagonista: {suggestion.relationToProtagonist}</p>
      <p className="hint">Aspetto: {appearanceSummary(suggestion.appearance)}</p>
      {details.map(([label, text]) => (
        <p key={label} className="hint">
          {label}: {text}
        </p>
      ))}
      <p className="hint">Perché lo proponiamo: {suggestion.why}</p>
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || !canAdd}
          onClick={onAdd}
        >
          Aggiungi
        </button>
        <button type="button" className="button" disabled={busy} onClick={onChange}>
          Cambia
        </button>
        <button type="button" className="button" disabled={busy} onClick={onDiscard}>
          Scarta
        </button>
      </div>
    </li>
  );
}

interface CharacterCardProps {
  filmId: string;
  character: Character;
  tags: readonly ProjectChoice[];
  busy: boolean;
  onSave: (changes: { tag?: string; profile?: ProfileDraftValue }) => void;
  onRemove: () => void;
}

type ProfileDraftValue = ReturnType<typeof toProfile>;

/**
 * Un personaggio già nel film. Il ruolo e i dettagli facoltativi (carattere, come si comporta, cosa
 * vuole) si possono rivedere: servono a tenerlo coerente, e si possono lasciare vuoti (D22).
 */
export function CharacterCard({
  filmId,
  character,
  tags,
  busy,
  onSave,
  onRemove,
}: CharacterCardProps) {
  const original = profileDraftOf(character.profile);
  const [tag, setTag] = useState(character.tag);
  const [draft, setDraft] = useState<ProfileDraft>(original);
  const changed = tag !== character.tag || !sameProfile(draft, original);

  const field = (key: keyof ProfileDraft, label: string) => (
    <div className="field">
      <label htmlFor={`${character.id}-${key}`}>{label} (facoltativo)</label>
      <input
        id={`${character.id}-${key}`}
        type="text"
        value={draft[key]}
        onChange={(event) => {
          setDraft({ ...draft, [key]: event.target.value });
        }}
      />
    </div>
  );

  return (
    <li className="character-card">
      <h4>{character.name}</h4>
      <p>{character.description}</p>
      <p className="hint">Aspetto: {appearanceSummary(character.appearance)}</p>
      <div className="field">
        <label htmlFor={`${character.id}-tag`}>Ruolo nella storia</label>
        <select
          id={`${character.id}-tag`}
          value={tag}
          onChange={(event) => {
            setTag(event.target.value);
          }}
        >
          {tags.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>
      {field('personality', 'Carattere')}
      {field('behavior', 'Come si comporta')}
      {field('goal', 'Cosa vuole')}
      <SheetSection filmId={filmId} characterId={character.id} />
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind="primary"
          disabled={busy || !changed}
          onClick={() => {
            onSave({
              ...(tag === character.tag ? {} : { tag }),
              ...(sameProfile(draft, original) ? {} : { profile: toProfile(draft) }),
            });
          }}
        >
          Salva le modifiche
        </button>
        <button type="button" className="button" disabled={busy} onClick={onRemove}>
          Togli dal film
        </button>
      </div>
    </li>
  );
}

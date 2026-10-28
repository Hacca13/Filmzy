import type { ProjectOptions } from '@filmzy/contracts';

import { Notice } from '../components/ui';
import { formatCount } from '../lib/format';
import { ChoiceGroup } from './ChoiceGroup';
import { formatDuration, toBody, type IdeaDraft } from './model';

interface Props {
  options: ProjectOptions;
  draft: IdeaDraft;
  onChange: (draft: IdeaDraft) => void;
  onSubmit: () => void;
  submitLabel: string;
  busy: boolean;
  /** Cosa è andato storto nell'ultimo invio, già in parole semplici. */
  problem?: string | undefined;
}

/**
 * Il modulo «La tua idea» (T3.2): l'idea in poche righe, un titolo facoltativo e le scelte di
 * genere, tono, stile, fotografia e durata. Mostra e invia: cosa è valido lo decide il server.
 */
export function IdeaForm({
  options,
  draft,
  onChange,
  onSubmit,
  submitLabel,
  busy,
  problem,
}: Props) {
  const set = (changes: Partial<IdeaDraft>) => {
    onChange({ ...draft, ...changes });
  };
  const complete = toBody(draft) !== undefined;

  return (
    <form
      className="idea-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (complete && !busy) onSubmit();
      }}
    >
      <div className="field">
        <label htmlFor="idea">Racconta la tua idea in poche righe</label>
        <textarea
          id="idea"
          className="idea-text"
          rows={6}
          maxLength={options.ideaMaxLength}
          placeholder="Per esempio: una bobina dimenticata sull'ultimo treno, e una sola notte per portarla al cinema."
          value={draft.idea}
          onChange={(event) => {
            set({ idea: event.target.value });
          }}
        />
        <p className="hint idea-counter">
          Non serve scrivere tutto: basta una scintilla.{' '}
          <span>
            {formatCount(draft.idea.length)} / {formatCount(options.ideaMaxLength)}
          </span>
        </p>
      </div>

      <div className="field">
        <label htmlFor="title">Titolo (facoltativo)</label>
        <input
          id="title"
          type="text"
          maxLength={options.titleMaxLength}
          placeholder="Se lo lasci vuoto lo propone Filmzy"
          value={draft.title}
          onChange={(event) => {
            set({ title: event.target.value });
          }}
        />
      </div>

      <ChoiceGroup
        legend="Genere"
        name="genre"
        choices={options.genres}
        value={draft.genre}
        onChange={(genre) => {
          set({ genre });
        }}
      />
      <ChoiceGroup
        legend="Tono"
        name="tone"
        choices={options.tones}
        value={draft.tone}
        onChange={(tone) => {
          set({ tone });
        }}
      />
      <ChoiceGroup
        legend="Stile visivo"
        name="style"
        choices={options.styles}
        value={draft.style}
        onChange={(style) => {
          set({ style });
        }}
      />
      <ChoiceGroup
        legend="Fotografia"
        name="cinematography"
        choices={options.cinematography}
        value={draft.cinematography}
        onChange={(cinematography) => {
          set({ cinematography });
        }}
      />
      <ChoiceGroup
        legend="Durata"
        name="duration"
        choices={options.durationsS.map((seconds) => ({
          id: String(seconds),
          label: formatDuration(seconds),
        }))}
        value={draft.durationS === undefined ? undefined : String(draft.durationS)}
        onChange={(seconds) => {
          set({ durationS: Number(seconds) });
        }}
      />

      {problem === undefined ? null : <Notice tone="error">{problem}</Notice>}
      <div className="actions">
        <button type="submit" className="button" data-kind="primary" disabled={!complete || busy}>
          {busy ? 'Un attimo…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

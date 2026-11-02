import { REVISION_REQUEST_MAX_LENGTH } from '@filmzy/contracts';

import { formatEstimate } from '../../lib/format';

interface Props {
  request: string;
  onChange: (request: string) => void;
  onSubmit: () => void;
  /** Quanto costerebbe, se la stima è arrivata. */
  estimateUsd: number | undefined;
  busy: boolean;
}

/**
 * «Parla con lo sceneggiatore» (T3.4): una richiesta a turno singolo, in una frase. Ogni richiesta
 * scrive una versione nuova; quella di prima resta. Il testo passa dal moderatore (T3.3).
 */
export function ReviseBox({ request, onChange, onSubmit, estimateUsd, busy }: Props) {
  const ready = request.trim() !== '';

  return (
    <form
      className="revise"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready && !busy) onSubmit();
      }}
    >
      <label htmlFor="revise-request">Parla con lo sceneggiatore</label>
      <textarea
        id="revise-request"
        rows={3}
        maxLength={REVISION_REQUEST_MAX_LENGTH}
        placeholder="Per esempio: rendila più cupa, con un finale aperto."
        value={request}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      <p className="hint">
        Una richiesta alla volta: ne nasce una versione nuova e quella di prima resta.
      </p>
      <div className="actions">
        <button type="submit" className="button" data-kind="primary" disabled={!ready || busy}>
          {busy
            ? 'Sto scrivendo…'
            : estimateUsd === undefined
              ? 'Chiedi la modifica'
              : `Chiedi la modifica · circa ${formatEstimate(estimateUsd)}`}
        </button>
      </div>
    </form>
  );
}

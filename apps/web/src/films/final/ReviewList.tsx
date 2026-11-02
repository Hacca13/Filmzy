import type { ReviewDecision, ReviewDifference } from '@filmzy/contracts';

import { describeDifference } from './model';

interface Props {
  differences: readonly ReviewDifference[];
  answers: Readonly<Record<string, ReviewDecision>>;
  onAnswer: (key: string, decision: ReviewDecision) => void;
  /** «Cambia la mia scelta»: porta al cast o ai luoghi, dove si cambia. */
  onChangeChoice: (kind: ReviewDifference['kind']) => void;
  busy: boolean;
}

const DECISION_LABELS: Record<ReviewDecision, string> = {
  adapt: 'Adatta la storia',
  keep: 'Va bene così',
};

/**
 * Le differenze fra la bozza e le scelte (T3.8, D18). Per ciascuna una frase e i pulsanti che il
 * server ammette: dove non c'è da decidere resta solo «Cambia la mia scelta». Senza differenze
 * il passo si salta: si dice che tutto torna.
 */
export function ReviewList({ differences, answers, onAnswer, onChangeChoice, busy }: Props) {
  if (differences.length === 0) {
    return <p className="review-ok">✓ Tutto torna: la storia è pronta.</p>;
  }

  return (
    <ul className="review">
      {differences.map((difference) => (
        <li key={difference.key} className="difference">
          <p>
            <span aria-hidden="true">⚠ </span>
            {describeDifference(difference)}
          </p>
          <div className="actions">
            {difference.choices.map((decision) => (
              <button
                key={decision}
                type="button"
                className="button"
                data-selected={answers[difference.key] === decision}
                aria-pressed={answers[difference.key] === decision}
                disabled={busy}
                onClick={() => {
                  onAnswer(difference.key, decision);
                }}
              >
                {DECISION_LABELS[decision]}
              </button>
            ))}
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => {
                onChangeChoice(difference.kind);
              }}
            >
              Cambia la mia scelta
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

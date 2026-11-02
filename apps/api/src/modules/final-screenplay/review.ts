import type {
  AcceptedElement,
  Character,
  Location,
  ReviewAnswer,
  ReviewDifference,
  Screenplay,
} from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

type Kind = ReviewDifference['kind'];

interface Named {
  id: string;
  name: string;
}

/**
 * Il confronto fra la bozza e le scelte (T3.8, D18): lo fa il codice, non un modello. Una
 * differenza è un personaggio o un luogo che la bozza cita e il film non ha, o viceversa; li lega
 * il `proposalId` (le proposte della bozza hanno un id, le scelte lo ricordano).
 *
 * Prima i personaggi, poi i luoghi; in ciascun gruppo prima ciò che la bozza cita e il film non ha.
 * Senza differenze il passo del riepilogo si salta.
 */
export function compareDraftWithChoices(
  draft: Screenplay,
  characters: readonly Character[],
  locations: readonly Location[],
): ReviewDifference[] {
  return [
    ...differencesOf('character', draft.characters, characters),
    ...differencesOf('location', draft.locations, locations),
  ];
}

function differencesOf(
  kind: Kind,
  proposals: readonly Named[],
  chosen: readonly (Named & { proposalId?: string | undefined })[],
): ReviewDifference[] {
  const proposalsTaken = new Set(chosen.flatMap((item) => item.proposalId ?? []));
  const proposalIds = new Set(proposals.map((proposal) => proposal.id));

  const notChosen = proposals
    .filter((proposal) => !proposalsTaken.has(proposal.id))
    .map((proposal): ReviewDifference => ({
      key: `${kind}:not_chosen:${proposal.id}`,
      kind,
      reason: 'not_chosen',
      name: proposal.name,
      choices: ['adapt', 'keep'],
    }));

  // Il film ha un personaggio o un luogo che la bozza non cita: la stesura lo inserirà comunque,
  // quindi non c'è niente da decidere. L'utente lo vede e, se vuole, cambia la scelta.
  const notInDraft = chosen
    .filter((item) => item.proposalId === undefined || !proposalIds.has(item.proposalId))
    .map((item): ReviewDifference => ({
      key: `${kind}:not_in_draft:${item.id}`,
      kind,
      reason: 'not_in_draft',
      name: item.name,
      choices: [],
    }));

  return [...notChosen, ...notInDraft];
}

/**
 * Le risposte dell'utente diventano gli elementi «accettati» che lo sceneggiatore riceve (D18):
 * quelli a cui ha detto «Va bene così» restano come comparsa o luogo generico, senza scheda.
 * «Adatta la storia» non porta niente: la stesura usa solo cast e luoghi scelti.
 *
 * Le risposte devono corrispondere alle differenze di adesso: una risposta a una differenza che non
 * c'è più (l'utente ha cambiato il cast nel frattempo), una risposta non ammessa, due risposte alla
 * stessa differenza, o una differenza lasciata senza risposta, fermano la stesura.
 */
export function acceptedFromAnswers(
  differences: readonly ReviewDifference[],
  answers: readonly ReviewAnswer[],
): AcceptedElement[] {
  const byKey = new Map(differences.map((difference) => [difference.key, difference]));
  const answered = new Map<string, ReviewAnswer['decision']>();

  for (const answer of answers) {
    const difference = byKey.get(answer.key);
    if (difference?.choices.includes(answer.decision) !== true || answered.has(answer.key)) {
      throw domainError(409, 'invalid_request', { details: { field: 'answers' } });
    }
    answered.set(answer.key, answer.decision);
  }

  const unanswered = differences.some(
    (difference) => difference.choices.length > 0 && !answered.has(difference.key),
  );
  if (unanswered) throw domainError(409, 'invalid_request', { details: { field: 'answers' } });

  return differences
    .filter((difference) => answered.get(difference.key) === 'keep')
    .map((difference) => ({ kind: difference.kind, name: difference.name }));
}

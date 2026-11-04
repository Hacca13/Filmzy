import { createHash } from 'node:crypto';

import type { ContinuityFlag, ContinuityState, ShotSpec } from '@filmzy/contracts';

import { ruleFlag } from './continuity.js';

/**
 * R1 e R2 (architettura §8): la continuità fra un'inquadratura e la successiva, calcolata dal piano
 * stesso. Sono funzioni pure, così si provano a parte: i dati li legge `ShotsService`.
 */

/** I nomi con cui si parla all'utente di personaggi e luoghi (l'id non gli dice niente). */
export interface Names {
  characters: Readonly<Record<string, string>>;
  locations: Readonly<Record<string, string>>;
}

export interface ChainInput {
  /** Le inquadrature di una scena, in qualunque ordine. */
  shots: readonly ShotSpec[];
  /** L'uscita della scena prima da cui è partito questo piano, se c'era. */
  basedOn: ContinuityState | undefined;
  /** Come finisce adesso la scena pensata subito prima, se il suo piano vale ancora. */
  before: ContinuityState | undefined;
  names: Names;
}

const plain = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Parole che non cambiano il senso di un'ora o di un abito: «di sera» e «sera» sono la stessa cosa. */
const FILLER_WORDS = new Set(
  'a al alla dal dalla di del della il in la le lo nel nella un una e'.split(' '),
);

const wordsOf = (text: string): Set<string> =>
  new Set(
    plain(text)
      .split(' ')
      .filter((word) => word !== '' && !FILLER_WORDS.has(word)),
  );

/**
 * Il testo libero lo scrive un modello: due testi dicono la stessa cosa se hanno le stesse parole, senza
 * badare a maiuscole, accenti, punteggiatura, articoli e preposizioni («sera», «Sera.» e «di sera»). Una
 * parola in più cambia il senso («giacca blu» e «senza giacca blu», «bicchiere» e «bicchiere rotto»): meglio
 * un giallo in più, che si ignora, di un errore che nessuno vede.
 */
const sameText = (a: string, b: string): boolean => {
  const first = wordsOf(a);
  const second = wordsOf(b);
  if (first.size === 0 || second.size === 0) return plain(a) === plain(b);
  return first.size === second.size && [...first].every((word) => second.has(word));
};

const quoted = (text: string): string => `«${text}»`;

/** Una differenza: come dirla all'utente e, per la chiave di R2, cosa cambia davvero. */
interface Difference {
  text: string;
  key: string;
}

/** Le stesse parole di `sameText`, in una forma sola: due testi uguali per `sameText` danno la stessa. */
const canonical = (text: string): string => {
  const words = [...wordsOf(text)].sort();
  return words.length > 0 ? words.join(' ') : plain(text);
};

function differencesOf(from: ContinuityState, to: ContinuityState, names: Names): Difference[] {
  const who = (id: string): string => names.characters[id] ?? 'Un personaggio';
  const where = (id: string): string => names.locations[id] ?? 'un altro luogo';
  const differences: Difference[] = [];

  if (from.locationId !== to.locationId) {
    differences.push({
      text: `il luogo cambia (da ${quoted(where(from.locationId))} a ${quoted(where(to.locationId))})`,
      key: `luogo:${from.locationId}>${to.locationId}`,
    });
  }
  if (!sameText(from.timeOfDay, to.timeOfDay)) {
    differences.push({
      text: `l'ora cambia (da ${quoted(from.timeOfDay)} a ${quoted(to.timeOfDay)})`,
      key: `ora:${canonical(from.timeOfDay)}>${canonical(to.timeOfDay)}`,
    });
  }
  for (const id of to.present.filter((present) => !from.present.includes(present))) {
    differences.push({ text: `${who(id)} compare`, key: `entra:${id}` });
  }
  for (const id of from.present.filter((present) => !to.present.includes(present))) {
    differences.push({ text: `${who(id)} non c'è più`, key: `esce:${id}` });
  }
  for (const id of to.present.filter((present) => from.present.includes(present))) {
    const before = from.costumes[id];
    const after = to.costumes[id];
    if (before !== undefined && after !== undefined && !sameText(before, after)) {
      differences.push({
        text: `${who(id)} cambia d'abito (da ${quoted(before)} a ${quoted(after)})`,
        key: `abito:${id}:${canonical(before)}>${canonical(after)}`,
      });
    }
  }

  for (const prop of to.props.filter((item) => !from.props.some((old) => sameText(item, old)))) {
    differences.push({ text: `compare ${quoted(prop)}`, key: `oggetto+:${canonical(prop)}` });
  }
  for (const prop of from.props.filter((item) => !to.props.some((now) => sameText(item, now)))) {
    differences.push({ text: `sparisce ${quoted(prop)}`, key: `oggetto-:${canonical(prop)}` });
  }
  return differences;
}

/** Cosa è diverso fra come finisce un'inquadratura e come comincia la successiva, in parole semplici. */
export function continuityDifferences(
  from: ContinuityState,
  to: ContinuityState,
  names: Names,
): string[] {
  return differencesOf(from, to, names).map((difference) => difference.text);
}

/**
 * R1: nella stessa scena l'entrata di un'inquadratura combacia con l'uscita della precedente, salvo un
 * cambiamento dichiarato (`continuity.change`).
 *
 * R2: se l'uscita della scena prima è **cambiata** rispetto a quella da cui questo piano è partito, la
 * prima inquadratura di questa scena, che ne dipendeva, diventa gialla se ora non combacia. Tra due scene
 * può passare del tempo: una differenza che c'era già, o un piano nato senza una scena prima, non è un
 * errore. Il giallo passa da solo quando si rifà il piano della scena. Un cambiamento dichiarato qui non
 * salva: era scritto pensando all'uscita di prima, che ora è un'altra.
 */
export function chainFlags(input: ChainInput): Record<string, ContinuityFlag[]> {
  const shots = [...input.shots].sort((a, b) => a.order - b.order);
  const flags: Record<string, ContinuityFlag[]> = {};

  for (const [index, shot] of shots.entries()) {
    const previous = shots[index - 1];
    if (previous !== undefined) {
      if (shot.continuity.change !== undefined) continue;
      const differences = continuityDifferences(
        previous.continuity.exit,
        shot.continuity.entry,
        input.names,
      );
      if (differences.length > 0) {
        flags[shot.id] = [
          ruleFlag({
            code: 'R1',
            // Entrata e uscita non cambiano senza un piano nuovo, che ha id nuovi: basta l'inquadratura.
            key: `R1:${shot.id}`,
            reason: `Questa inquadratura comincia in modo diverso da come finisce quella prima: ${differences.join('; ')}. Se non è voluto, rifai il piano della scena.`,
            fix: 'replan',
          }),
        ];
      }
    } else if (
      input.before !== undefined &&
      input.basedOn !== undefined &&
      continuityDifferences(input.basedOn, input.before, input.names).length > 0
    ) {
      const differences = differencesOf(input.before, shot.continuity.entry, input.names);
      if (differences.length > 0) {
        const texts = differences.map((difference) => difference.text);
        const situation = differences
          .map((difference) => difference.key)
          .sort()
          .join('|');
        flags[shot.id] = [
          ruleFlag({
            code: 'R2',
            // Se la scena prima cambia ancora in un altro modo è un'altra situazione; se il modello riscrive
            // la stessa uscita con altre parole, o si cambia un nome, no: conta cosa è diverso, non il testo.
            key: `R2:${shot.id}:${createHash('sha256').update(situation).digest('hex').slice(0, 12)}`,
            reason: `La scena prima è stata ripensata e ora finisce in modo diverso da come questa comincia: ${texts.join('; ')}. Rifai il piano di questa scena per tenerle allineate.`,
            fix: 'replan',
          }),
        ];
      }
    }
  }
  return flags;
}

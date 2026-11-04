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

/** Cosa è diverso fra come finisce un'inquadratura e come comincia la successiva, in parole semplici. */
export function continuityDifferences(
  from: ContinuityState,
  to: ContinuityState,
  names: Names,
): string[] {
  const who = (id: string): string => names.characters[id] ?? 'Un personaggio';
  const where = (id: string): string => names.locations[id] ?? 'un altro luogo';
  const differences: string[] = [];

  if (from.locationId !== to.locationId) {
    differences.push(
      `il luogo cambia (da ${quoted(where(from.locationId))} a ${quoted(where(to.locationId))})`,
    );
  }
  if (!sameText(from.timeOfDay, to.timeOfDay)) {
    differences.push(`l'ora cambia (da ${quoted(from.timeOfDay)} a ${quoted(to.timeOfDay)})`);
  }
  for (const id of to.present.filter((present) => !from.present.includes(present))) {
    differences.push(`${who(id)} compare`);
  }
  for (const id of from.present.filter((present) => !to.present.includes(present))) {
    differences.push(`${who(id)} non c'è più`);
  }
  for (const id of to.present.filter((present) => from.present.includes(present))) {
    const before = from.costumes[id];
    const after = to.costumes[id];
    if (before !== undefined && after !== undefined && !sameText(before, after)) {
      differences.push(`${who(id)} cambia d'abito (da ${quoted(before)} a ${quoted(after)})`);
    }
  }

  for (const prop of to.props.filter((item) => !from.props.some((old) => sameText(item, old)))) {
    differences.push(`compare ${quoted(prop)}`);
  }
  for (const prop of from.props.filter((item) => !to.props.some((now) => sameText(item, now)))) {
    differences.push(`sparisce ${quoted(prop)}`);
  }
  return differences;
}

/**
 * R1: nella stessa scena l'entrata di un'inquadratura combacia con l'uscita della precedente, salvo un
 * cambiamento dichiarato (`continuity.change`).
 *
 * R2: se l'uscita della scena prima è **cambiata** rispetto a quella da cui questo piano è partito, la
 * prima inquadratura di questa scena, che ne dipendeva, diventa gialla se ora non combacia. Tra due scene
 * può passare del tempo: una differenza che c'era già, o un piano nato senza una scena prima, non è un
 * errore. Il giallo passa da solo quando si rifà il piano della scena.
 */
export function chainFlags(input: ChainInput): Record<string, ContinuityFlag[]> {
  const shots = [...input.shots].sort((a, b) => a.order - b.order);
  const flags: Record<string, ContinuityFlag[]> = {};

  for (const [index, shot] of shots.entries()) {
    if (shot.continuity.change !== undefined) continue;
    const previous = shots[index - 1];
    if (previous !== undefined) {
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
      const differences = continuityDifferences(input.before, shot.continuity.entry, input.names);
      if (differences.length > 0) {
        flags[shot.id] = [
          ruleFlag({
            code: 'R2',
            // Se la scena prima cambia ancora in un altro modo è un'altra situazione; se il modello riscrive
            // la stessa uscita con altre parole, no: si guarda a cosa è diverso, non al testo.
            key: `R2:${shot.id}:${createHash('sha256').update(differences.join('|')).digest('hex').slice(0, 12)}`,
            reason: `La scena prima è stata ripensata e ora finisce in modo diverso da come questa comincia: ${differences.join('; ')}. Rifai il piano di questa scena per tenerle allineate.`,
            fix: 'replan',
          }),
        ];
      }
    }
  }
  return flags;
}

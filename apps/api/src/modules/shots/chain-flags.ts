import type { ContinuityFlag, ContinuityState, ShotSpec } from '@filmzy/contracts';

/**
 * R1 e R2 (architettura §8): la continuità fra un'inquadratura e la successiva, calcolata dal piano
 * stesso. Sono funzioni pure, così si provano a parte: i dati li legge `ShotsService`.
 */

/** I nomi con cui si parla all'utente di personaggi e luoghi (l'id non gli dice niente). */
export interface Names {
  characters: Readonly<Record<string, string>>;
  locations: Readonly<Record<string, string>>;
}

/** Come finiva la scena pensata subito prima, e quando è stata pensata (ms): serve a R2. */
export interface PreviousScene {
  exit: ContinuityState;
  plannedAt: number;
}

export interface ChainInput {
  /** Le inquadrature di una scena, in qualunque ordine. */
  shots: readonly ShotSpec[];
  /** Quando è stato pensato il piano di questa scena (ms). */
  plannedAt: number;
  before: PreviousScene | undefined;
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
 * Il testo libero lo scrive un modello, e non lo ripete sempre uguale: due testi dicono la stessa cosa se
 * le parole di uno stanno tutte nell'altro, senza badare a maiuscole, accenti, punteggiatura e
 * articoli («sera», «Sera.» e «tarda sera»; «giacca blu» e «giacca blu scura»), ma «sera» e «notte», o
 * «giacca blu» e «giacca rossa», no.
 */
const sameText = (a: string, b: string): boolean => {
  const first = wordsOf(a);
  const second = wordsOf(b);
  if (first.size === 0 || second.size === 0) return plain(a) === plain(b);
  const [fewer, more] = first.size <= second.size ? [first, second] : [second, first];
  return [...fewer].every((word) => more.has(word));
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

const flag = (code: 'R1' | 'R2', reason: string): ContinuityFlag => ({
  code,
  reason,
  origin: 'rule',
  light: false,
});

/**
 * R1: nella stessa scena l'entrata di un'inquadratura combacia con l'uscita della precedente, salvo un
 * cambiamento dichiarato (`continuity.change`).
 *
 * R2: se la scena prima è stata pensata di nuovo **dopo** questa, la sua uscita può essere cambiata: la
 * prima inquadratura di questa scena, che ne dipende, diventa gialla se ora non combacia più. Tra due
 * scene può passare del tempo, quindi senza questo cambiamento una differenza non è un errore. Il giallo
 * passa da solo quando si rifà il piano della scena.
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
          flag(
            'R1',
            `Questa inquadratura comincia in modo diverso da come finisce quella prima: ${differences.join('; ')}. Se non è voluto, rifai il piano della scena.`,
          ),
        ];
      }
    } else if (input.before !== undefined && input.before.plannedAt > input.plannedAt) {
      const differences = continuityDifferences(
        input.before.exit,
        shot.continuity.entry,
        input.names,
      );
      if (differences.length > 0) {
        flags[shot.id] = [
          flag(
            'R2',
            `La scena prima è stata pensata di nuovo dopo questa e ora finisce in modo diverso da come questa comincia: ${differences.join('; ')}. Rifai il piano di questa scena per tenerle allineate.`,
          ),
        ];
      }
    }
  }
  return flags;
}

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

/**
 * Il testo libero lo scrive un modello: «Sera», «sera.» e «di sera» non si distinguono a occhio, quindi
 * si confrontano senza badare a maiuscole, accenti e punteggiatura (ma «di sera» e «notte» sì).
 */
const plain = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

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
  if (plain(from.timeOfDay) !== plain(to.timeOfDay)) {
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
    if (before !== undefined && after !== undefined && plain(before) !== plain(after)) {
      differences.push(`${who(id)} cambia d'abito (da ${quoted(before)} a ${quoted(after)})`);
    }
  }

  const fromProps = new Map(from.props.map((prop) => [plain(prop), prop]));
  const toProps = new Map(to.props.map((prop) => [plain(prop), prop]));
  for (const [key, prop] of toProps) {
    if (!fromProps.has(key)) differences.push(`compare ${quoted(prop)}`);
  }
  for (const [key, prop] of fromProps) {
    if (!toProps.has(key)) differences.push(`sparisce ${quoted(prop)}`);
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

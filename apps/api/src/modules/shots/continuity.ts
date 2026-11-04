import type { ContinuityFlag, ShotSpec } from '@filmzy/contracts';

/**
 * Le segnalazioni di continuità che si possono calcolare dai dati del film (architettura §8). Oggi
 * ci sono R6 (T4.9, D21) e R9 (T4.10, D37); R1 e R2 stanno in `chain-flags.ts`. Sono funzioni pure, così
 * si provano a parte: i dati li leggono i servizi.
 */

/** Cosa vede l'utente quando un luogo è cambiato dopo che l'inquadratura era stata fatta (R6). */
export const LOCATION_CHANGED_REASON =
  'Il luogo è cambiato dopo che hai fatto questa inquadratura. Rifai lo storyboard e il video per tenerla allineata.';

/**
 * Quando un'inquadratura è allineata al suo luogo: il lavoro **più vecchio** fra immagini e video che ha.
 * Rifare solo il video non basta se lo storyboard è ancora quello di prima (e viceversa): il giallo
 * passa quando tutto ciò che c'è è stato rifatto. Senza nessun lavoro non c'è niente da allineare.
 */
export function oldestWork(
  drawnAt: Readonly<Record<string, number>>,
  takeAt: Readonly<Record<string, number>>,
): Record<string, number> {
  const oldest: Record<string, number> = {};
  for (const shotId of new Set([...Object.keys(drawnAt), ...Object.keys(takeAt)])) {
    oldest[shotId] = Math.min(drawnAt[shotId] ?? Infinity, takeAt[shotId] ?? Infinity);
  }
  return oldest;
}

/** Cosa vede l'utente quando palette o consigli del moodboard sono cambiati dopo il video (R9, avviso leggero). */
export const MOODBOARD_CHANGED_REASON =
  'La palette o i consigli del moodboard sono cambiati dopo che hai girato questo video. Se vuoi che ne tengano conto, rigiralo.';

export interface MoodboardChangeInput {
  shots: readonly ShotSpec[];
  /** Quando sono cambiati palette e consigli del film e di ogni scena che ha una parte sua (ms). */
  changes: { film?: number | undefined; scenes: Readonly<Record<string, number>> };
  /** Quando è arrivato l'ultimo take riuscito di ogni inquadratura (ms). */
  takeAt: Readonly<Record<string, number>>;
}

/**
 * R9: se cambiano la palette o i consigli del moodboard, del film o della scena, i take girati prima
 * ricevono un avviso **leggero** (D37). Conta il cambiamento più recente fra quello del film e quello
 * della scena dell'inquadratura; un'inquadratura senza take non ha niente da rigirare, e un take rifatto
 * dopo il cambiamento è allineato — l'avviso passa da solo.
 */
export function moodboardChangeFlags(
  input: MoodboardChangeInput,
): Record<string, ContinuityFlag[]> {
  const flags: Record<string, ContinuityFlag[]> = {};
  for (const shot of input.shots) {
    const changed = Math.max(input.changes.film ?? 0, input.changes.scenes[shot.sceneId] ?? 0);
    const shot_take = input.takeAt[shot.id];
    if (changed === 0 || shot_take === undefined || shot_take >= changed) continue;
    flags[shot.id] = [
      { code: 'R9', reason: MOODBOARD_CHANGED_REASON, origin: 'rule', light: true },
    ];
  }
  return flags;
}

/** Unisce i gialli di più regole: ogni inquadratura li ha tutti, nell'ordine dato. */
export function mergeFlags(
  ...parts: readonly Record<string, ContinuityFlag[]>[]
): Record<string, ContinuityFlag[]> {
  const merged: Record<string, ContinuityFlag[]> = {};
  for (const part of parts) {
    for (const [shotId, flags] of Object.entries(part)) {
      merged[shotId] = [...(merged[shotId] ?? []), ...flags];
    }
  }
  return merged;
}

export interface LocationChangeInput {
  /** Le inquadrature di cui si chiedono le segnalazioni. */
  shots: readonly ShotSpec[];
  /** Quando è cambiato il riferimento di ogni luogo che l'ha cambiato (ms). */
  changedAt: Readonly<Record<string, number>>;
  /** Quando è arrivato il lavoro riuscito più vecchio di ogni inquadratura (ms), da `oldestWork`. */
  workedAt: Readonly<Record<string, number>>;
}

/**
 * R6: un luogo ritoccato o cambiato fa ingiallire le inquadrature che lo usano (D21). Un'inquadratura
 * ha il giallo solo se ha già un lavoro riuscito **prima** del cambiamento: una mai fatta non ha niente
 * da rifare, e una rifatta dopo il cambiamento è di nuovo allineata — il giallo passa da solo.
 */
export function locationChangeFlags(input: LocationChangeInput): Record<string, ContinuityFlag[]> {
  const flags: Record<string, ContinuityFlag[]> = {};
  for (const shot of input.shots) {
    const changed = input.changedAt[shot.location.locationId];
    const worked = input.workedAt[shot.id];
    if (changed === undefined || worked === undefined || worked >= changed) continue;
    flags[shot.id] = [
      { code: 'R6', reason: LOCATION_CHANGED_REASON, origin: 'rule', light: false },
    ];
  }
  return flags;
}

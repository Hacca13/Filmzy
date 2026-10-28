import type { Screenplay, ScreenplayScene, ScreenplayVersionSummary } from '@filmzy/contracts';

import { formatDuration } from '../model';

/**
 * Le piccole decisioni della schermata «La storia» (T3.4), fuori dai componenti così si provano a
 * parte. Cosa c'è nella bozza lo dice il server; qui si dice solo come mostrarlo.
 */

/** «Versione 2», e «la più recente» per l'ultima. */
export function versionLabel(version: ScreenplayVersionSummary, newest: boolean): string {
  return `Versione ${String(version.version)}${newest ? ' · la più recente' : ''}`;
}

/** Cosa ha prodotto una versione: la richiesta dell'utente, o «bozza iniziale» / «riscritta da zero». */
export function versionNote(version: ScreenplayVersionSummary): string {
  if (version.request !== undefined) return `«${version.request}»`;
  return version.version === 1 ? 'Bozza iniziale' : 'Riscritta da zero';
}

/** «15 s · tramonto»: durata e momento della giornata di una scena. */
export function sceneMeta(scene: ScreenplayScene): string {
  return `${formatDuration(Math.round(scene.durationS))} · ${scene.timeOfDay}`;
}

/** Quanto dura la storia in tutto, sommando le scene: «1 min 5 s». */
export function totalDuration(screenplay: Screenplay): string {
  const total = screenplay.scenes.reduce((sum, scene) => sum + scene.durationS, 0);
  return formatDuration(Math.round(total));
}

/** Il nome di un personaggio o di un luogo citato da una scena, se la bozza lo propone. */
export function namesOf(
  ids: readonly string[],
  proposals: readonly { id: string; name: string }[],
) {
  return ids.flatMap((id) => proposals.find((proposal) => proposal.id === id)?.name ?? []);
}

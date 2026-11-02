import type { Cast, CharacterAppearance, CharacterProfile, ProjectChoice } from '@filmzy/contracts';

/**
 * Le piccole decisioni della schermata «I personaggi» (T3.5), fuori dai componenti così si provano
 * a parte. Quanti se ne possono avere lo dice il server; qui si dice solo come mostrarlo.
 */

/** Il nome di un ruolo, se l'elenco c'è e il ruolo pure: mai l'id tecnico (regola 12). */
export function tagLabel(tags: readonly ProjectChoice[], id: string): string | undefined {
  return tags.find((tag) => tag.id === id)?.label;
}

/** Quanti personaggi si possono ancora aggiungere. */
export function slotsLeft(cast: Pick<Cast, 'characters' | 'maxCharacters'>): number {
  return Math.max(0, cast.maxCharacters - cast.characters.length);
}

/** Da 1 al numero di posti liberi: le quantità che si possono chiedere al casting. */
export function countOptions(slots: number): number[] {
  return Array.from({ length: slots }, (_, index) => index + 1);
}

/** «35 anni · snella · capelli castani, corti · giacca di jeans»: l'aspetto in una riga. */
export function appearanceSummary(appearance: CharacterAppearance): string {
  return [
    appearance.apparentAge,
    appearance.build,
    appearance.hair,
    appearance.face,
    appearance.clothing,
    appearance.distinctive,
  ]
    .filter((part): part is string => part !== undefined && part.trim() !== '')
    .join(' · ');
}

/** I dettagli facoltativi mentre si scrivono: ogni campo vuoto è un campo che non c'è. */
export interface ProfileDraft {
  personality: string;
  behavior: string;
  goal: string;
}

export function profileDraftOf(profile: CharacterProfile | undefined): ProfileDraft {
  return {
    personality: profile?.personality ?? '',
    behavior: profile?.behavior ?? '',
    goal: profile?.goal ?? '',
  };
}

/** Quello che si manda al server: solo i dettagli scritti davvero, senza spazi attorno. */
export function toProfile(draft: ProfileDraft): CharacterProfile {
  const personality = draft.personality.trim();
  const behavior = draft.behavior.trim();
  const goal = draft.goal.trim();
  return {
    ...(personality === '' ? {} : { personality }),
    ...(behavior === '' ? {} : { behavior }),
    ...(goal === '' ? {} : { goal }),
  };
}

/** Le due bozze dei dettagli dicono la stessa cosa? Serve a tenere spento «Salva» se non è cambiato niente. */
export function sameProfile(a: ProfileDraft, b: ProfileDraft): boolean {
  const left = toProfile(a);
  const right = toProfile(b);
  return (
    left.personality === right.personality &&
    left.behavior === right.behavior &&
    left.goal === right.goal
  );
}

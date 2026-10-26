import type { InstructionVersionInfo, RoleInstructions } from '@filmzy/contracts';

/**
 * Le piccole decisioni della pagina Istruzioni, fuori dai componenti così si provano senza
 * disegnare niente. Decide il server cosa gira; qui si decide solo cosa dire all'utente.
 */

/**
 * La versione nuova da proporre (D38): c'è se il programma ne consiglia una più recente di quella
 * in uso. Chi non ha mai scelto segue già la consigliata e non vede niente; chi è rimasto su una
 * vecchia (scelta sua, o fissata dalla release) vede cosa è cambiato e decide se provarla.
 */
export function newerVersionNotice(role: RoleInstructions): InstructionVersionInfo | undefined {
  if (role.inUse >= role.recommended) return undefined;
  return role.versions.find((version) => version.version === role.recommended);
}

export interface VersionBadge {
  text: string;
  tone: 'accent' | 'plain';
}

export function badgesOf(role: RoleInstructions, version: InstructionVersionInfo): VersionBadge[] {
  return [
    ...(version.version === role.inUse ? [{ text: 'In uso', tone: 'accent' as const }] : []),
    ...(version.version === role.recommended
      ? [{ text: 'Consigliata', tone: 'plain' as const }]
      : []),
    ...(version.origin === 'user' ? [{ text: 'Tua', tone: 'plain' as const }] : []),
  ];
}

/** Il nome di una sezione per chi non programma: `system` e `user` sono dettagli tecnici. */
const SECTION_TITLES: Record<string, string> = {
  system: 'Istruzioni di base',
  user: 'Richiesta',
  prompt: 'Testo',
};

export function sectionTitle(name: string): string {
  return SECTION_TITLES[name] ?? name;
}

/** Cambiare le istruzioni del moderatore indebolisce un'impostazione prudente (§10, D19). */
export const MODERATOR_WARNING =
  'Se cambi le istruzioni del moderatore te ne assumi la responsabilità.';

export function needsModeratorWarning(role: RoleInstructions, editing: boolean): boolean {
  const usesOwn = role.versions.some(
    (version) => version.version === role.inUse && version.origin === 'user',
  );
  return role.roleId === 'moderator' && (editing || usesOwn);
}

/** Il nome del file da scaricare come modello: niente caratteri strani, estensione `.md`. */
export function templateFileName(roleId: string): string {
  return `modello-${roleId.replace(/[^a-z0-9_-]/g, '')}.md`;
}

/** Sostituisce un ruolo nella panoramica, tenendo l'ordine degli altri. */
export function withRole<T extends { roles: RoleInstructions[] }>(
  overview: T,
  updated: RoleInstructions,
): T {
  return {
    ...overview,
    roles: overview.roles.map((role) => (role.roleId === updated.roleId ? updated : role)),
  };
}

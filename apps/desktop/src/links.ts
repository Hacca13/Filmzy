/** Dove va un indirizzo: nella finestra, nel browser del sistema, o da nessuna parte. */
export type LinkTarget = 'app' | 'browser' | 'blocked';

const EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

/**
 * Nella finestra resta solo il programma (il server locale). Un link verso fuori, come «Come ottengo la
 * chiave?», si apre nel browser del sistema, dove l'utente ha i suoi accessi; qualunque altro schema
 * (`file:`, `javascript:`…) non si apre.
 */
export function linkTarget(url: string, appBase: string): LinkTarget {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'blocked';
  }
  if (parsed.origin === new URL(appBase).origin) return 'app';
  return EXTERNAL_PROTOCOLS.has(parsed.protocol) ? 'browser' : 'blocked';
}

/**
 * Le piccole decisioni sui file esportati, fuori dal servizio così si provano a parte.
 */

/** Caratteri che Windows non accetta in un nome, più i caratteri di controllo. */
// eslint-disable-next-line no-control-regex -- togliere i caratteri di controllo è proprio ciò che serve qui.
const FORBIDDEN_IN_NAME = /[<>:"/\\|?*\u0000-\u001f]/g;

/** Nomi che Windows riserva ai dispositivi: un film che si chiama «Con» non si potrebbe salvare. */
const RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/** Un titolo può essere lungo, e il percorso intero ha un limite: si tiene quanto basta a riconoscerlo. */
const MAX_TITLE_CHARS = 80;

const FALLBACK_TITLE = 'Film';

/**
 * Il nome del file finale: «L'ultima corsa - 1080p.mp4». Viene dal titolo, che scrive l'utente: non deve
 * poter uscire dalla cartella né dare un nome che il sistema rifiuta (CLAUDE.md, «Sicuro»). Ogni qualità
 * ha il suo file: esportare di nuovo alla stessa qualità sostituisce quello di prima.
 */
export function exportFileName(title: string, shortSide: number): string {
  const cleaned = title
    .replace(FORBIDDEN_IN_NAME, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_TITLE_CHARS)
    // Windows toglie da solo punti e spazi in fondo: il nome salvato non sarebbe più quello scritto qui.
    .replace(/[.\s]+$/, '')
    .replace(/^[.\s]+/, '');
  const usable = cleaned === '' || RESERVED_NAME.test(cleaned) ? FALLBACK_TITLE : cleaned;
  return `${usable} - ${String(shortSide)}p.mp4`;
}

/**
 * Le qualità che si possono chiedere per un film di queste misure: la sua, e quelle standard più basse.
 * La prima è la più alta.
 */
export function qualitiesFor(
  size: { width: number; height: number },
  standard: readonly number[],
): number[] {
  const own = Math.min(size.width, size.height);
  return [own, ...standard.filter((shortSide) => shortSide < own)];
}

/** I codici di errore del file system che hanno una frase propria: il resto resta `unknown`. */
const FILE_ERRORS: Readonly<Record<string, string>> = {
  ENOSPC: 'disk_full',
  EPERM: 'file_in_use',
  EBUSY: 'file_in_use',
  EACCES: 'file_in_use',
};

/** Il motivo di un errore del file system, per l'interfaccia. */
export function fileErrorCode(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return (code === undefined ? undefined : FILE_ERRORS[code]) ?? 'unknown';
}

/** Il comando che apre una cartella in ogni sistema, con gli argomenti a parte (CLAUDE.md, «Sicuro»). */
export function openFolderCommand(platform: NodeJS.Platform, folder: string): [string, string] {
  if (platform === 'win32') return ['explorer.exe', folder];
  if (platform === 'darwin') return ['open', folder];
  return ['xdg-open', folder];
}

import { rename } from 'node:fs/promises';

const FILE_BUSY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);

/** Quante volte provare, e quanto aspettare fra una e l'altra: in tutto meno di due secondi. */
const MOVE_ATTEMPTS = 6;
const MOVE_WAIT_MS = 300;

/**
 * Mette un file appena scritto al suo posto, sostituendo quello che c'è. Su Windows un file nuovo può restare
 * occupato per un attimo (antivirus, indicizzazione): senza riprovare l'utente leggerebbe un errore che
 * sparisce da solo. Se dopo i tentativi è ancora occupato, allora lo è davvero.
 */
export async function moveIntoPlace(
  from: string,
  to: string,
  { move = rename, waitMs = MOVE_WAIT_MS }: { move?: typeof rename; waitMs?: number } = {},
): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await move(from, to);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException | undefined)?.code;
      if (attempt >= MOVE_ATTEMPTS || code === undefined || !FILE_BUSY_CODES.has(code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

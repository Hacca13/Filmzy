import { spawn } from 'node:child_process';
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

import { MediaError } from '@filmzy/media';
import { ProviderError } from '@filmzy/troupe';

/**
 * Le piccole decisioni sui file del montaggio e dell'esportazione, fuori dai servizi così si provano a parte.
 */

/** Caratteri che i sistemi non accettano in un nome, più i caratteri di controllo. */
// eslint-disable-next-line no-control-regex -- togliere i caratteri di controllo è proprio ciò che serve qui.
const FORBIDDEN_IN_NAME = /[<>:"/\\|?*\u0000-\u001f]/g;

const FALLBACK_TITLE = 'Film';

/**
 * Il nome del file finale: «L'ultima corsa - 1080p.mp4». Viene dal titolo, che scrive l'utente: non deve
 * poter uscire dalla cartella né dare un nome che il sistema rifiuta (CLAUDE.md, «Sicuro»). Un punto davanti
 * nasconderebbe il file su Linux e macOS. Il titolo ha già un limite di lunghezza (`TITLE_MAX_LENGTH`).
 */
export function exportFileName(title: string, shortSide: number): string {
  const cleaned = title
    .replace(FORBIDDEN_IN_NAME, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+/, '')
    .trim();
  return `${cleaned === '' ? FALLBACK_TITLE : cleaned} - ${String(shortSide)}p.mp4`;
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

/**
 * Il motivo di un errore del file system, per l'interfaccia. `replacing` dice che si stava mettendo il file
 * al suo posto: su Windows, sostituire un file aperto in un altro programma dà un errore di permessi.
 */
export function fileErrorCode(error: unknown, replacing = false): string {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  if (code === 'ENOSPC') return 'disk_full';
  if (code === 'EBUSY') return 'file_in_use';
  if (code === 'EPERM' || code === 'EACCES') return replacing ? 'file_in_use' : 'no_permission';
  return 'unknown';
}

/** Per il registro: il motivo, senza il percorso dei dati, che porta il nome dell'utente. */
export function failureReason(error: unknown, dataDir: string): string {
  if (error instanceof MediaError || error instanceof ProviderError) {
    return `${error.code}: ${error.message.replaceAll(dataDir, '<dati>')}`;
  }
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === undefined ? 'unknown' : `unknown (${code})`;
}

/** Toglie da una cartella ciò che va tolto. Quello che non si riesce a togliere resta, senza fermare il lavoro. */
export async function removeEntries(
  folder: string,
  shouldGo: (name: string) => boolean,
): Promise<void> {
  const names = await readdir(folder).catch((): string[] => []);
  await Promise.all(
    names.filter(shouldGo).map((name) =>
      rm(path.join(folder, name), { recursive: true, force: true }).catch(() => {
        // Un lettore o un ffmpeg sopravvissuto lo tiene aperto: resta fino al prossimo giro.
      }),
    ),
  );
}

/** Il comando che apre una cartella in ogni sistema, con il percorso a parte (CLAUDE.md, «Sicuro»). */
export function openFolderCommand(platform: NodeJS.Platform, folder: string): [string, string] {
  if (platform === 'win32') return ['explorer.exe', folder];
  if (platform === 'darwin') return ['open', folder];
  return ['xdg-open', folder];
}

/** Dopo quanto un programma ancora acceso vuol dire che ha funzionato: alcuni restano finché si chiude la finestra. */
const LAUNCH_WAIT_MS = 3000;

/**
 * Lancia un programma del sistema senza aspettare che si chiuda. `ignoreExitCode` serve a chi esce con un
 * errore anche quando va bene; agli altri, un'uscita con errore vuol dire che non ha aperto niente.
 */
export function launch(
  command: string,
  args: readonly string[],
  { ignoreExitCode }: { ignoreExitCode: boolean },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.unref();
    child.once('error', reject);
    if (ignoreExitCode) {
      child.once('spawn', () => {
        resolve();
      });
      return;
    }
    const stillOpen = setTimeout(resolve, LAUNCH_WAIT_MS);
    stillOpen.unref();
    child.once('error', () => {
      clearTimeout(stillOpen);
    });
    child.once('exit', (code) => {
      clearTimeout(stillOpen);
      if (code === 0) resolve();
      else reject(new Error(`Il comando è uscito con il codice ${String(code)}.`));
    });
  });
}

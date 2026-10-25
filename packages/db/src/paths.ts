import { homedir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

/**
 * Dove stanno i dati dell'utente (architettura §6.1): **fuori** dalla cartella del programma, così
 * un aggiornamento sostituisce solo il programma e ritrova tutto dov'era (D44).
 *
 * Nel programma impacchettato la cartella la dà il sistema operativo (`app.getPath('userData')`
 * di Electron, M6) e arriva qui già scelta. Fuori da Electron — sviluppo, test, riga di comando —
 * si calcola con le convenzioni di ogni sistema, e `FILMZY_DATA_DIR` vince su tutto.
 */
export const APP_DIR_NAME = 'Filmzy';

export interface DataDirOptions {
  env?: Record<string, string | undefined>;
  platform?: NodeJS.Platform;
}

export function resolveDataDir(options: DataDirOptions = {}): string {
  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;

  const chosen = nonEmpty(env.FILMZY_DATA_DIR);
  if (chosen !== undefined) return path.resolve(chosen);

  if (platform === 'win32') {
    const roaming = nonEmpty(env.APPDATA) ?? path.join(homedir(), 'AppData', 'Roaming');
    return path.join(roaming, APP_DIR_NAME);
  }

  if (platform === 'darwin') {
    return path.join(homedir(), 'Library', 'Application Support', APP_DIR_NAME);
  }

  // Linux e il resto: lo standard XDG, che vuole il nome in minuscolo.
  const share = nonEmpty(env.XDG_DATA_HOME) ?? path.join(homedir(), '.local', 'share');
  return path.join(share, APP_DIR_NAME.toLowerCase());
}

/** Il file del database. Accanto ci stanno i file WAL di SQLite e le copie di sicurezza. */
export function databaseFile(dataDir: string): string {
  return path.join(dataDir, 'filmzy.db');
}

/**
 * Il file delle chiavi dei fornitori, cifrate. Sta **fuori dal database** (D45): una copia del
 * database gira (copie di sicurezza, diagnostica) e le chiavi non devono uscire con lei.
 */
export function secretsFile(dataDir: string): string {
  return path.join(dataDir, 'chiavi.dat');
}

/** La cartella dei film: immagini, take, audio ed esportazioni. Si può spostare (§6.1). */
export function projectsDir(dataDir: string): string {
  return path.join(dataDir, 'progetti');
}

/** La cartella del registro degli eventi (§11). */
export function logDir(dataDir: string): string {
  return path.join(dataDir, 'log');
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}

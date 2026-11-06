import { appendFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import type { LoggerService } from '@nestjs/common';

export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

export interface FileLog {
  /** La cartella del registro: la si mostra all'utente quando qualcosa si rompe. */
  folder: string;
  write: (level: LogLevel, context: string, message: string) => void;
}

interface FileLogOptions {
  folder: string;
  now?: () => Date;
  home?: string;
  /** Anche sullo schermo, per chi lancia il programma dal terminale. */
  echo?: boolean;
  keepDays?: number;
}

const FILE_NAME = /^filmzy-(\d{4}-\d{2}-\d{2})\.log$/;
/** Le righe di Nest che elencano moduli e rotte a ogni avvio: centinaia, e non dicono niente su un guasto. */
const NEST_CHATTER = new Set(['InstanceLoader', 'RoutesResolver', 'RouterExplorer']);
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Il registro del programma (T6.4, architettura §6.1): un file al giorno in `<cartella dati>/log`, per capire
 * cosa è successo quando qualcosa si rompe. La cartella dell'utente diventa `~`: chi manda il registro per
 * farsi aiutare non manda il suo nome. Le chiavi non ci arrivano: nessuno le scrive (D25).
 */
export function createFileLog(options: FileLogOptions): FileLog {
  const { folder, now = () => new Date(), home = homedir(), echo = false, keepDays = 14 } = options;
  mkdirSync(folder, { recursive: true });
  removeOldFiles(folder, now(), keepDays);

  return {
    folder,
    write(level, context, message) {
      const at = now();
      const line = `${at.toISOString()} ${level.toUpperCase()} [${context}] ${withoutHome(message, home)}\n`;
      if (echo) process.stdout.write(line);
      try {
        // Una riga alla volta e subito su disco: se il programma cade, l'ultima riga è quella che serve.
        appendFileSync(path.join(folder, `filmzy-${at.toISOString().slice(0, 10)}.log`), line);
      } catch {
        // Il registro non deve mai fermare il programma: un disco pieno si vedrà altrove.
      }
    },
  };
}

/** I file più vecchi di `keepDays` giorni: il registro non deve riempire il disco. */
function removeOldFiles(folder: string, today: Date, keepDays: number): void {
  for (const name of readdirSync(folder)) {
    const day = FILE_NAME.exec(name)?.[1];
    if (day === undefined) continue;
    if (today.getTime() - new Date(day).getTime() > keepDays * DAY_MS) {
      rmSync(path.join(folder, name), { force: true });
    }
  }
}

/** Il percorso della cartella dell'utente, scritto con una barra o con l'altra, diventa `~`. */
export function withoutHome(message: string, home: string): string {
  if (home === '') return message;
  const forms = new Set([home, home.replaceAll('\\', '/'), home.replaceAll('/', '\\')]);
  let clean = message;
  for (const form of forms) clean = clean.replace(new RegExp(escapeRegExp(form), 'gi'), '~');
  return clean;
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Un errore con il suo stack, che dice dove è successo; qualunque altra cosa, com'è. */
export function describeFailure(failure: unknown): string {
  if (failure instanceof Error) return failure.stack ?? `${failure.name}: ${failure.message}`;
  return typeof failure === 'string' ? failure : JSON.stringify(failure);
}

/** Il registro di Nest finisce nello stesso file: i messaggi del server sono quelli che servono di più. */
export function nestLogger(log: FileLog): LoggerService {
  const text = (message: unknown) =>
    typeof message === 'string' ? message : describeFailure(message);
  // Nest passa il contesto come ultimo argomento, e lo stack, quando c'è, prima di lui.
  const split = (rest: unknown[]) => {
    const context = typeof rest.at(-1) === 'string' ? (rest.at(-1) as string) : 'Server';
    return { context, extra: rest.slice(0, -1).map(text).join('\n') };
  };
  const writer =
    (level: LogLevel) =>
    (message: unknown, ...rest: unknown[]) => {
      const { context, extra } = split(rest);
      if (level === 'info' && NEST_CHATTER.has(context)) return;
      log.write(level, context, extra === '' ? text(message) : `${text(message)}\n${extra}`);
    };
  return {
    log: writer('info'),
    warn: writer('warn'),
    error: writer('error'),
    fatal: writer('fatal'),
    // I dettagli di Nest servono a chi sviluppa, non a capire un guasto: restano fuori dal file.
    debug: () => undefined,
    verbose: () => undefined,
  };
}

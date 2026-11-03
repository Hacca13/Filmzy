import { execFile, type ExecFileException } from 'node:child_process';
import { stat } from 'node:fs/promises';

import installer from '@ffmpeg-installer/ffmpeg';

/**
 * ffmpeg (architettura §2, §9): il montaggio non è un ruolo, è deterministico. Qui c'è il minimo che
 * serve oggi — un fotogramma da un video (T4.6) e la durata di un video — e si allarga con il mix e
 * l'esportazione (M5).
 *
 * Il programma si lancia **sempre con gli argomenti a parte**, mai con una riga di comando costruita
 * con testo (CLAUDE.md, «Sicuro»): un nome di file con spazi, virgolette o `;` non può diventare un
 * comando. Chi chiama controlla che i percorsi stiano nella cartella dei dati prima di darli qui.
 */

/** Cosa può andare storto, in codici che il server sa tradurre (regola: errori del dominio con il loro codice). */
export type MediaErrorCode =
  /** Il programma ffmpeg non c'è (o non parte): niente di ciò che dipende da lui funziona. */
  | 'ffmpeg_missing'
  /** ffmpeg è partito ma non è riuscito: il file non è un video, o è rovinato. */
  | 'ffmpeg_failed'
  /** Il momento chiesto non è un tempo valido (negativo, non un numero). */
  | 'invalid_time'
  /** Il momento chiesto è oltre la fine del video: non c'è nessun fotogramma. */
  | 'no_frame'
  /** ffmpeg ci ha messo troppo e si è fermato: un disco lento o un file enorme, si può riprovare. */
  | 'timeout';

export class MediaError extends Error {
  constructor(
    readonly code: MediaErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'MediaError';
  }
}

/** Quanto si aspetta ffmpeg per un fotogramma o per leggere un video (ms): bastano pochi secondi. */
const TIMEOUT_MS = 30_000;

/**
 * Dov'è ffmpeg. Di norma è quello che arriva con il programma (`@ffmpeg-installer/ffmpeg`, un file per
 * ogni sistema, senza script di installazione); `FILMZY_FFMPEG` lo sostituisce, per chi ne ha uno suo.
 */
export function ffmpegPath(env: NodeJS.ProcessEnv = process.env): string {
  const own = env['FILMZY_FFMPEG'];
  return own === undefined || own === '' ? installer.path : own;
}

interface Run {
  stdout: string;
  stderr: string;
}

/** Lancia ffmpeg con questi argomenti; un errore del sistema (non parte, troppo lento) diventa `MediaError`. */
function run(
  args: readonly string[],
  env: NodeJS.ProcessEnv,
  timeoutMs = TIMEOUT_MS,
): Promise<Run & { code: number }> {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath(env),
      [...args],
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (error: ExecFileException | null, stdout: string, stderr: string) => {
        if (error === null) {
          resolve({ stdout, stderr, code: 0 });
          return;
        }
        if (error.code === 'ENOENT' || error.code === 'EACCES') {
          reject(
            new MediaError('ffmpeg_missing', 'Il programma ffmpeg non si trova o non parte.', {
              cause: error,
            }),
          );
          return;
        }
        // Fermato perché troppo lento: non è un video rovinato, e riprovare può bastare.
        if (error.killed === true) {
          reject(
            new MediaError('timeout', 'ffmpeg ci ha messo troppo e si è fermato.', {
              cause: error,
            }),
          );
          return;
        }
        // Un'uscita con un numero diverso da zero: ffmpeg ha detto la sua nell'errore standard.
        resolve({ stdout, stderr, code: typeof error.code === 'number' ? error.code : 1 });
      },
    );
  });
}

/** Le ultime righe di ciò che ffmpeg ha detto: bastano a capire, senza riempire il registro. */
const tail = (text: string): string => text.trim().split('\n').slice(-3).join(' | ');

/**
 * La durata di un video, in secondi. ffmpeg la scrive leggendo il file (`Duration: 00:00:05.04`),
 * anche se poi si ferma perché non gli è stato chiesto altro. Alcuni formati non la dicono
 * (`Duration: N/A`): il video si legge lo stesso, e la durata è `undefined`.
 */
export async function videoDurationS(
  input: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<number | undefined> {
  const { stderr } = await run(['-hide_banner', '-i', input], env);
  const found = /Duration:\s*(?:(\d+):(\d{2}):(\d{2}(?:\.\d+)?)|N\/A)/.exec(stderr);
  if (found === null) {
    throw new MediaError('ffmpeg_failed', `Non riesco a leggere la durata: ${tail(stderr)}`);
  }
  const [, hours, minutes, seconds] = found;
  if (hours === undefined || minutes === undefined || seconds === undefined) return undefined;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

export interface ShrinkImageOptions {
  input: string;
  /** Dove si scrive la copia ridotta (JPEG). */
  output: string;
  /** Il lato più lungo al massimo, in pixel: mai si ingrandisce. */
  maxSidePx: number;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

/**
 * Una copia più piccola di un'immagine (JPEG), per farla leggere a un servizio che ha dei limiti di
 * peso: l'originale non si tocca. Un'immagine già piccola resta delle sue dimensioni. Come per i
 * fotogrammi, si controlla che il file ci sia davvero invece di fidarsi dell'uscita.
 */
export async function shrinkImage(options: ShrinkImageOptions): Promise<void> {
  const { input, output, maxSidePx, env = process.env, timeoutMs } = options;
  if (!Number.isInteger(maxSidePx) || maxSidePx < 16) {
    throw new MediaError('invalid_time', 'La dimensione richiesta non è valida.');
  }

  const side = String(maxSidePx);
  const { code, stderr } = await run(
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      input,
      // Dentro un quadrato di lato `maxSidePx` ma mai oltre l'immagine stessa: niente ingrandimenti.
      '-vf',
      `scale=w='min(${side},iw)':h='min(${side},ih)':force_original_aspect_ratio=decrease`,
      '-frames:v',
      '1',
      '-q:v',
      '3',
      '-y',
      output,
    ],
    env,
    timeoutMs,
  );
  if (code !== 0) {
    throw new MediaError('ffmpeg_failed', `ffmpeg non è riuscito: ${tail(stderr)}`);
  }

  const written = await stat(output).catch(() => undefined);
  if (written === undefined || written.size === 0) {
    throw new MediaError('ffmpeg_failed', "L'immagine non si è potuta ridurre.");
  }
}

export interface MarkAreaOptions {
  /** L'immagine da ritoccare. */
  image: string;
  /** La maschera (PNG): dove l'utente ha dipinto è opaco, il resto trasparente. */
  mask: string;
  /** Dove si scrive l'immagine con la zona evidenziata (PNG). */
  output: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

/**
 * Quanto è visibile la zona dipinta sull'immagine marcata (0–1): abbastanza da vederla bene, non così
 * piena da nascondere quello che c'è sotto — il servizio deve capire cosa c'è da ritoccare.
 */
const MARK_OPACITY = 0.6;

/**
 * Nessun servizio del catalogo accetta una maschera vera (`mask_edit`, architettura §4.3): la zona
 * dipinta si evidenzia **sull'immagine**, in magenta trasparente, e il servizio riceve questa. La
 * maschera si porta alla misura dell'immagine (il pennello lavora su una tela che può avere un'altra
 * risoluzione). Il colore lo decide il codice, non la maschera: qualunque colore abbia il pennello, la
 * zona si vede sempre uguale.
 */
export async function markArea(options: MarkAreaOptions): Promise<void> {
  const { image, mask, output, env = process.env, timeoutMs } = options;
  const { code, stderr } = await run(
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      image,
      '-i',
      mask,
      '-filter_complex',
      `[1:v]format=rgba,lutrgb=r=255:g=0:b=255,colorchannelmixer=aa=${String(MARK_OPACITY)}[tint];` +
        '[tint][0:v]scale2ref=w=iw:h=ih[m][b];[b][m]overlay=format=auto',
      '-frames:v',
      '1',
      '-y',
      output,
    ],
    env,
    timeoutMs,
  );
  if (code !== 0) {
    throw new MediaError('ffmpeg_failed', `ffmpeg non è riuscito: ${tail(stderr)}`);
  }

  const written = await stat(output).catch(() => undefined);
  if (written === undefined || written.size === 0) {
    throw new MediaError('ffmpeg_failed', 'La zona non si è potuta evidenziare.');
  }
}

/**
 * La maschera ha almeno un punto dipinto? Una maschera vuota non dice cosa ritoccare: il servizio non
 * cambierebbe niente e si spenderebbe per niente. Lo dice il canale trasparente, letto da ffmpeg.
 */
export async function maskHasPaint(
  mask: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const { code, stdout, stderr } = await run(
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      mask,
      '-vf',
      'format=rgba,alphaextract,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-',
      '-f',
      'null',
      '-',
    ],
    env,
  );
  const highest = /lavfi\.signalstats\.YMAX=(\d+(?:\.\d+)?)/.exec(stdout);
  if (code !== 0 || highest === null) {
    throw new MediaError('ffmpeg_failed', `Non riesco a leggere la maschera: ${tail(stderr)}`);
  }
  return Number(highest[1]) > 0;
}

export interface ExtractFrameOptions {
  /** Il video. Il percorso lo controlla chi chiama (deve stare nella cartella dei dati). */
  input: string;
  /** Il momento, in secondi dall'inizio. */
  atS: number;
  /** Dove si scrive l'immagine (PNG). Se c'era già, si sostituisce. */
  output: string;
  env?: NodeJS.ProcessEnv;
  /** Quanto aspettare ffmpeg (ms): di norma bastano pochi secondi. */
  timeoutMs?: number;
}

/**
 * Salva in un file PNG il fotogramma del video al secondo dato. Un momento oltre la fine non dà
 * nessun fotogramma: ffmpeg esce senza errori e senza scrivere niente, quindi si controlla che il file
 * ci sia davvero (`no_frame`), invece di fidarsi dell'uscita.
 */
export async function extractFrame(options: ExtractFrameOptions): Promise<void> {
  const { input, atS, output, env = process.env, timeoutMs } = options;
  if (!Number.isFinite(atS) || atS < 0) {
    throw new MediaError('invalid_time', 'Il momento del fotogramma non è valido.');
  }

  const { code, stderr } = await run(
    [
      '-hide_banner',
      '-loglevel',
      'error',
      // Il salto prima dell'ingresso è veloce e basta: un fotogramma vicino al momento chiesto.
      '-ss',
      String(atS),
      '-i',
      input,
      '-frames:v',
      '1',
      '-y',
      output,
    ],
    env,
    timeoutMs,
  );
  if (code !== 0) {
    throw new MediaError('ffmpeg_failed', `ffmpeg non è riuscito: ${tail(stderr)}`);
  }

  const written = await stat(output).catch(() => undefined);
  if (written === undefined || written.size === 0) {
    throw new MediaError('no_frame', 'Il video non ha nessun fotogramma a quel momento.');
  }
}

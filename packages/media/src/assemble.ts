import { copyFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { MediaError, run, tail } from './ffmpeg.js';

/**
 * Il montaggio (T5.7, architettura §9): è deterministico, quindi non è un ruolo. Ogni clip si porta allo
 * stesso formato, così si può incollare senza ricodificare, e il suono si mixa a parte: cambiare una
 * musica non tocca i video. Testi e nomi di file non entrano mai nella riga dei filtri: chi scrive un
 * titolo con «:» o «'» non può cambiare cosa fa ffmpeg (CLAUDE.md, «Sicuro»).
 */

/** Quanto aspettare ffmpeg per un passo del montaggio (ms): ricodificare è lento, su un computer normale. */
const ASSEMBLY_TIMEOUT_MS = 20 * 60 * 1000;

const SAMPLE_RATE = 48_000;

/** Il suono vuoto che accompagna ciò che non ha audio: tutti i pezzi devono avere le stesse tracce. */
const SILENCE = `anullsrc=channel_layout=stereo:sample_rate=${String(SAMPLE_RATE)}`;

const VIDEO_CODEC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18'];
const AUDIO_CODEC = ['-c:a', 'aac', '-b:a', '192k', '-ar', String(SAMPLE_RATE), '-ac', '2'];

/** Il formato di tutto il film. */
export interface FilmFormat {
  width: number;
  height: number;
  fps: number;
}

interface StepOptions {
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

const require_ = createRequire(import.meta.url);

/** Il font dei titoli: viaggia col programma, perché quelli installati cambiano da un computer all'altro. */
export function titleFontPath(): string {
  return require_.resolve('dejavu-fonts-ttf/ttf/DejaVuSans.ttf');
}

/** Lancia un passo, e controlla che il file ci sia davvero: ffmpeg può uscire bene senza aver scritto niente. */
async function step(
  args: readonly string[],
  output: string,
  options: StepOptions & { cwd?: string } = {},
): Promise<void> {
  const { env = process.env, timeoutMs = ASSEMBLY_TIMEOUT_MS, cwd } = options;
  const { code, stderr } = await run(
    ['-hide_banner', '-loglevel', 'error', '-y', ...args, output],
    env,
    timeoutMs,
    cwd,
  );
  if (code !== 0) {
    throw new MediaError('ffmpeg_failed', `ffmpeg non è riuscito: ${tail(stderr)}`);
  }
  const written = await stat(cwd === undefined ? output : path.resolve(cwd, output)).catch(
    () => undefined,
  );
  if (written === undefined || written.size === 0) {
    throw new MediaError('ffmpeg_failed', 'ffmpeg non ha scritto il file.');
  }
}

/** Larghezza e altezza di un video, lette dal file; `undefined` se dentro non c'è un video. */
export async function videoSize(
  input: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ width: number; height: number } | undefined> {
  const { stderr } = await run(['-hide_banner', '-i', input], env);
  const found = /Stream #[^\n]*: Video:[^\n]*?\b(\d{2,5})x(\d{2,5})\b/.exec(stderr);
  if (found === null) return undefined;
  return { width: Number(found[1]), height: Number(found[2]) };
}

export interface NormalizeClipOptions extends StepOptions {
  input: string;
  output: string;
  format: FilmFormat;
  /** Tenere il suono della clip (D43). Se non lo tiene, o non ne ha, porta un silenzio. */
  keepAudio: boolean;
}

/**
 * Una clip nel formato del film: stessa misura (con le bande se serve, senza deformarla), stessi
 * fotogrammi al secondo e stesso codec. L'audio originale si toglie, salvo che l'utente l'abbia acceso.
 */
export async function normalizeClip(options: NormalizeClipOptions): Promise<void> {
  const { input, output, format, keepAudio } = options;
  const { width, height, fps } = format;
  const video = [
    `scale=${String(width)}:${String(height)}:force_original_aspect_ratio=decrease`,
    `pad=${String(width)}:${String(height)}:(ow-iw)/2:(oh-ih)/2`,
    'setsar=1',
    `fps=${String(fps)}`,
    'format=yuv420p',
  ].join(',');

  await step(
    [
      '-i',
      input,
      ...(keepAudio ? [] : ['-f', 'lavfi', '-i', SILENCE]),
      '-filter:v',
      video,
      '-map',
      '0:v:0',
      '-map',
      keepAudio ? '0:a:0' : '1:a:0',
      // Un suono più corto del video si allunga col silenzio: le tracce devono finire insieme.
      ...(keepAudio ? ['-filter:a', 'apad'] : []),
      '-shortest',
      ...VIDEO_CODEC,
      ...AUDIO_CODEC,
    ],
    output,
    options,
  );
}

export interface TitleLine {
  text: string;
  /** Quanto è alto il testo, rispetto all'altezza del film. */
  scale: number;
}

export interface TitleCardOptions extends StepOptions {
  /** Il nome del file, dentro `workDir`. */
  output: string;
  /** La cartella del montaggio: il font e i testi stanno lì, per non scrivere percorsi nella riga dei filtri. */
  workDir: string;
  format: FilmFormat;
  durationS: number;
  lines: readonly TitleLine[];
}

/** Va a capo sulle parole: `drawtext` non lo fa da solo. Una parola troppo lunga resta intera. */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current !== '' && current.length + 1 + word.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current === '' ? word : `${current} ${word}`;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/** Quanto spazio occupa una lettera, a occhio, rispetto alla sua altezza: per sapere quando andare a capo. */
const CHAR_WIDTH_RATIO = 0.62;
/** Un film non è mai un titolo a tutta larghezza: si lascia un margine. */
const TEXT_WIDTH_RATIO = 0.84;
const LINE_SPACING = 1.5;

/**
 * Un titolo su fondo nero, in silenzio, nel formato del film. Il testo sta in un file (`textfile`) con
 * `expansion=none`: un titolo scritto dall'utente resta testo, qualunque carattere contenga.
 */
export async function renderTitleCard(options: TitleCardOptions): Promise<void> {
  const { output, workDir, format, durationS, lines } = options;
  const { width, height, fps } = format;
  const font = 'titoli.ttf';
  await copyFile(titleFontPath(), path.join(workDir, font));

  const rows = lines.flatMap(({ text, scale }) => {
    const fontSize = Math.round(height * scale);
    const maxChars = Math.floor((width * TEXT_WIDTH_RATIO) / (fontSize * CHAR_WIDTH_RATIO));
    return wrapText(text, maxChars).map((row) => ({ row, fontSize }));
  });
  const total = rows.reduce((sum, { fontSize }) => sum + fontSize * LINE_SPACING, 0);

  const base = path.parse(output).name;
  let y = (height - total) / 2;
  const filters: string[] = [];
  for (const [index, { row, fontSize }] of rows.entries()) {
    const file = `${base}-riga-${String(index)}.txt`;
    await writeFile(path.join(workDir, file), row, 'utf8');
    filters.push(
      `drawtext=fontfile=${font}:textfile=${file}:expansion=none:fontcolor=white:fontsize=${String(fontSize)}:x=(w-text_w)/2:y=${String(Math.round(y))}`,
    );
    y += fontSize * LINE_SPACING;
  }
  const fade = Math.min(0.5, durationS / 4);
  filters.push(
    `fade=t=in:st=0:d=${String(fade)}`,
    `fade=t=out:st=${String(durationS - fade)}:d=${String(fade)}`,
    'format=yuv420p',
  );

  await step(
    [
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=${String(width)}x${String(height)}:r=${String(fps)}:d=${String(durationS)}`,
      '-f',
      'lavfi',
      '-i',
      SILENCE,
      '-filter:v',
      filters.join(','),
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-shortest',
      ...VIDEO_CODEC,
      ...AUDIO_CODEC,
    ],
    output,
    { ...options, cwd: workDir },
  );
}

export interface ConcatOptions extends StepOptions {
  /** I nomi dei file già normalizzati, dentro `workDir`: li sceglie il programma, non l'utente. */
  inputs: readonly string[];
  output: string;
  workDir: string;
}

/** Incolla i pezzi senza ricodificare: hanno tutti lo stesso formato. */
export async function concatClips(options: ConcatOptions): Promise<void> {
  const { inputs, output, workDir } = options;
  const list = 'elenco.txt';
  await writeFile(
    path.join(workDir, list),
    inputs.map((input) => `file '${input}'`).join('\n'),
    'utf8',
  );
  await step(['-f', 'concat', '-i', list, '-c', 'copy'], output, { ...options, cwd: workDir });
}

/** Un suono da mettere nel mix. Tutti i tempi sono in secondi dall'inizio del film. */
export interface MixSound {
  file: string;
  startS: number;
  durationS: number;
  /** Da 0 a 1. */
  volume: number;
  fadeInS: number;
  fadeOutS: number;
}

export interface MixOptions extends StepOptions {
  sounds: readonly MixSound[];
  /** Quanto dura il film: il suono finisce con lui. */
  durationS: number;
  /** Il file da scrivere (m4a). */
  output: string;
  /** Dove scrivere la descrizione dei filtri. */
  workDir: string;
}

const seconds = (value: number): string => value.toFixed(3);

/** La catena di un suono: prende il pezzo giusto, lo porta al formato comune e lo mette al suo posto. */
function soundChain(sound: MixSound, index: number, totalS: number): string {
  const delayMs = Math.round(sound.startS * 1000);
  const parts = [
    `atrim=0:${seconds(sound.durationS)}`,
    'asetpts=PTS-STARTPTS',
    `aformat=sample_rates=${String(SAMPLE_RATE)}:channel_layouts=stereo`,
    `volume=${sound.volume.toFixed(3)}`,
    ...(sound.fadeInS > 0 ? [`afade=t=in:st=0:d=${seconds(sound.fadeInS)}`] : []),
    ...(sound.fadeOutS > 0
      ? [`afade=t=out:st=${seconds(sound.durationS - sound.fadeOutS)}:d=${seconds(sound.fadeOutS)}`]
      : []),
    `adelay=${String(delayMs)}|${String(delayMs)}`,
    'apad',
    `atrim=0:${seconds(totalS)}`,
  ];
  return `[${String(index)}:a]${parts.join(',')}[s${String(index)}]`;
}

/**
 * Il mix delle tracce, con il volume livellato. Ogni suono si allunga col silenzio fino alla fine del
 * film: così `amix` divide sempre per lo stesso numero (questa versione non ha `normalize=0`) e il volume
 * non salta quando un suono finisce; `volume=N` riporta il livello, il limitatore evita che due suoni
 * insieme gracchino e `loudnorm` porta il film a un volume da film. La descrizione sta in un file: su
 * Windows una riga di comando troppo lunga non parte.
 */
export async function mixSounds(options: MixOptions): Promise<void> {
  const { sounds, durationS, output, workDir } = options;
  if (sounds.length === 0)
    throw new MediaError('ffmpeg_failed', 'Nessun suono da mettere nel mix.');

  const script = 'mix.txt';
  const labels = sounds.map((_, index) => `[s${String(index)}]`).join('');
  const graph = [
    ...sounds.map((sound, index) => soundChain(sound, index, durationS)),
    `${labels}amix=inputs=${String(sounds.length)}:duration=longest:dropout_transition=0,volume=${String(sounds.length)},alimiter=limit=0.95:level=disabled,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=${String(SAMPLE_RATE)},atrim=0:${seconds(durationS)}[mix]`,
  ].join(';\n');
  await writeFile(path.join(workDir, script), graph, 'utf8');

  await step(
    [
      ...sounds.flatMap((sound) => ['-i', path.resolve(sound.file)]),
      '-filter_complex_script',
      path.join(workDir, script),
      '-map',
      '[mix]',
      ...AUDIO_CODEC,
    ],
    output,
    options,
  );
}

export interface MuxOptions extends StepOptions {
  video: string;
  /** Il mix. Senza, resta il suono che il video ha già (il silenzio, se nessuno ha acceso niente). */
  audio?: string;
  output: string;
}

/** Il film finale: il video così com'è, col suo mix. `+faststart` fa partire subito il lettore. */
export async function muxFilm(options: MuxOptions): Promise<void> {
  const { video, audio, output } = options;
  await step(
    [
      '-i',
      video,
      ...(audio === undefined ? [] : ['-i', audio]),
      '-map',
      '0:v:0',
      '-map',
      audio === undefined ? '0:a:0' : '1:a:0',
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      ...(audio === undefined ? [] : ['-shortest']),
    ],
    output,
    options,
  );
}

import { execFile } from 'node:child_process';
import { mkdtemp, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  concatClips,
  convertFilm,
  layoutTitle,
  mixSounds,
  muxFilm,
  normalizeClip,
  renderTitleCard,
  scaledSize,
  titleFontPath,
  videoSize,
  wrapText,
  type FilmFormat,
} from './assemble.js';
import {
  MediaError,
  audioDurationS,
  ffmpegPath,
  hasAudioStream,
  videoDurationS,
} from './ffmpeg.js';

const exec = promisify(execFile);

const format: FilmFormat = { width: 320, height: 180, fps: 24 };

/** Cosa dice ffmpeg di un file: esce sempre con un errore, perché non gli si chiede di scrivere niente. */
async function ffmpegInfo(file: string): Promise<string> {
  const failed = await exec(ffmpegPath(), ['-hide_banner', '-i', file], {
    windowsHide: true,
  }).catch((error: unknown) => error as { stderr: string });
  return 'stderr' in failed ? failed.stderr : '';
}

let dir: string;
/** Una clip vera di due secondi, in un altro formato, con un suono. */
let source: string;
/** Una clip vera di un secondo, verticale e muta. */
let silent: string;
/** Un secondo di suono. */
let beep: string;

const makeFile = (output: string, ...args: string[]) =>
  exec(ffmpegPath(), ['-hide_banner', '-loglevel', 'error', '-y', ...args, output], {
    windowsHide: true,
  });

/** Quanto è forte un file (dB): in un silenzio è molto basso. Si legge con lo stesso ffmpeg. */
async function loudness(file: string): Promise<number> {
  const { stderr } = await exec(
    ffmpegPath(),
    ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'],
    { windowsHide: true },
  );
  const found = /max_volume: (-?[\d.]+) dB/.exec(stderr);
  if (found === null) throw new Error('niente volume');
  return Number(found[1]);
}

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'filmzy-montaggio-'));
  source = path.join(dir, 'sorgente con spazi.mp4');
  silent = path.join(dir, 'muta.mp4');
  beep = path.join(dir, 'beep.wav');
  await makeFile(
    source,
    '-f',
    'lavfi',
    '-i',
    'testsrc=duration=2:size=160x90:rate=10',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=440:duration=2',
    '-pix_fmt',
    'yuv420p',
    '-shortest',
  );
  await makeFile(
    silent,
    '-f',
    'lavfi',
    '-i',
    'testsrc=duration=1:size=90x160:rate=30',
    '-pix_fmt',
    'yuv420p',
  );
  await makeFile(beep, '-f', 'lavfi', '-i', 'sine=frequency=880:duration=1');
}, 60_000);

describe('videoSize', () => {
  it('legge la misura di un video, e un file senza video non ne ha', async () => {
    expect(await videoSize(source)).toEqual({ width: 160, height: 90 });
    expect(await videoSize(beep)).toBeUndefined();
  });
});

describe('normalizeClip', () => {
  it('porta la clip al formato del film, senza il suo audio: resta un silenzio', async () => {
    const output = path.join(dir, 'senza-audio.mp4');

    await normalizeClip({ input: source, output, format, keepAudio: false });

    expect(await videoSize(output)).toEqual({ width: 320, height: 180 });
    expect(await videoDurationS(output)).toBeCloseTo(2, 0);
    expect(await hasAudioStream(output)).toBe(true);
    expect(await loudness(output)).toBeLessThan(-80);
  });

  it('se l’audio è acceso lo tiene', async () => {
    const output = path.join(dir, 'con-audio.mp4');

    await normalizeClip({ input: source, output, format, keepAudio: true });

    expect(await loudness(output)).toBeGreaterThan(-40);
  });

  it('una clip verticale prende le bande e non si deforma', async () => {
    const output = path.join(dir, 'verticale.mp4');

    await normalizeClip({ input: silent, output, format, keepAudio: false });

    expect(await videoSize(output)).toEqual({ width: 320, height: 180 });
  });

  it('un file che non è un video è un errore con il suo codice', async () => {
    const text = path.join(dir, 'testo.mp4');
    await writeFile(text, 'non sono un video');

    await expect(
      normalizeClip({ input: text, output: path.join(dir, 'x.mp4'), format, keepAudio: false }),
    ).rejects.toMatchObject({ code: 'ffmpeg_failed' });
  });
});

describe('i titoli', () => {
  it('il font viaggia col programma', async () => {
    expect((await stat(titleFontPath())).size).toBeGreaterThan(1000);
  });

  it('si va a capo sulle parole, e una parola lunga resta intera', () => {
    expect(wrapText('Contiene contenuti generati', 12)).toEqual([
      'Contiene',
      'contenuti',
      'generati',
    ]);
    expect(wrapText('  corto  ', 20)).toEqual(['corto']);
    expect(wrapText('precipitevolissimevolmente sì', 5)).toEqual([
      'precipitevolissimevolmente',
      'sì',
    ]);
    expect(wrapText('', 5)).toEqual([]);
  });

  it('su un film verticale il testo si rimpicciolisce e ci sta tutto, dicitura compresa', () => {
    const notice = 'Contiene contenuti generati con intelligenza artificiale';
    const rows = layoutTitle(
      [
        { text: 'Una storia lunghissima che non finisce mai di finire '.repeat(2), scale: 0.07 },
        { text: notice, scale: 0.035 },
      ],
      720,
      1280,
    );

    const height = rows.reduce((sum, { fontSize }) => sum + fontSize * 1.5, 0);
    expect(height).toBeLessThanOrEqual(1280 * 0.9);
    for (const { row, fontSize } of rows) {
      expect(row.length * fontSize * 0.62).toBeLessThanOrEqual(720 * 0.84);
    }
    expect(rows.map(({ row }) => row).join(' ')).toContain(notice);
  });

  it('una parola troppo lunga fa rimpicciolire il testo, invece di uscire ai lati', () => {
    const [row] = layoutTitle([{ text: 'x'.repeat(60), scale: 0.09 }], 720, 1280);

    expect((row?.row.length ?? 0) * (row?.fontSize ?? 0) * 0.62).toBeLessThanOrEqual(720 * 0.84);
  });

  it('un titolo è una clip del film, anche con caratteri che ffmpeg potrebbe capire male', async () => {
    const workDir = await mkdtemp(path.join(dir, 'titoli con spazi '));
    const output = 'apertura.mp4';

    await renderTitleCard({
      output,
      workDir,
      format,
      durationS: 2,
      lines: [
        { text: "L'ultima corsa: 100% %{n} \\ fine", scale: 0.1 },
        { text: 'Contiene contenuti generati con intelligenza artificiale', scale: 0.05 },
      ],
    });

    const file = path.join(workDir, output);
    expect(await videoSize(file)).toEqual({ width: 320, height: 180 });
    expect(await videoDurationS(file)).toBeCloseTo(2, 0);
    expect(await hasAudioStream(file)).toBe(true);
  });
});

describe('il film a una qualità più bassa', () => {
  it('le misure tengono il formato, e sono pari anche se il conto non torna', () => {
    expect(scaledSize({ width: 1920, height: 1080 }, 720)).toEqual({ width: 1280, height: 720 });
    expect(scaledSize({ width: 1280, height: 720 }, 480)).toEqual({ width: 852, height: 480 });
    // In un film verticale il lato corto è la larghezza.
    expect(scaledSize({ width: 1080, height: 1920 }, 720)).toEqual({ width: 720, height: 1280 });
  });

  it('cambia il video e tiene il suono così com’è', async () => {
    const workDir = await mkdtemp(path.join(dir, 'qualita-'));
    const film = path.join(workDir, 'film.mp4');
    await normalizeClip({ input: source, output: film, format, keepAudio: true });
    const smaller = path.join(workDir, 'piccolo.mp4');

    await convertFilm({
      input: film,
      output: smaller,
      container: 'mp4',
      width: 160,
      height: 90,
      bars: false,
      samePicture: false,
    });

    expect(await videoSize(smaller)).toEqual({ width: 160, height: 90 });
    expect(await videoDurationS(smaller)).toBeCloseTo((await videoDurationS(film)) ?? 0, 0);
    expect(await loudness(smaller)).toBeCloseTo(await loudness(film), 0);
    expect((await stat(smaller)).size).toBeLessThan((await stat(film)).size);
  }, 60_000);

  it('un file che non è un video dà un errore con il suo codice', async () => {
    const workDir = await mkdtemp(path.join(dir, 'rotto-'));
    const broken = path.join(workDir, 'rotto.mp4');
    await writeFile(broken, 'non sono un video');

    await expect(
      convertFilm({
        input: broken,
        output: path.join(workDir, 'x.mp4'),
        container: 'mp4',
        width: 160,
        height: 90,
        bars: false,
        samePicture: false,
      }),
    ).rejects.toMatchObject({ code: 'ffmpeg_failed' });
  }, 60_000);
});

describe('il film in un altro formato o tipo di file', () => {
  async function filmIn(prefix: string): Promise<{ workDir: string; film: string }> {
    const workDir = await mkdtemp(path.join(dir, prefix));
    const film = path.join(workDir, 'film.mp4');
    await normalizeClip({ input: source, output: film, format, keepAudio: true });
    return { workDir, film };
  }

  /** Il colore del punto dato, nel primo fotogramma: serve a vedere le bande senza guardare il video. */
  async function brightnessAt(file: string, x: number, y: number): Promise<number> {
    const { stdout } = await exec(
      ffmpegPath(),
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        file,
        '-frames:v',
        '1',
        '-filter:v',
        `crop=2:2:${String(x)}:${String(y)},format=gray`,
        '-f',
        'rawvideo',
        '-',
      ],
      { encoding: 'buffer', windowsHide: true },
    );
    return stdout[0] ?? 0;
  }

  it('in verticale ci sono le bande nere sopra e sotto, e l’immagine in mezzo', async () => {
    const { workDir, film } = await filmIn('bande-');
    const tall = path.join(workDir, 'verticale.mp4');

    await convertFilm({
      input: film,
      output: tall,
      container: 'mp4',
      width: 180,
      height: 320,
      bars: true,
      samePicture: false,
    });

    expect(await videoSize(tall)).toEqual({ width: 180, height: 320 });
    expect(await videoDurationS(tall)).toBeCloseTo((await videoDurationS(film)) ?? 0, 0);
    expect(await brightnessAt(tall, 90, 4)).toBeLessThan(30);
    expect(await brightnessAt(tall, 90, 314)).toBeLessThan(30);
    expect(await brightnessAt(tall, 90, 160)).toBeGreaterThan(30);
  }, 60_000);

  it('in MOV alle stesse misure non rifà il video: resta identico', async () => {
    const { workDir, film } = await filmIn('mov-');
    const mov = path.join(workDir, 'film.mov');

    await convertFilm({
      input: film,
      output: mov,
      container: 'mov',
      width: 320,
      height: 180,
      bars: false,
      samePicture: true,
    });

    expect(await videoSize(mov)).toEqual({ width: 320, height: 180 });
    expect(await hasAudioStream(mov)).toBe(true);
    expect(await videoDurationS(mov)).toBeCloseTo((await videoDurationS(film)) ?? 0, 0);
    const codecs = async (file: string) => /Video: (\w+)/.exec(await ffmpegInfo(file))?.[1];
    expect(await codecs(mov)).toBe(await codecs(film));
  }, 60_000);

  it('in WebM rifà video e suono nel tipo giusto, anche alle stesse misure', async () => {
    const { workDir, film } = await filmIn('webm-');
    const webm = path.join(workDir, 'film.webm');

    await convertFilm({
      input: film,
      output: webm,
      container: 'webm',
      width: 320,
      height: 180,
      bars: false,
      samePicture: true,
    });

    const info = await ffmpegInfo(webm);
    expect(info).toContain('Video: vp9');
    expect(info).toContain('Audio: opus');
    expect(await videoDurationS(webm)).toBeCloseTo((await videoDurationS(film)) ?? 0, 0);
  }, 120_000);
});

describe('dai pezzi al film', () => {
  it('incolla i pezzi, mixa i suoni al loro posto e dà un film che dura quanto la somma', async () => {
    const workDir = await mkdtemp(path.join(dir, 'lavoro-'));
    const first = path.join(workDir, 'a.mp4');
    const second = path.join(workDir, 'b.mp4');
    await normalizeClip({ input: source, output: first, format, keepAudio: false });
    await normalizeClip({ input: silent, output: second, format, keepAudio: false });

    await concatClips({ inputs: ['a.mp4', 'b.mp4'], output: 'video.mp4', workDir });
    const video = path.join(workDir, 'video.mp4');
    const total = (await videoDurationS(video)) ?? 0;
    expect(total).toBeCloseTo(3, 0);

    const mix = path.join(workDir, 'mix.m4a');
    await mixSounds({
      sounds: [
        {
          file: beep,
          startS: 0.5,
          durationS: 1,
          volume: 1,
          fadeInS: 0.1,
          fadeOutS: 0.1,
          levelLufs: -20,
        },
        {
          file: beep,
          startS: 1,
          durationS: 1,
          volume: 0.5,
          fadeInS: 0,
          fadeOutS: 0,
          levelLufs: -20,
        },
      ],
      durationS: total,
      output: mix,
      workDir,
    });
    expect(await audioDurationS(mix)).toBeCloseTo(total, 0);
    expect(await loudness(mix)).toBeGreaterThan(-30);

    const film = path.join(workDir, 'film.mp4');
    await muxFilm({ video, audio: mix, output: film });

    expect(await videoDurationS(film)).toBeCloseTo(total, 0);
    expect(await loudness(film)).toBeGreaterThan(-30);
  }, 120_000);

  it('il volume scelto si sente anche con un suono solo: il livellamento non lo cancella', async () => {
    const workDir = await mkdtemp(path.join(dir, 'volume-'));
    const mixAt = async (volume: number, name: string) => {
      const output = path.join(workDir, name);
      await mixSounds({
        sounds: [
          { file: beep, startS: 0, durationS: 1, volume, fadeInS: 0, fadeOutS: 0, levelLufs: -20 },
        ],
        durationS: 1,
        output,
        workDir,
      });
      return loudness(output);
    };

    const full = await mixAt(1, 'pieno.m4a');
    const low = await mixAt(0.2, 'basso.m4a');

    expect(full - low).toBeGreaterThan(10);
  }, 60_000);

  it('senza suoni il film resta col suo silenzio', async () => {
    const workDir = await mkdtemp(path.join(dir, 'muto-'));
    const clip = path.join(workDir, 'a.mp4');
    await normalizeClip({ input: silent, output: clip, format, keepAudio: false });
    const film = path.join(workDir, 'film.mp4');

    await muxFilm({ video: clip, output: film });

    expect(await hasAudioStream(film)).toBe(true);
    expect(await loudness(film)).toBeLessThan(-80);
  });

  it('un mix senza suoni è un errore, non un file vuoto', async () => {
    const workDir = await mkdtemp(path.join(dir, 'vuoto-'));

    await expect(
      mixSounds({ sounds: [], durationS: 1, output: path.join(workDir, 'x.m4a'), workDir }),
    ).rejects.toBeInstanceOf(MediaError);
  });
});

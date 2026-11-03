import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  MediaError,
  extractFrame,
  ffmpegPath,
  markArea,
  maskHasPaint,
  shrinkImage,
  videoDurationS,
} from './ffmpeg.js';

const run = promisify(execFile);

let dir: string;
let video: string;

/** Un video vero di due secondi (lo fa lo stesso ffmpeg): l'unico modo di provare un fotogramma vero. */
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'filmzy-media-'));
  video = path.join(dir, 'prova.mp4');
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc=duration=2:size=160x90:rate=10',
      '-c:v',
      'mpeg4',
      '-pix_fmt',
      'yuv420p',
      video,
    ],
    { windowsHide: true },
  );
});

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

async function failure(call: () => Promise<unknown>): Promise<MediaError> {
  try {
    await call();
  } catch (error) {
    if (error instanceof MediaError) return error;
    throw error;
  }
  throw new Error('doveva fallire');
}

describe('ffmpegPath', () => {
  it('di norma è quello che arriva con il programma', () => {
    expect(ffmpegPath({})).toMatch(/ffmpeg/);
  });

  it('FILMZY_FFMPEG lo sostituisce, e una variabile vuota no', () => {
    expect(ffmpegPath({ FILMZY_FFMPEG: '/usr/local/bin/ffmpeg' })).toBe('/usr/local/bin/ffmpeg');
    expect(ffmpegPath({ FILMZY_FFMPEG: '' })).toBe(ffmpegPath({}));
  });
});

describe('videoDurationS', () => {
  it('dà la durata del video in secondi', async () => {
    expect(await videoDurationS(video)).toBeCloseTo(2, 1);
  });

  it('un file che non è un video, o che non c’è, non dà una durata inventata', async () => {
    const text = path.join(dir, 'testo.mp4');
    await writeFile(text, 'non sono un video');

    expect((await failure(() => videoDurationS(text))).code).toBe('ffmpeg_failed');
    expect((await failure(() => videoDurationS(path.join(dir, 'non-c-e.mp4')))).code).toBe(
      'ffmpeg_failed',
    );
  });
});

/** Un'immagine vera, di rumore, che pesa parecchio: l'unico modo di provare una riduzione vera. */
async function makeNoisyPng(width: number, height: number, name: string): Promise<string> {
  const file = path.join(dir, name);
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `testsrc2=size=${String(width)}x${String(height)}:rate=1`,
      '-vf',
      'noise=alls=80:allf=t',
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    { windowsHide: true },
  );
  return file;
}

/** Una maschera 160x100: un quadrato 64x64 dipinto a (20,20), il resto trasparente. */
async function makeMask(name: string, painted: boolean): Promise<string> {
  const file = path.join(dir, name);
  const source = painted
    ? 'color=c=white:s=64x64,format=rgba'
    : 'color=c=black@0.0:s=64x64,format=rgba';
  await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      source,
      '-vf',
      'pad=160:100:20:20:color=black@0',
      '-frames:v',
      '1',
      '-y',
      file,
    ],
    { windowsHide: true },
  );
  return file;
}

/** Il colore di un pixel (R, G, B), letto con ffmpeg: l'unico modo di guardare dentro un PNG senza una libreria. */
async function pixelAt(file: string, x: number, y: number): Promise<number[]> {
  const { stdout } = await run(
    ffmpegPath(),
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      file,
      '-vf',
      `crop=1:1:${String(x)}:${String(y)}`,
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgb24',
      '-',
    ],
    { encoding: 'buffer', windowsHide: true },
  );
  return [...stdout];
}

describe('markArea e maskHasPaint', () => {
  it('la zona dipinta si vede in magenta trasparente sull’immagine, il resto non cambia', async () => {
    const image = await makeNoisyPng(320, 200, 'da-marcare.png');
    const mask = await makeMask('maschera.png', true);
    const output = path.join(dir, 'marcata.png');

    await markArea({ image, mask, output });

    // La maschera è 160x100 e l'immagine 320x200: la tela si porta alla misura dell'immagine.
    const [before, inside, outside, outsideBefore] = await Promise.all([
      pixelAt(image, 100, 100),
      pixelAt(output, 100, 100),
      pixelAt(output, 5, 5),
      pixelAt(image, 5, 5),
    ]);
    expect(outside).toEqual(outsideBefore);
    expect(inside).not.toEqual(before);
    // Magenta sopra: tanto rosso e blu, poco verde.
    expect(inside[0]).toBeGreaterThan(inside[1] ?? 0);
    expect(inside[2]).toBeGreaterThan(inside[1] ?? 0);
  });

  it('una maschera con il pennello di un altro colore dà la stessa zona magenta', async () => {
    const image = await makeNoisyPng(320, 200, 'da-marcare-2.png');
    const mask = path.join(dir, 'maschera-verde.png');
    await run(
      ffmpegPath(),
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-f',
        'lavfi',
        '-i',
        'color=c=green:s=64x64,format=rgba',
        '-vf',
        'pad=160:100:20:20:color=black@0',
        '-frames:v',
        '1',
        '-y',
        mask,
      ],
      { windowsHide: true },
    );
    const output = path.join(dir, 'marcata-verde.png');

    await markArea({ image, mask, output });

    const inside = await pixelAt(output, 100, 100);
    expect(inside[0]).toBeGreaterThan(inside[1] ?? 0);
  });

  it('dice se la maschera ha un punto dipinto: una vuota no', async () => {
    expect(await maskHasPaint(await makeMask('piena.png', true))).toBe(true);
    expect(await maskHasPaint(await makeMask('vuota.png', false))).toBe(false);
  });

  it('un file che non è un’immagine, o che non c’è, è un errore di ffmpeg e non lascia un file', async () => {
    const text = path.join(dir, 'finta-maschera.png');
    await writeFile(text, 'non sono una maschera');
    const output = path.join(dir, 'non-deve-esserci-2.png');
    const image = await makeNoisyPng(64, 64, 'piccola-2.png');

    expect((await failure(() => markArea({ image, mask: text, output }))).code).toBe(
      'ffmpeg_failed',
    );
    expect(
      (await failure(() => markArea({ image: path.join(dir, 'non-c-e.png'), mask: text, output })))
        .code,
    ).toBe('ffmpeg_failed');
    expect((await failure(() => maskHasPaint(text))).code).toBe('ffmpeg_failed');
    await expect(readFile(output)).rejects.toThrow();
  });
});

describe('shrinkImage', () => {
  it('una foto grande diventa una copia JPEG più piccola, dentro il lato chiesto', async () => {
    const input = await makeNoisyPng(2400, 1800, 'grande.png');
    const output = path.join(dir, 'grande-ridotta.jpg');

    await shrinkImage({ input, output, maxSidePx: 800 });

    const [before, after] = await Promise.all([readFile(input), readFile(output)]);
    expect(after.length).toBeLessThan(before.length / 4);
    expect([...after.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    // 2400x1800 dentro 800: 800x600. Il JPEG lo dice nell'intestazione, non serve decodificarlo.
    const sof = after.indexOf(Buffer.from([0xff, 0xc0]));
    expect(sof).toBeGreaterThan(0);
    expect(after.readUInt16BE(sof + 5)).toBe(600);
    expect(after.readUInt16BE(sof + 7)).toBe(800);
  });

  it('una foto già piccola non si ingrandisce', async () => {
    const input = await makeNoisyPng(320, 200, 'piccola.png');
    const output = path.join(dir, 'piccola-ridotta.jpg');

    await shrinkImage({ input, output, maxSidePx: 1568 });

    const bytes = await readFile(output);
    const sof = bytes.indexOf(Buffer.from([0xff, 0xc0]));
    expect(bytes.readUInt16BE(sof + 5)).toBe(200);
    expect(bytes.readUInt16BE(sof + 7)).toBe(320);
  });

  it('un file che non è un’immagine, o che non c’è, è un errore di ffmpeg e non lascia un file', async () => {
    const text = path.join(dir, 'finta.png');
    await writeFile(text, 'non sono una foto');
    const output = path.join(dir, 'non-deve-esserci.jpg');

    expect((await failure(() => shrinkImage({ input: text, output, maxSidePx: 800 }))).code).toBe(
      'ffmpeg_failed',
    );
    expect(
      (
        await failure(() =>
          shrinkImage({ input: path.join(dir, 'non-c-e.png'), output, maxSidePx: 800 }),
        )
      ).code,
    ).toBe('ffmpeg_failed');
    await expect(readFile(output)).rejects.toThrow();
  });

  it('un lato che non è un numero ragionevole si rifiuta prima di lanciare ffmpeg', async () => {
    for (const maxSidePx of [0, -5, 8, 12.5, Number.NaN]) {
      const error = await failure(() =>
        shrinkImage({
          input: path.join(dir, 'qualsiasi.png'),
          output: path.join(dir, 'x.jpg'),
          maxSidePx,
        }),
      );
      expect(error.code, String(maxSidePx)).toBe('invalid_time');
    }
  });
});

describe('un video che non dice la sua durata', () => {
  it('si legge lo stesso: la durata non c’è, e un fotogramma si prende comunque', async () => {
    const raw = path.join(dir, 'senza-durata.m4v');
    await run(
      ffmpegPath(),
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-f',
        'lavfi',
        '-i',
        'testsrc=duration=2:size=160x90:rate=10',
        '-c:v',
        'mpeg4',
        '-f',
        'm4v',
        raw,
      ],
      { windowsHide: true },
    );
    const output = path.join(dir, 'senza-durata.png');

    expect(await videoDurationS(raw)).toBeUndefined();
    await extractFrame({ input: raw, atS: 0.5, output });

    expect([...(await readFile(output)).subarray(0, 4)]).toEqual(PNG_SIGNATURE);
  });
});

describe('extractFrame', () => {
  it('salva il fotogramma al momento chiesto come immagine PNG', async () => {
    const output = path.join(dir, 'uno.png');

    await extractFrame({ input: video, atS: 1, output });

    const bytes = await readFile(output);
    expect([...bytes.subarray(0, 4)]).toEqual(PNG_SIGNATURE);
    expect(bytes.length).toBeGreaterThan(100);
  });

  it('il primo istante vale: si parte anche dal fotogramma iniziale', async () => {
    const output = path.join(dir, 'zero.png');

    await extractFrame({ input: video, atS: 0, output });

    expect([...(await readFile(output)).subarray(0, 4)]).toEqual(PNG_SIGNATURE);
  });

  it('fotogrammi di momenti diversi sono immagini diverse', async () => {
    const early = path.join(dir, 'presto.png');
    const late = path.join(dir, 'tardi.png');

    await extractFrame({ input: video, atS: 0.1, output: early });
    await extractFrame({ input: video, atS: 1.5, output: late });

    expect((await readFile(early)).equals(await readFile(late))).toBe(false);
  });

  it('un momento oltre la fine non dà nessun fotogramma, e non lascia un file', async () => {
    const output = path.join(dir, 'oltre.png');

    const error = await failure(() => extractFrame({ input: video, atS: 30, output }));

    expect(error.code).toBe('no_frame');
    await expect(readFile(output)).rejects.toThrow();
  });

  it('se ffmpeg ci mette troppo si ferma e lo dice: non è un video rovinato', async () => {
    const error = await failure(() =>
      extractFrame({ input: video, atS: 1, output: path.join(dir, 'lento.png'), timeoutMs: 1 }),
    );

    expect(error.code).toBe('timeout');
  });

  it('un tempo che non è un tempo si rifiuta prima di lanciare ffmpeg', async () => {
    for (const atS of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const error = await failure(() =>
        extractFrame({ input: video, atS, output: path.join(dir, 'x.png') }),
      );
      expect(error.code, String(atS)).toBe('invalid_time');
    }
  });

  it('un file che non è un video, o che non c’è, è un errore di ffmpeg', async () => {
    const text = path.join(dir, 'finto.mp4');
    await writeFile(text, 'non sono un video');

    expect(
      (await failure(() => extractFrame({ input: text, atS: 0, output: path.join(dir, 'a.png') })))
        .code,
    ).toBe('ffmpeg_failed');
    expect(
      (
        await failure(() =>
          extractFrame({
            input: path.join(dir, 'non-c-e.mp4'),
            atS: 0,
            output: path.join(dir, 'b.png'),
          }),
        )
      ).code,
    ).toBe('ffmpeg_failed');
  });

  it('un nome di file con spazi, apici, punto e virgola e simboli della shell non diventa un comando', async () => {
    const strange = path.join(dir, `è un 'nome'; strano & ($HOME) $(x).mp4`);
    await writeFile(strange, await readFile(video));
    const output = path.join(dir, 'strano.png');

    await extractFrame({ input: strange, atS: 0.5, output });

    expect([...(await readFile(output)).subarray(0, 4)]).toEqual(PNG_SIGNATURE);
  });

  it('se ffmpeg non c’è lo dice con il suo codice, non con un errore del sistema', async () => {
    const error = await failure(() =>
      extractFrame({
        input: video,
        atS: 0,
        output: path.join(dir, 'c.png'),
        env: { FILMZY_FFMPEG: path.join(dir, 'ffmpeg-che-non-esiste') },
      }),
    );

    expect(error.code).toBe('ffmpeg_missing');
  });
});

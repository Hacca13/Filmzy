import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { beforeAll, describe, expect, it } from 'vitest';

import { MediaError, extractFrame, ffmpegPath, videoDurationS } from './ffmpeg.js';

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

import { AUDIO_UPLOAD_MAX_BYTES } from '@filmzy/contracts';
import type { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { detectAudioType, readAudioBody } from './audio-file.js';

const bytesOf = (...parts: (string | number[])[]) =>
  Buffer.concat(parts.map((part) => Buffer.from(part as string)));

describe('il tipo vero di un file audio', () => {
  it.each([
    ['WAV', bytesOf('RIFF', [0, 0, 0, 0], 'WAVE'), 'audio/wav'],
    ['MP3 con etichette', bytesOf('ID3', [4, 0]), 'audio/mpeg'],
    ['MP3 senza etichette', Buffer.from([0xff, 0xfb, 0x90, 0x00]), 'audio/mpeg'],
    ['M4A', bytesOf([0, 0, 0, 32], 'ftyp', 'M4A '), 'audio/mp4'],
  ])('riconosce %s dai primi byte', (_name, bytes, expected) => {
    expect(detectAudioType(bytes)).toBe(expected);
  });

  it.each([
    ['un testo', Buffer.from('non sono musica')],
    ['un’immagine', Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    ['un RIFF che non è un WAV', bytesOf('RIFF', [0, 0, 0, 0], 'AVI ')],
    ['un file vuoto', Buffer.alloc(0)],
  ])('non scambia per audio %s', (_name, bytes) => {
    expect(detectAudioType(bytes)).toBeUndefined();
  });
});

describe('il corpo della richiesta', () => {
  it('prende un file di un tipo che conosce', () => {
    const body = bytesOf('RIFF', [0, 0, 0, 0], 'WAVE');

    expect(readAudioBody(body)).toEqual({ bytes: body, contentType: 'audio/wav' });
  });

  it('rifiuta un corpo che non è un file, vuoto, troppo grande o di un altro tipo', () => {
    const tooBig = Buffer.alloc(AUDIO_UPLOAD_MAX_BYTES + 1);
    tooBig.write('RIFF');
    tooBig.write('WAVE', 8);

    expect.assertions(5);
    for (const body of [{}, undefined, Buffer.alloc(0), tooBig, Buffer.from('testo')]) {
      try {
        readAudioBody(body);
      } catch (error) {
        expect((error as HttpException).getResponse()).toMatchObject({
          code: 'invalid_request',
          details: { field: 'audioFile' },
        });
      }
    }
  });
});

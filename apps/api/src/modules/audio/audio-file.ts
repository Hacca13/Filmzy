import { AUDIO_UPLOAD_MAX_BYTES } from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';

/** I tipi che sappiamo salvare e mettere nel mix. */
export type AudioContentType = 'audio/wav' | 'audio/mpeg' | 'audio/mp4';

const startsWith = (bytes: Uint8Array, text: string, offset = 0): boolean =>
  Buffer.from(bytes.subarray(offset, offset + text.length)).toString('latin1') === text;

/**
 * Il tipo vero di un file audio, letto dai primi byte: quello che dichiara chi lo manda non basta, e il
 * file poi finisce in ffmpeg. `undefined` se non è uno dei formati che accettiamo.
 */
export function detectAudioType(bytes: Uint8Array): AudioContentType | undefined {
  if (startsWith(bytes, 'RIFF') && startsWith(bytes, 'WAVE', 8)) return 'audio/wav';
  if (startsWith(bytes, 'ftyp', 4)) return 'audio/mp4';
  if (startsWith(bytes, 'ID3')) return 'audio/mpeg';
  // Un MP3 senza etichette comincia con una sincronia: undici bit a uno.
  const [first = 0, second = 0] = bytes;
  return first === 0xff && (second & 0xe0) === 0xe0 ? 'audio/mpeg' : undefined;
}

/**
 * Il corpo di una richiesta che porta un file audio (T5.5, D27): deve essere un file, non vuoto, non
 * troppo grande e di un tipo che accettiamo. Altrimenti `invalid_request` sul campo `audioFile`.
 */
export function readAudioBody(body: unknown): { bytes: Buffer; contentType: AudioContentType } {
  if (!Buffer.isBuffer(body) || body.length === 0 || body.length > AUDIO_UPLOAD_MAX_BYTES) {
    throw domainError(400, 'invalid_request', { details: { field: 'audioFile' } });
  }
  const contentType = detectAudioType(body);
  if (contentType === undefined) {
    throw domainError(400, 'invalid_request', { details: { field: 'audioFile' } });
  }
  return { bytes: body, contentType };
}

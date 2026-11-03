import { UPLOAD_MAX_BYTES } from '@filmzy/contracts';

import { domainError } from '../../http/domain-error.js';
import { detectImageType } from './image-checks.js';

export interface ImageBody {
  bytes: Buffer;
  contentType: 'image/png' | 'image/jpeg' | 'image/webp';
}

/**
 * Il corpo di una richiesta che porta una foto (T4.8, T4.10): deve essere un file, non vuoto, non troppo
 * grande, e di un tipo che accettiamo letto dai **primi byte**, non da quello che dichiara chi lo manda.
 * Altrimenti `invalid_request` sul campo `file`.
 */
export function readImageBody(body: unknown): ImageBody {
  if (!Buffer.isBuffer(body) || body.length === 0 || body.length > UPLOAD_MAX_BYTES) {
    throw domainError(400, 'invalid_request', { details: { field: 'file' } });
  }
  const contentType = detectImageType(body);
  if (contentType === undefined) {
    throw domainError(400, 'invalid_request', { details: { field: 'file' } });
  }
  return { bytes: body, contentType };
}

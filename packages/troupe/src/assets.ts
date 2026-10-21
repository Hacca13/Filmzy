import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { MediaFile } from './adapters/types.js';
import { ProviderError } from './provider-error.js';

/**
 * I file dei fornitori si copiano **subito** nella cartella del progetto (CLAUDE.md regola d'oro
 * 11): le URL di fal scadono, e un film deve restare completo anche fra sei mesi. La troupe non
 * conosce il disco: l'app le passa un `AssetStore`, il bench e i test ne usano uno loro.
 */
export interface StoredAsset {
  assetId: string;
  /** Dove sta il file, per chi deve aprirlo (l'app, ffmpeg). */
  path: string;
  contentType: string;
  bytes: number;
  /** sha256 del contenuto: è anche l'id, così lo stesso file non si salva due volte. */
  checksum: string;
}

export interface AssetStore {
  put(file: MediaFile): Promise<StoredAsset>;
}

/**
 * Le estensioni che accettiamo, per tipo. Il nome del file lo decide **il nostro codice**, mai il
 * fornitore: un nome che arriva da fuori non deve poter scrivere fuori dalla cartella.
 */
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
};

export class LocalAssetStore implements AssetStore {
  constructor(private readonly dir: string) {}

  async put(file: MediaFile): Promise<StoredAsset> {
    const extension = EXTENSIONS[file.contentType.split(';')[0]?.trim() ?? ''];
    if (extension === undefined) {
      throw new ProviderError(
        'invalid_output',
        false,
        `Il servizio ha restituito un file di tipo "${file.contentType}", che non sappiamo salvare.`,
      );
    }

    const checksum = createHash('sha256').update(file.bytes).digest('hex');
    const name = `${checksum}.${extension}`;
    const full = path.join(this.dir, name);

    await mkdir(this.dir, { recursive: true });
    await writeFile(full, file.bytes);

    return {
      assetId: checksum,
      path: full,
      contentType: file.contentType,
      bytes: file.bytes.byteLength,
      checksum,
    };
  }
}

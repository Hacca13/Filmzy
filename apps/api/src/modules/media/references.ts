import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { SheetStore } from '@filmzy/db';
import type { MediaInput } from '@filmzy/troupe';

/**
 * Un file già salvato nella cartella del film, pronto per entrare in una richiesta a un servizio
 * come riferimento (volto di un personaggio, immagine del set…). Il percorso nel database è
 * relativo alla cartella dei dati e si controlla prima di leggere: un record rovinato non deve
 * poter far leggere un file fuori da lì (CLAUDE.md, «Sicuro»).
 *
 * `use` dice a cosa serve: un riferimento (volto, set) o l'immagine da modificare (l'ultimo fotogramma
 * nasce dal primo, D20).
 *
 * `undefined` se il file non c'è più (cartella ripulita a mano, record vecchio): chi chiama decide
 * se si può andare avanti senza quel riferimento.
 */
export async function referenceInput(
  files: Pick<SheetStore, 'getAsset'>,
  dataDir: string,
  assetId: string,
  use: 'reference' | 'base_image' = 'reference',
): Promise<MediaInput | undefined> {
  const record = files.getAsset(assetId);
  if (record === undefined) return undefined;

  const root = path.resolve(dataDir);
  const file = path.resolve(root, record.path);
  if (!file.startsWith(root + path.sep)) return undefined;

  try {
    return {
      use,
      file: {
        fileName: path.basename(file),
        contentType: record.contentType,
        bytes: new Uint8Array(await readFile(file)),
      },
    };
  } catch {
    // Il file è stato spostato o cancellato: per chi chiama è un riferimento che manca, non un
    // errore da mostrare all'utente.
    return undefined;
  }
}

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
 * `use` dice a cosa serve: un riferimento (volto, set), l'immagine da modificare (l'ultimo fotogramma
 * nasce dal primo, D20) o il primo o l'ultimo fotogramma di un video.
 *
 * `undefined` se il file non c'è più (cartella ripulita a mano, record vecchio): chi chiama decide
 * se si può andare avanti senza quel riferimento.
 */
/**
 * Dove sta il file di un'immagine o di un video registrato, come percorso assoluto — se sta davvero
 * dentro la cartella dei dati. Il percorso nel database è relativo ed è controllato prima di essere
 * usato: un record rovinato non deve poter far leggere un file fuori da lì.
 */
export function assetFile(
  files: Pick<SheetStore, 'getAsset'>,
  dataDir: string,
  assetId: string,
): { file: string; contentType: string } | undefined {
  const record = files.getAsset(assetId);
  if (record === undefined) return undefined;

  const root = path.resolve(dataDir);
  const file = path.resolve(root, record.path);
  return file.startsWith(root + path.sep) ? { file, contentType: record.contentType } : undefined;
}

export async function referenceInput(
  files: Pick<SheetStore, 'getAsset'>,
  dataDir: string,
  assetId: string,
  use: MediaInput['use'] = 'reference',
): Promise<MediaInput | undefined> {
  const found = assetFile(files, dataDir, assetId);
  if (found === undefined) return undefined;
  const { file, contentType } = found;

  try {
    return {
      use,
      file: {
        fileName: path.basename(file),
        contentType,
        bytes: new Uint8Array(await readFile(file)),
      },
    };
  } catch {
    // Il file è stato spostato o cancellato: per chi chiama è un riferimento che manca, non un
    // errore da mostrare all'utente.
    return undefined;
  }
}

/** Le immagini che mantengono l'identità di una scena: il volto bloccato di ogni personaggio e il set. */
export interface IdentityReferences {
  characters: { characterId: string; assetId: string }[];
  locationAssetId?: string;
}

export interface ReadIdentity {
  /** Prima i volti, nell'ordine dei personaggi, poi il set: è l'ordine in cui li conta il traduttore. */
  inputs: MediaInput[];
  /** I personaggi che hanno davvero un riferimento: gli altri non si citano nel prompt. */
  characterIds: string[];
}

/**
 * I file dei volti e del set. Un riferimento il cui file non c'è più (cartella ripulita a mano) si
 * salta: il servizio lavora senza, e il personaggio non si cita nel prompt.
 */
export async function readIdentity(
  files: Pick<SheetStore, 'getAsset'>,
  dataDir: string,
  wanted: IdentityReferences,
): Promise<ReadIdentity> {
  const [faces, set] = await Promise.all([
    Promise.all(
      wanted.characters.map(async ({ characterId, assetId }) => ({
        characterId,
        input: await referenceInput(files, dataDir, assetId),
      })),
    ),
    wanted.locationAssetId === undefined
      ? undefined
      : referenceInput(files, dataDir, wanted.locationAssetId),
  ]);

  const found = faces.flatMap(({ characterId, input }) =>
    input === undefined ? [] : [{ characterId, input }],
  );
  return {
    inputs: [...found.map(({ input }) => input), ...(set === undefined ? [] : [set])],
    characterIds: found.map(({ characterId }) => characterId),
  };
}

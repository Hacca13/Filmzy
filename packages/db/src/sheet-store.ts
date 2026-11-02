import { randomUUID } from 'node:crypto';

import {
  SHEET_ANGLES,
  characterSheetSchema,
  sheetAngleSchema,
  sheetImageStatusSchema,
  type CharacterSheet,
  type SheetAngle,
  type SheetImageStatus,
} from '@filmzy/contracts';
import { and, desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import {
  assets,
  characterSheetImages,
  characters,
  type AssetRow,
  type CharacterSheetImageRow,
} from './schema.js';

/** Un file dei fornitori già copiato nella cartella del film. */
export interface AssetRecord {
  id: string;
  /** Relativo alla cartella dei dati. */
  path: string;
  contentType: string;
  bytes: number;
  projectId?: string;
  generationId?: string;
}

/** Cosa si può dire di una singola immagine della scheda mentre il lavoro avanza. */
export interface SheetImagePatch {
  status: SheetImageStatus;
  assetId?: string;
  receiptId?: string;
  errorCode?: string;
}

/**
 * Le schede dei personaggi e i file che le compongono (T3.6, architettura §6). Ogni richiesta di
 * scheda è un **tentativo** con tre immagini (una per angolazione); si possono chiedere altri
 * tentativi e se ne sceglie uno, su cui si blocca il volto. I file sono registrati a parte: stessa
 * immagine, stesso id (il checksum).
 */
export interface SheetStore {
  registerAsset: (asset: AssetRecord) => void;
  getAsset: (id: string) => AssetRecord | undefined;
  /** Crea un tentativo con le tre immagini «in coda» e ne dà il numero. */
  startAttempt: (characterId: string) => number;
  update: (characterId: string, attempt: number, angle: SheetAngle, patch: SheetImagePatch) => void;
  /** I tentativi dal più recente, col volto bloccato se lo è. */
  get: (characterId: string) => CharacterSheet;
  /** Blocca il volto su un tentativo, o lo sblocca con `undefined`. */
  lock: (characterId: string, attempt: number | undefined) => void;
  /** Gli id dei file del tentativo bloccato, nell'ordine delle angolazioni; vuoto se non è bloccato. */
  lockedAssetIds: (characterId: string) => string[];
  /** Toglie la scheda (quando il personaggio esce dal film). */
  removeFor: (characterId: string) => void;
}

export interface SheetStoreOptions {
  now?: () => Date;
}

function toAsset(row: AssetRow): AssetRecord {
  return {
    id: row.id,
    path: row.path,
    contentType: row.contentType,
    bytes: row.bytes,
    ...(row.projectId === null ? {} : { projectId: row.projectId }),
    ...(row.generationId === null ? {} : { generationId: row.generationId }),
  };
}

const angleOrder = (angle: string): number => SHEET_ANGLES.findIndex((known) => known === angle);

export function createSheetStore(db: FilmzyDb, options: SheetStoreOptions = {}): SheetStore {
  const now = options.now ?? (() => new Date());

  const lockedOf = (characterId: string): number | undefined => {
    const row = db
      .select({ locked: characters.lockedAttempt })
      .from(characters)
      .where(eq(characters.id, characterId))
      .get();
    return row?.locked ?? undefined;
  };

  const rows = (characterId: string): CharacterSheetImageRow[] =>
    db
      .select()
      .from(characterSheetImages)
      .where(eq(characterSheetImages.characterId, characterId))
      .orderBy(desc(characterSheetImages.attempt))
      .all();

  return {
    registerAsset(asset) {
      db.insert(assets)
        .values({
          id: asset.id,
          path: asset.path,
          contentType: asset.contentType,
          bytes: asset.bytes,
          projectId: asset.projectId ?? null,
          generationId: asset.generationId ?? null,
          createdAt: now().getTime(),
        })
        // Lo stesso file è lo stesso id: se c'è già, resta com'è (regola d'oro 10).
        .onConflictDoNothing()
        .run();
    },

    getAsset(id) {
      const row = db.select().from(assets).where(eq(assets.id, id)).get();
      return row === undefined ? undefined : toAsset(row);
    },

    startAttempt(characterId) {
      return db.transaction((tx) => {
        const last = tx
          .select({ attempt: characterSheetImages.attempt })
          .from(characterSheetImages)
          .where(eq(characterSheetImages.characterId, characterId))
          .orderBy(desc(characterSheetImages.attempt))
          .limit(1)
          .get();
        const attempt = (last?.attempt ?? 0) + 1;
        const at = now().getTime();

        for (const angle of SHEET_ANGLES) {
          tx.insert(characterSheetImages)
            .values({
              id: randomUUID(),
              characterId,
              attempt,
              angle,
              status: 'queued',
              createdAt: at,
              updatedAt: at,
            })
            .run();
        }
        return attempt;
      });
    },

    update(characterId, attempt, angle, patch) {
      db.update(characterSheetImages)
        .set({
          status: patch.status,
          assetId: patch.assetId ?? null,
          receiptId: patch.receiptId ?? null,
          errorCode: patch.errorCode ?? null,
          updatedAt: now().getTime(),
        })
        .where(
          and(
            eq(characterSheetImages.characterId, characterId),
            eq(characterSheetImages.attempt, attempt),
            eq(characterSheetImages.angle, angle),
          ),
        )
        .run();
    },

    get(characterId) {
      const byAttempt = new Map<number, CharacterSheetImageRow[]>();
      for (const row of rows(characterId)) {
        byAttempt.set(row.attempt, [...(byAttempt.get(row.attempt) ?? []), row]);
      }

      const locked = lockedOf(characterId);
      return characterSheetSchema.parse({
        characterId,
        attempts: [...byAttempt.entries()].map(([attempt, images]) => ({
          attempt,
          createdAt: new Date(Math.min(...images.map((image) => image.createdAt))).toISOString(),
          images: images
            .sort((a, b) => angleOrder(a.angle) - angleOrder(b.angle))
            .map((image) => ({
              angle: sheetAngleSchema.parse(image.angle),
              status: sheetImageStatusSchema.parse(image.status),
              ...(image.assetId === null ? {} : { assetId: image.assetId }),
              ...(image.errorCode === null ? {} : { errorCode: image.errorCode }),
            })),
        })),
        ...(locked === undefined ? {} : { lockedAttempt: locked }),
      });
    },

    lock(characterId, attempt) {
      db.update(characters)
        .set({ lockedAttempt: attempt ?? null, updatedAt: now().getTime() })
        .where(eq(characters.id, characterId))
        .run();
    },

    lockedAssetIds(characterId) {
      const locked = lockedOf(characterId);
      if (locked === undefined) return [];
      return rows(characterId)
        .filter((row) => row.attempt === locked && row.assetId !== null)
        .sort((a, b) => angleOrder(a.angle) - angleOrder(b.angle))
        .flatMap((row) => (row.assetId === null ? [] : [row.assetId]));
    },

    removeFor(characterId) {
      db.delete(characterSheetImages)
        .where(eq(characterSheetImages.characterId, characterId))
        .run();
    },
  };
}

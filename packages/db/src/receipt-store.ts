import {
  generationReceiptSchema,
  type GenerationPurpose,
  type GenerationReceipt,
} from '@filmzy/contracts';
import { desc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { generations, type GenerationRow } from './schema.js';

/**
 * Gli scontrini nel database (architettura §4.11). Ha la forma che la troupe si aspetta da un
 * `ReceiptSink` (`write`), così l'app lo collega senza che la troupe conosca il database (§3).
 *
 * Lo stesso scontrino si scrive più volte durante la sua vita: la riga è una sola per `id` e si
 * aggiorna, così una chiamata non si conta due volte nella spesa (regola 10).
 */
export interface ReceiptStore {
  write: (receipt: GenerationReceipt) => Promise<void>;
  get: (id: string) => GenerationReceipt | undefined;
  /** I più recenti per primi. Le righe che non si leggono (forma sbagliata) si saltano. */
  list: (options?: { purpose?: GenerationPurpose; limit?: number }) => GenerationReceipt[];
}

export function createReceiptStore(db: FilmzyDb): ReceiptStore {
  return {
    write(receipt) {
      // `createdAt` resta fuori da quello che si aggiorna: è il momento della richiesta, non
      // dell'ultima modifica.
      const changing = {
        purpose: receipt.purpose,
        role: receipt.role,
        modelId: receipt.modelId,
        status: receipt.status,
        estimatedCostUsd: receipt.estimatedCostUsd,
        actualCostUsd: receipt.actualCostUsd ?? null,
        receipt: JSON.stringify(receipt),
      };

      db.insert(generations)
        .values({ id: receipt.id, createdAt: new Date(receipt.createdAt).getTime(), ...changing })
        .onConflictDoUpdate({ target: generations.id, set: changing })
        .run();
      return Promise.resolve();
    },

    get(id) {
      const [row] = db.select().from(generations).where(eq(generations.id, id)).all();
      return row === undefined ? undefined : toReceipt(row);
    },

    list({ purpose, limit = 50 } = {}) {
      return db
        .select()
        .from(generations)
        .where(purpose === undefined ? undefined : eq(generations.purpose, purpose))
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .all()
        .flatMap((row) => {
          const receipt = toReceipt(row);
          return receipt === undefined ? [] : [receipt];
        });
    },
  };
}

function toReceipt(row: GenerationRow): GenerationReceipt | undefined {
  try {
    const parsed = generationReceiptSchema.safeParse(JSON.parse(row.receipt));
    return parsed.success ? parsed.data : undefined;
  } catch {
    // Non è JSON: come una forma sbagliata, la riga si salta invece di rompere l'elenco.
    return undefined;
  }
}

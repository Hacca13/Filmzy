import {
  generationReceiptSchema,
  type GenerationPurpose,
  type GenerationReceipt,
} from '@filmzy/contracts';
import { desc, eq, gte, sql } from 'drizzle-orm';

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
  /** Quanto si è speso da `since` in poi, per fornitore (D30): il mese corrente, di solito. */
  spentByConnectionSince: (since: Date) => Record<string, number>;
  /** Quanto si è speso per un film, dall'inizio. */
  spentOnProject: (projectId: string) => number;
  /** Quanto si è speso per ogni film. */
  spentByProject: () => Record<string, number>;
}

/**
 * Il costo di uno scontrino ai fini della spesa (D30): quello vero se si sa; altrimenti la stima,
 * tranne per una chiamata fallita, che non ha speso niente. Si somma una riga per scontrino, quindi
 * una chiamata ripetuta non si conta due volte (regola 10).
 */
const COST = sql`COALESCE(${generations.actualCostUsd}, CASE WHEN ${generations.status} = 'failed' THEN 0 ELSE ${generations.estimatedCostUsd} END)`;

export function createReceiptStore(db: FilmzyDb): ReceiptStore {
  return {
    write(receipt) {
      // `createdAt` resta fuori da quello che si aggiorna: è il momento della richiesta, non
      // dell'ultima modifica.
      const changing = {
        purpose: receipt.purpose,
        role: receipt.role,
        modelId: receipt.modelId,
        connectionId: receipt.connectionId,
        projectId: receipt.projectId ?? null,
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

    spentByConnectionSince(since) {
      const rows = db
        .select({ connectionId: generations.connectionId, spent: sql<number>`SUM(${COST})` })
        .from(generations)
        .where(gte(generations.createdAt, since.getTime()))
        .groupBy(generations.connectionId)
        .all();
      return Object.fromEntries(rows.map((row) => [row.connectionId, row.spent]));
    },

    spentOnProject(projectId) {
      const [row] = db
        .select({ spent: sql<number>`COALESCE(SUM(${COST}), 0)` })
        .from(generations)
        .where(eq(generations.projectId, projectId))
        .all();
      return row?.spent ?? 0;
    },

    spentByProject() {
      const rows = db
        .select({ projectId: generations.projectId, spent: sql<number>`SUM(${COST})` })
        .from(generations)
        .where(sql`${generations.projectId} IS NOT NULL`)
        .groupBy(generations.projectId)
        .all();
      return Object.fromEntries(
        rows.flatMap((row) => (row.projectId === null ? [] : [[row.projectId, row.spent]])),
      );
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

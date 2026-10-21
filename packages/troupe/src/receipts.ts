import type { GenerationReceipt } from '@filmzy/contracts';

/**
 * Dove finiscono gli scontrini (architettura §3, §4.11). La troupe non conosce il database: l'app
 * collegherà la tabella `generations` in M2, il bench e i test scrivono in memoria o su file.
 *
 * Lo stesso scontrino si scrive più volte durante la sua vita (`queued` → `running` →
 * `succeeded`/`failed`): chi implementa l'interfaccia aggiorna la voce con quell'`id`.
 */
export interface ReceiptSink {
  write(receipt: GenerationReceipt): Promise<void>;
}

/** Scontrini in memoria, per test e bench. */
export class MemoryReceiptSink implements ReceiptSink {
  private readonly byId = new Map<string, GenerationReceipt>();
  private readonly order: string[] = [];

  write(receipt: GenerationReceipt): Promise<void> {
    if (!this.byId.has(receipt.id)) this.order.push(receipt.id);
    this.byId.set(receipt.id, receipt);
    return Promise.resolve();
  }

  /** Gli scontrini nell'ordine in cui sono nati, ognuno nel suo stato più recente. */
  all(): GenerationReceipt[] {
    return this.order.map((id) => {
      const receipt = this.byId.get(id);
      if (receipt === undefined) throw new Error(`scontrino "${id}" perso`);
      return receipt;
    });
  }

  last(): GenerationReceipt | undefined {
    return this.all().at(-1);
  }
}

import type { DomainEvent } from '@filmzy/contracts';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

type Listener = (event: DomainEvent) => void;

/**
 * Il canale interno degli eventi (T4.4, architettura §5.4): chi sa che qualcosa è cambiato (oggi
 * l'esecutore della coda) lo pubblica, chi lo vuole sapere (oggi il flusso verso l'interfaccia) si
 * iscrive. Un solo processo, quindi basta un elenco di ascoltatori: niente Redis (regola 9, D28).
 *
 * Un ascoltatore che sbaglia non deve fermare gli altri né chi pubblica: l'errore si scrive nel
 * registro e si va avanti.
 */
@Injectable()
export class EventBus implements OnModuleDestroy {
  private readonly log = new Logger('Eventi');
  private readonly listeners = new Set<Listener>();
  private readonly shutdown = new Subject<void>();

  /** Si completa quando il server si ferma: i flussi aperti devono finire, o la chiusura aspetterebbe per sempre. */
  readonly closing = this.shutdown.asObservable();

  onModuleDestroy(): void {
    this.shutdown.next();
    this.shutdown.complete();
  }

  publish(event: DomainEvent): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(event);
      } catch (error) {
        // Nel registro ci va il tipo dell'evento, non i suoi dati.
        this.log.warn(
          `Un ascoltatore ha fallito su "${event.type}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /** Si iscrive; restituisce come disiscriversi. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

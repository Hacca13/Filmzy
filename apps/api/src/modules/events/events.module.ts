import { Controller, Module, Sse, type MessageEvent } from '@nestjs/common';
import { Observable, takeUntil } from 'rxjs';

import { EventBus } from './event-bus.js';

/** Ogni quanto si manda un segno di vita, perché nessuno tagli un flusso silenzioso (ms). */
export const HEARTBEAT_MS = 25_000;

/**
 * Il flusso degli eventi verso l'interfaccia (T4.4, D67): `GET /api/events`, Server-Sent Events. Ogni
 * evento è una notifica di cambiamento (`job.changed`): l'interfaccia rilegge ciò che le interessa. Il
 * server ascolta solo in locale e rifiuta gli `Host` che non lo sono, come ogni altra rotta.
 */
@Controller('events')
class EventsController {
  constructor(private readonly bus: EventBus) {}

  @Sse()
  stream(): Observable<MessageEvent> {
    const stream = new Observable<MessageEvent>((subscriber) => {
      const unsubscribe = this.bus.subscribe((event) => {
        subscriber.next({ data: event });
      });
      // Un evento con un nome che non è di dominio: l'interfaccia lo ignora.
      const beat = setInterval(() => {
        subscriber.next({ type: 'ping', data: {} });
      }, HEARTBEAT_MS);

      return () => {
        unsubscribe();
        clearInterval(beat);
      };
    });
    // Quando il server si ferma il flusso finisce: senza, una finestra aperta bloccherebbe la chiusura.
    return stream.pipe(takeUntil(this.bus.closing));
  }
}

@Module({
  controllers: [EventsController],
  providers: [EventBus],
  exports: [EventBus],
})
export class EventsModule {}

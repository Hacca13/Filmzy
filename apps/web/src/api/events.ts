import { API_PREFIX, domainEventSchema, type JobChangedEvent } from '@filmzy/contracts';

/**
 * Gli eventi dal server (T4.4, D67): una connessione sola, aperta quando qualcuno li ascolta e chiusa
 * quando non li ascolta più nessuno. Sono notifiche di cambiamento: chi le riceve **rilegge** ciò che gli
 * interessa, invece di fidarsi del messaggio.
 *
 * Se la connessione cade il browser la riapre da solo, ma nel frattempo qualcosa può essere cambiato:
 * a ogni riconnessione si manda `reconnected`, e chi ascolta rilegge tutto.
 */

export type LiveEvent = JobChangedEvent | { type: 'reconnected' };

type Listener = (event: LiveEvent) => void;

const listeners = new Set<Listener>();
let source: EventSource | undefined;
let hasOpened = false;

function emit(event: LiveEvent): void {
  for (const listener of [...listeners]) listener(event);
}

function open(): void {
  // Senza EventSource (per esempio nei test) non c'è flusso: chi ascolta si affida al controllo lento.
  if (source !== undefined || typeof EventSource === 'undefined') return;

  const next = new EventSource(`/${API_PREFIX}/events`);
  next.onopen = () => {
    if (hasOpened) emit({ type: 'reconnected' });
    hasOpened = true;
  };
  next.onmessage = (message: MessageEvent<string>) => {
    let data: unknown;
    try {
      data = JSON.parse(message.data);
    } catch {
      // Un messaggio che non è JSON non è un nostro evento: non c'è niente da rileggere.
      return;
    }
    const event = domainEventSchema.safeParse(data);
    if (event.success && event.data.type === 'job.changed') emit(event.data);
  };
  source = next;
}

function close(): void {
  source?.close();
  source = undefined;
  hasOpened = false;
}

/** Ascolta gli eventi; restituisce come smettere. L'ultimo che smette chiude la connessione. */
export function subscribeEvents(listener: Listener): () => void {
  listeners.add(listener);
  open();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) close();
  };
}

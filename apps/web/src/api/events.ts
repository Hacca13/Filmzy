import { API_PREFIX, domainEventSchema, type JobChangedEvent } from '@filmzy/contracts';

/**
 * Gli eventi dal server (T4.4, D67): una connessione sola, aperta quando qualcuno li ascolta e chiusa
 * quando non li ascolta più nessuno. Sono notifiche di cambiamento: chi le riceve **rilegge** ciò che gli
 * interessa, invece di fidarsi del messaggio.
 *
 * A ogni apertura della connessione (la prima e le successive) si manda `reconnected`: fra la prima
 * lettura e il momento in cui il flusso si apre, o mentre era caduto, può essere cambiato qualcosa, e chi
 * ascolta rilegge tutto. Se il browser rinuncia del tutto (il server non c'era ancora, una risposta
 * sbagliata) si riprova dopo qualche secondo: senza, gli aggiornamenti resterebbero fermi fino a un
 * ricaricamento.
 */

export type LiveEvent = JobChangedEvent | { type: 'reconnected' };

type Listener = (event: LiveEvent) => void;

/** Dopo quanto si riprova ad aprire il flusso se il browser ha rinunciato (ms). */
const REOPEN_AFTER_MS = 3000;

/** Lo stato «chiuso» di un EventSource (`EventSource.CLOSED`), che nei test non esiste come costante. */
const CLOSED = 2;

const listeners = new Set<Listener>();
let source: EventSource | undefined;
let reopenTimer: ReturnType<typeof setTimeout> | undefined;

function emit(event: LiveEvent): void {
  for (const listener of [...listeners]) listener(event);
}

function open(): void {
  // Senza EventSource (per esempio nei test) non c'è flusso: chi ascolta si affida al controllo lento.
  if (source !== undefined || typeof EventSource === 'undefined') return;

  const next = new EventSource(`/${API_PREFIX}/events`);
  next.onopen = () => {
    emit({ type: 'reconnected' });
  };
  next.onerror = () => {
    // Finché il browser sta riprovando da solo non c'è niente da fare; se ha rinunciato, si riparte.
    if (next.readyState !== CLOSED || source !== next) return;
    next.close();
    source = undefined;
    reopenTimer = setTimeout(() => {
      reopenTimer = undefined;
      if (listeners.size > 0) open();
    }, REOPEN_AFTER_MS);
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
  if (reopenTimer !== undefined) clearTimeout(reopenTimer);
  reopenTimer = undefined;
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

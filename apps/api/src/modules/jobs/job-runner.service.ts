import { JOB_INTERRUPTED, type Job, type JobStatus } from '@filmzy/contracts';
import type { EnqueueInput, JobQueue } from '@filmzy/db';
import { Inject, Injectable, Logger, Optional, type OnApplicationShutdown } from '@nestjs/common';

import { JOB_QUEUE } from '../database/database.module.js';
import { EventBus } from '../events/event-bus.js';

/**
 * L'esecutore della coda (architettura §7): chiede alla coda i prossimi lavori, li fa fare a chi
 * sa farli e dice com'è andata. Gira nello stesso processo del server, con un limite di quanti
 * lavori insieme: un computer di casa non deve generare quattro video in parallelo.
 *
 * All'avvio **nessun lavoro riparte**, né quelli a metà né quelli in coda: può costare, e a decidere è
 * l'utente, che paga (D84). Ognuno si chiude con «interrotto» e chi l'aveva chiesto lo scrive sul suo
 * tentativo, così l'interfaccia lo dice e offre di rifarlo. Alla chiusura aspetta quelli in corso, invece
 * di tagliarli di netto.
 */

export type JobHandler = (job: Job) => Promise<void>;

/**
 * Scrive sul tentativo che il lavoro non si farà più e toglie i suoi file provvisori. Non chiama fornitori e
 * non rifà niente. Può essere chiamato due volte, se il programma si chiude anche durante questo giro.
 */
export type JobInterruptedHandler = (job: Job) => void | Promise<void>;

export const JOB_RUNNER_OPTIONS = Symbol('JOB_RUNNER_OPTIONS');

export interface JobRunnerOptions {
  /** Quanti lavori insieme. Pochi: le generazioni sono lunghe e costano. */
  concurrency?: number;
  /** Ogni quanto si guarda la coda, anche senza che nessuno chiami `wake` (ms). */
  pollIntervalMs?: number;
}

/**
 * Gli errori che vale la pena riprovare (§4.10). Tutto il resto si ferma: un rifiuto del
 * contenuto, una chiave sbagliata o un errore del nostro codice non migliorano aspettando, e
 * ritentare costerebbe un'altra generazione.
 */
const RETRYABLE_CODES = new Set(['provider_unavailable', 'timeout', 'rate_limited']);

@Injectable()
export class JobRunner implements OnApplicationShutdown {
  private readonly log = new Logger('Lavori');
  private readonly handlers = new Map<string, JobHandler>();
  private readonly interruptedHandlers = new Map<string, JobInterruptedHandler>();
  private readonly startCleanups: (() => void)[] = [];
  /** Sta chiudendo i lavori interrotti: nessuno deve poterli prendere in quel momento. */
  private closing = false;
  private readonly inFlight = new Set<Promise<void>>();
  private readonly concurrency: number;
  private readonly pollIntervalMs: number;
  private timer: NodeJS.Timeout | undefined;
  private stopping = false;

  constructor(
    @Inject(JOB_QUEUE) private readonly queue: JobQueue,
    @Optional() @Inject(JOB_RUNNER_OPTIONS) options: JobRunnerOptions = {},
    @Optional() private readonly events?: EventBus,
  ) {
    this.concurrency = options.concurrency ?? 2;
    this.pollIntervalMs = options.pollIntervalMs ?? 1000;
  }

  /**
   * Chi sa fare un tipo di lavoro si registra all'avvio del suo modulo, e dice anche come chiuderlo se il
   * programma si ferma prima della fine: è obbligatorio, così nessun lavoro resta aperto per dimenticanza.
   */
  register(kind: string, handler: JobHandler, onInterrupted: JobInterruptedHandler): void {
    if (this.handlers.has(kind)) {
      throw new Error(`C'è già chi fa il lavoro "${kind}".`);
    }
    this.handlers.set(kind, handler);
    this.interruptedHandlers.set(kind, onInterrupted);
  }

  /** I tipi di lavoro registrati: chi prova la regola del riavvio non può dimenticarne uno. */
  registeredKinds(): string[] {
    return [...this.handlers.keys()];
  }

  /** Per ciò che resta aperto senza un lavoro in coda (scontrini, una richiesta non ancora accodata). */
  atStart(cleanup: () => void): void {
    this.startCleanups.push(cleanup);
  }

  /**
   * Fa partire la coda. Lo chiama chi ha già aperto la porta: se un altro Filmzy è aperto la porta è presa, e
   * così non si chiudono come interrotti i lavori che lui sta facendo (D84).
   */
  async start(): Promise<void> {
    await this.closeInterrupted();

    // Il controllo periodico serve quando nessuno chiama `wake`: un lavoro che aspetta un nuovo
    // tentativo (`runAfter` nel futuro) e il prossimo della fila quando uno finisce. Un secondo di
    // ritardo su una generazione che dura minuti non si vede, quindi non serve altro.
    this.timer = setInterval(() => {
      this.wake();
    }, this.pollIntervalMs);
    this.timer.unref();
    this.wake();
  }

  /**
   * I lavori rimasti da fare si chiudono tutti. Prima si scrive sul tentativo e poi si chiude il lavoro: se
   * il programma si chiude a metà di questo giro, al prossimo avvio si riprende da lì. Un lavoro si chiude
   * comunque, anche se scrivere non riesce: se restasse in coda partirebbe, e spenderebbe.
   */
  private async closeInterrupted(): Promise<void> {
    this.closing = true;
    try {
      for (const cleanup of this.startCleanups) {
        try {
          cleanup();
        } catch (error) {
          this.log.error(`Pulizia all'avvio non riuscita: ${errorName(error)}.`);
        }
      }

      const unfinished = this.queue.unfinished();
      for (const job of unfinished) {
        const handler = this.interruptedHandlers.get(job.kind);
        if (handler === undefined) {
          this.log.error(`Nessuno sa chiudere il lavoro "${job.kind}" (${job.id}).`);
        }
        try {
          await handler?.(job);
        } catch (error) {
          this.log.error(
            `Lavoro "${job.kind}" (${job.id}) interrotto, non scritto: ${errorName(error)}.`,
          );
        }
        this.queue.fail(job.id, {
          code: JOB_INTERRUPTED,
          message: 'Il programma si è chiuso prima che il lavoro finisse.',
          retryable: false,
        });
        this.announce(job, 'failed');
      }
      if (unfinished.length > 0) {
        this.log.warn(`${String(unfinished.length)} lavori interrotti: non ripartono da soli.`);
      }
    } finally {
      this.closing = false;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.stopping = true;
    if (this.timer !== undefined) clearInterval(this.timer);
    await this.drain();
  }

  /**
   * Mette un lavoro in coda, lo annuncia («in coda») e dà subito una guardata: è il modo in cui i
   * moduli chiedono un lavoro. L'annuncio serve a chi mostra cosa si sta facendo (la card) anche
   * quando il lavoro deve aspettare il suo turno (T4.4).
   */
  enqueue(input: EnqueueInput): Job {
    const job = this.queue.enqueue(input);
    this.announce(job, 'queued');
    this.wake();
    return job;
  }

  /** Dà una guardata alla coda adesso: lo chiama chi mette un lavoro in coda. */
  wake(): void {
    if (this.stopping || this.closing) return;

    const free = this.concurrency - this.inFlight.size;
    if (free <= 0) return;

    for (const job of this.queue.claim(free)) {
      const promise = this.run(job).finally(() => {
        this.inFlight.delete(promise);
      });
      this.inFlight.add(promise);
    }
  }

  /** Aspetta che i lavori in corso finiscano: serve alla chiusura e ai test. */
  async drain(): Promise<void> {
    while (this.inFlight.size > 0) {
      await Promise.all([...this.inFlight]);
    }
  }

  /**
   * Dice all'interfaccia che il lavoro ha cambiato stato (T4.4): una notifica, non il dato, perché chi
   * la riceve rilegge ciò che gli interessa. Di ciò che il lavoro porta si dice solo a cosa si riferisce.
   */
  private announce(job: Job, status: JobStatus): void {
    const subjectId = subjectOf(job.payload);
    this.events?.publish({
      type: 'job.changed',
      jobId: job.id,
      kind: job.kind,
      status,
      ...(job.projectId === undefined ? {} : { projectId: job.projectId }),
      ...(subjectId === undefined ? {} : { subjectId }),
    });
  }

  private async run(job: Job): Promise<void> {
    const handler = this.handlers.get(job.kind);
    if (handler === undefined) {
      this.log.error(`Nessuno sa fare il lavoro "${job.kind}" (${job.id}).`);
      this.queue.fail(job.id, {
        code: 'config_invalid',
        message: `Nessun modulo sa fare il lavoro "${job.kind}".`,
        retryable: false,
      });
      this.announce(job, 'failed');
      return;
    }

    this.announce(job, 'running');
    try {
      await handler(job);
      this.queue.complete(job.id);
      this.announce(job, 'done');
    } catch (error) {
      const failure = failureOf(error);
      // Nel registro ci va il codice, non i dati del lavoro: potrebbero contenere il testo
      // dell'utente (§11).
      this.log.warn(`Lavoro "${job.kind}" (${job.id}) fallito: ${failure.code}.`);
      // Con un nuovo tentativo il lavoro torna «in coda»; senza, è fallito.
      this.announce(job, this.queue.fail(job.id, failure)?.status ?? 'failed');
    }
  }
}

/** Per il registro: il tipo di errore, mai il messaggio, che può contenere i dati del lavoro. */
const errorName = (error: unknown): string => (error instanceof Error ? error.name : 'errore');

/** Dall'errore di chi esegue al motivo da scrivere nella coda, con il suo codice (§4.10). */
function failureOf(error: unknown): { code: string; message: string; retryable: boolean } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'unknown';

  return {
    code,
    message: error instanceof Error ? error.message : String(error),
    retryable: RETRYABLE_CODES.has(code),
  };
}

/**
 * A cosa si riferisce un lavoro, se lo dice: l'inquadratura, il luogo o il personaggio. Il dato del
 * lavoro è sconosciuto alla coda (lo valida chi lo esegue): qui si guardano solo questi tre id.
 */
function subjectOf(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  for (const key of ['shotId', 'locationId', 'characterId']) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === 'string' && value !== '') return value;
  }
  return undefined;
}

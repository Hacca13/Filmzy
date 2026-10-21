import type { Job } from '@filmzy/contracts';
import type { JobQueue } from '@filmzy/db';
import {
  Inject,
  Injectable,
  Logger,
  Optional,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';

import { JOB_QUEUE } from '../database/database.module.js';

/**
 * L'esecutore della coda (architettura §7): chiede alla coda i prossimi lavori, li fa fare a chi
 * sa farli e dice com'è andata. Gira nello stesso processo del server, con un limite di quanti
 * lavori insieme: un computer di casa non deve generare quattro video in parallelo.
 *
 * All'avvio rimette in coda i lavori rimasti a metà (il programma si era chiuso mentre li faceva)
 * e alla chiusura aspetta quelli in corso, invece di tagliarli di netto.
 */

export type JobHandler = (job: Job) => Promise<void>;

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
export class JobRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly log = new Logger('Lavori');
  private readonly handlers = new Map<string, JobHandler>();
  private readonly inFlight = new Set<Promise<void>>();
  private readonly concurrency: number;
  private readonly pollIntervalMs: number;
  private timer: NodeJS.Timeout | undefined;
  private stopping = false;

  constructor(
    @Inject(JOB_QUEUE) private readonly queue: JobQueue,
    @Optional() @Inject(JOB_RUNNER_OPTIONS) options: JobRunnerOptions = {},
  ) {
    this.concurrency = options.concurrency ?? 2;
    this.pollIntervalMs = options.pollIntervalMs ?? 1000;
  }

  /** Chi sa fare un tipo di lavoro si registra all'avvio del suo modulo. */
  register(kind: string, handler: JobHandler): void {
    if (this.handlers.has(kind)) {
      throw new Error(`C'è già chi fa il lavoro "${kind}".`);
    }
    this.handlers.set(kind, handler);
  }

  onApplicationBootstrap(): void {
    const ripresi = this.queue.recoverRunning();
    if (ripresi > 0) {
      this.log.log(`${String(ripresi)} lavori interrotti rimessi in coda.`);
    }

    // Il controllo periodico serve quando nessuno chiama `wake`: un lavoro che aspetta un nuovo
    // tentativo (`runAfter` nel futuro) e il prossimo della fila quando uno finisce. Un secondo di
    // ritardo su una generazione che dura minuti non si vede, quindi non serve altro.
    this.timer = setInterval(() => {
      this.wake();
    }, this.pollIntervalMs);
    this.timer.unref();
    this.wake();
  }

  async onApplicationShutdown(): Promise<void> {
    this.stopping = true;
    if (this.timer !== undefined) clearInterval(this.timer);
    await this.drain();
  }

  /** Dà una guardata alla coda adesso: lo chiama chi mette un lavoro in coda. */
  wake(): void {
    if (this.stopping) return;

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

  private async run(job: Job): Promise<void> {
    const handler = this.handlers.get(job.kind);
    if (handler === undefined) {
      this.log.error(`Nessuno sa fare il lavoro "${job.kind}" (${job.id}).`);
      this.queue.fail(job.id, {
        code: 'config_invalid',
        message: `Nessun modulo sa fare il lavoro "${job.kind}".`,
        retryable: false,
      });
      return;
    }

    try {
      await handler(job);
      this.queue.complete(job.id);
    } catch (error) {
      const failure = failureOf(error);
      // Nel registro ci va il codice, non i dati del lavoro: potrebbero contenere il testo
      // dell'utente (§11).
      this.log.warn(`Lavoro "${job.kind}" (${job.id}) fallito: ${failure.code}.`);
      this.queue.fail(job.id, failure);
    }
  }
}

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

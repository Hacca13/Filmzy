import { randomUUID } from 'node:crypto';

import type { Job, JobStatus } from '@filmzy/contracts';
import { and, asc, desc, eq, inArray, lte, sql } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { jobs, type JobRow } from './schema.js';

/**
 * La coda dei lavori lunghi (architettura §7): sta in SQLite, quindi sopravvive alla chiusura del
 * programma. Un processo solo la usa (§2), perciò non servono né lease né lock distribuiti: basta
 * una transazione per prendere i lavori senza prenderli due volte.
 *
 * Qui non si esegue niente: questo è il registro. Chi esegue (l'esecutore del server) chiede i
 * prossimi lavori, li fa e dice com'è andata. I tentativi e l'attesa crescente stanno qui, perché
 * sono bookkeeping e devono essere atomici.
 */

export interface EnqueueInput {
  kind: string;
  payload: unknown;
  projectId?: string;
  /** Se c'è e un lavoro con la stessa chiave esiste già, si restituisce quello (regola d'oro 10). */
  idempotencyKey?: string;
  /** Più alta = prima. I lavori con la stessa priorità vanno in ordine di arrivo. */
  priority?: number;
  maxAttempts?: number;
  /** Per far partire un lavoro più tardi. */
  runAfter?: Date;
}

export interface JobFailure {
  code: string;
  message: string;
  /** Se ha senso riprovare lo stesso lavoro: `content_rejected` no, `timeout` sì (§4.10). */
  retryable: boolean;
}

export interface JobQueueOptions {
  now?: () => Date;
  /** L'attesa prima di un nuovo tentativo: raddoppia ogni volta, fino al massimo. */
  retryDelayMs?: number;
  maxRetryDelayMs?: number;
}

export interface JobQueue {
  enqueue: (input: EnqueueInput) => Job;
  /** Prende fino a `limit` lavori pronti e li segna in lavorazione, tutto in una transazione. */
  claim: (limit: number) => Job[];
  complete: (id: string) => Job | undefined;
  fail: (id: string, failure: JobFailure) => Job | undefined;
  cancel: (id: string) => Job | undefined;
  /** Annulla i lavori di un film ancora da fare: serve quando si cancella il film. */
  cancelProject: (projectId: string) => number;
  /**
   * Rimette in coda i lavori rimasti «in lavorazione»: nessuno li sta più facendo, perché il
   * programma si è chiuso mentre erano in corso. Si chiama all'avvio (§7).
   */
  recoverRunning: () => number;
  get: (id: string) => Job | undefined;
  list: (filter?: { status?: JobStatus; projectId?: string; limit?: number }) => Job[];
  counts: () => Record<JobStatus, number>;
}

export function createJobQueue(db: FilmzyDb, options: JobQueueOptions = {}): JobQueue {
  const now = options.now ?? (() => new Date());
  const baseDelay = options.retryDelayMs ?? 5_000;
  const maxDelay = options.maxRetryDelayMs ?? 300_000;

  // Drizzle tipizza `.get()` come se una riga ci fosse sempre. Con `.all()` e la
  // destrutturazione il tipo dice la verità: la riga può non esserci.
  const find = (id: string): JobRow | undefined =>
    db.select().from(jobs).where(eq(jobs.id, id)).limit(1).all()[0];

  return {
    enqueue(input) {
      const at = now().getTime();
      const row: JobRow = {
        id: randomUUID(),
        kind: input.kind,
        status: 'queued',
        payload: JSON.stringify(input.payload ?? null),
        projectId: input.projectId ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
        priority: input.priority ?? 0,
        attempts: 0,
        maxAttempts: input.maxAttempts ?? 3,
        runAfter: input.runAfter?.getTime() ?? at,
        errorCode: null,
        errorMessage: null,
        createdAt: at,
        updatedAt: at,
        startedAt: null,
        finishedAt: null,
      };

      // `onConflictDoNothing` sulla chiave di idempotenza: se il lavoro c'è già si tiene quello,
      // senza farlo contare due volte nella spesa.
      const [inserted] = db.insert(jobs).values(row).onConflictDoNothing().returning().all();
      if (inserted !== undefined) return toJob(inserted);

      const existing =
        input.idempotencyKey === undefined
          ? undefined
          : db
              .select()
              .from(jobs)
              .where(eq(jobs.idempotencyKey, input.idempotencyKey))
              .limit(1)
              .all()[0];

      if (existing === undefined) {
        throw new Error(`Il lavoro "${input.kind}" non è entrato in coda e non c'era già.`);
      }
      return toJob(existing);
    },

    claim(limit) {
      if (limit <= 0) return [];
      const at = now().getTime();

      return db.transaction((tx) => {
        const next = tx
          .select({ id: jobs.id })
          .from(jobs)
          .where(and(eq(jobs.status, 'queued'), lte(jobs.runAfter, at)))
          .orderBy(desc(jobs.priority), asc(jobs.createdAt))
          .limit(limit)
          .all()
          .map((row) => row.id);

        if (next.length === 0) return [];

        const updated = tx
          .update(jobs)
          .set({
            status: 'running',
            attempts: sql`${jobs.attempts} + 1`,
            startedAt: at,
            updatedAt: at,
          })
          .where(inArray(jobs.id, next))
          .returning()
          .all();

        // SQLite non promette in che ordine restituisce le righe aggiornate, e l'ordine qui conta:
        // chi esegue deve iniziare dal lavoro più urgente. Si rimettono nell'ordine scelto sopra.
        const byId = new Map(updated.map((row) => [row.id, row]));
        return next.flatMap((id) => {
          const row = byId.get(id);
          return row === undefined ? [] : [toJob(row)];
        });
      });
    },

    complete(id) {
      const at = now().getTime();
      const [updated] = db
        .update(jobs)
        .set({ status: 'done', finishedAt: at, updatedAt: at, errorCode: null, errorMessage: null })
        .where(eq(jobs.id, id))
        .returning()
        .all();

      return updated === undefined ? undefined : toJob(updated);
    },

    fail(id, failure) {
      const at = now().getTime();
      const job = find(id);
      if (job === undefined) return undefined;

      // Si riprova solo ciò che ha senso riprovare, e sempre sullo stesso servizio (D36): un
      // rifiuto del contenuto o una chiave sbagliata non migliorano aspettando.
      const canRetry = failure.retryable && job.attempts < job.maxAttempts;
      const delay = Math.min(baseDelay * 2 ** Math.max(job.attempts - 1, 0), maxDelay);

      const [updated] = db
        .update(jobs)
        .set({
          status: canRetry ? 'queued' : 'failed',
          runAfter: canRetry ? at + delay : job.runAfter,
          finishedAt: canRetry ? null : at,
          errorCode: failure.code,
          errorMessage: failure.message,
          updatedAt: at,
        })
        .where(eq(jobs.id, id))
        .returning()
        .all();

      return updated === undefined ? undefined : toJob(updated);
    },

    cancel(id) {
      const at = now().getTime();
      const [updated] = db
        .update(jobs)
        .set({ status: 'cancelled', finishedAt: at, updatedAt: at })
        .where(and(eq(jobs.id, id), inArray(jobs.status, ['queued', 'running'])))
        .returning()
        .all();

      return updated === undefined ? undefined : toJob(updated);
    },

    cancelProject(projectId) {
      const at = now().getTime();
      return db
        .update(jobs)
        .set({ status: 'cancelled', finishedAt: at, updatedAt: at })
        .where(and(eq(jobs.projectId, projectId), inArray(jobs.status, ['queued', 'running'])))
        .returning({ id: jobs.id })
        .all().length;
    },

    recoverRunning() {
      const at = now().getTime();
      return db
        .update(jobs)
        .set({ status: 'queued', startedAt: null, runAfter: at, updatedAt: at })
        .where(eq(jobs.status, 'running'))
        .returning({ id: jobs.id })
        .all().length;
    },

    get(id) {
      const row = find(id);
      return row === undefined ? undefined : toJob(row);
    },

    list(filter = {}) {
      const where = [
        ...(filter.status === undefined ? [] : [eq(jobs.status, filter.status)]),
        ...(filter.projectId === undefined ? [] : [eq(jobs.projectId, filter.projectId)]),
      ];

      return db
        .select()
        .from(jobs)
        .where(where.length === 0 ? undefined : and(...where))
        .orderBy(desc(jobs.priority), asc(jobs.createdAt))
        .limit(filter.limit ?? 100)
        .all()
        .map(toJob);
    },

    counts() {
      const rows = db
        .select({ status: jobs.status, quanti: sql<number>`count(*)` })
        .from(jobs)
        .groupBy(jobs.status)
        .all();

      const counts: Record<JobStatus, number> = {
        queued: 0,
        running: 0,
        done: 0,
        failed: 0,
        cancelled: 0,
      };
      for (const row of rows) counts[row.status] = row.quanti;
      return counts;
    },
  };
}

/** Dalla riga del database al lavoro come lo vedono gli altri: tempi in ISO, payload in oggetto. */
function toJob(row: JobRow): Job {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    payload: JSON.parse(row.payload) as unknown,
    ...(row.projectId === null ? {} : { projectId: row.projectId }),
    ...(row.idempotencyKey === null ? {} : { idempotencyKey: row.idempotencyKey }),
    priority: row.priority,
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
    runAfter: new Date(row.runAfter).toISOString(),
    ...(row.errorCode === null ? {} : { errorCode: row.errorCode }),
    ...(row.errorMessage === null ? {} : { errorMessage: row.errorMessage }),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    ...(row.startedAt === null ? {} : { startedAt: new Date(row.startedAt).toISOString() }),
    ...(row.finishedAt === null ? {} : { finishedAt: new Date(row.finishedAt).toISOString() }),
  };
}

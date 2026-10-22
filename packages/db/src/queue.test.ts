import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createJobQueue, type JobQueue } from './queue.js';
import { tempDataDir } from './test.fixtures.js';

/** Un orologio in mano al test: l'attesa crescente si prova senza aspettare davvero. */
function clock(start = Date.UTC(2026, 9, 22, 9, 0, 0)) {
  let at = start;
  return {
    now: () => new Date(at),
    avanza: (ms: number) => {
      at += ms;
    },
  };
}

async function coda(): Promise<{
  aperto: OpenedDatabase;
  queue: JobQueue;
  orologio: ReturnType<typeof clock>;
}> {
  const aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.3.0' });
  const orologio = clock();
  return {
    aperto,
    orologio,
    queue: createJobQueue(aperto.db, {
      now: orologio.now,
      retryDelayMs: 1000,
      maxRetryDelayMs: 4000,
    }),
  };
}

let aperto: OpenedDatabase;
let queue: JobQueue;
let orologio: ReturnType<typeof clock>;

beforeEach(async () => {
  ({ aperto, queue, orologio } = await coda());
  return () => {
    aperto.close();
  };
});

describe('la coda dei lavori (§7)', () => {
  it('mette in coda, consegna e chiude un lavoro', () => {
    const messo = queue.enqueue({ kind: 'take.generate', payload: { shotId: 'shot-1' } });

    expect(messo.status).toBe('queued');
    expect(messo.attempts).toBe(0);

    const [preso] = queue.claim(5);
    expect(preso?.id).toBe(messo.id);
    expect(preso?.status).toBe('running');
    expect(preso?.attempts).toBe(1);
    expect(preso?.payload).toEqual({ shotId: 'shot-1' });

    const chiuso = queue.complete(messo.id);
    expect(chiuso?.status).toBe('done');
    expect(chiuso?.finishedAt).toBeTypeOf('string');
    // Un lavoro chiuso non si prende più.
    expect(queue.claim(5)).toEqual([]);
  });

  it("un lavoro ripetuto non entra due volte (regola d'oro 10)", () => {
    const primo = queue.enqueue({
      kind: 'take.generate',
      payload: { n: 1 },
      idempotencyKey: 'shot-1:abc',
    });
    const secondo = queue.enqueue({
      kind: 'take.generate',
      payload: { n: 2 },
      idempotencyKey: 'shot-1:abc',
    });

    expect(secondo.id).toBe(primo.id);
    expect(secondo.payload).toEqual({ n: 1 });
    expect(queue.counts().queued).toBe(1);
  });

  it('senza chiave di idempotenza due lavori uguali sono due lavori', () => {
    queue.enqueue({ kind: 'take.generate', payload: {} });
    queue.enqueue({ kind: 'take.generate', payload: {} });

    expect(queue.counts().queued).toBe(2);
  });

  it('prima la priorità più alta, poi chi è arrivato per primo', () => {
    const normale = queue.enqueue({ kind: 'a', payload: {} });
    orologio.avanza(10);
    const urgente = queue.enqueue({ kind: 'b', payload: {}, priority: 5 });
    orologio.avanza(10);
    const altro = queue.enqueue({ kind: 'c', payload: {} });

    expect(queue.claim(3).map((job) => job.id)).toEqual([urgente.id, normale.id, altro.id]);
  });

  it('un lavoro con un orario futuro non si consegna prima del tempo', () => {
    const dopo = new Date(orologio.now().getTime() + 60_000);
    queue.enqueue({ kind: 'take.generate', payload: {}, runAfter: dopo });

    expect(queue.claim(5)).toEqual([]);

    orologio.avanza(60_000);
    expect(queue.claim(5)).toHaveLength(1);
  });

  it('un errore su cui vale la pena riprovare torna in coda, con attesa crescente (§4.10)', () => {
    const messo = queue.enqueue({ kind: 'take.generate', payload: {}, maxAttempts: 3 });
    const errore = { code: 'provider_unavailable', message: 'Non risponde.', retryable: true };

    queue.claim(1);
    const primo = queue.fail(messo.id, errore);
    expect(primo?.status).toBe('queued');
    expect(primo?.errorCode).toBe('provider_unavailable');
    // Un secondo di attesa dopo il primo tentativo: non si riprova subito.
    expect(new Date(primo?.runAfter ?? 0).getTime() - orologio.now().getTime()).toBe(1000);
    expect(queue.claim(1)).toEqual([]);

    orologio.avanza(1000);
    queue.claim(1);
    const secondo = queue.fail(messo.id, errore);
    expect(secondo?.status).toBe('queued');
    expect(new Date(secondo?.runAfter ?? 0).getTime() - orologio.now().getTime()).toBe(2000);

    orologio.avanza(2000);
    queue.claim(1);
    const terzo = queue.fail(messo.id, errore);
    // Tre tentativi sono finiti: il lavoro si ferma e dice perché (D36: non si cambia servizio).
    expect(terzo?.status).toBe('failed');
    expect(terzo?.attempts).toBe(3);
    expect(terzo?.finishedAt).toBeTypeOf('string');
  });

  it('un errore su cui non vale la pena riprovare si ferma subito', () => {
    const messo = queue.enqueue({ kind: 'take.generate', payload: {}, maxAttempts: 5 });
    queue.claim(1);

    const fallito = queue.fail(messo.id, {
      code: 'content_rejected',
      message: 'Il servizio ha rifiutato la richiesta.',
      retryable: false,
    });

    expect(fallito?.status).toBe('failed');
    expect(fallito?.attempts).toBe(1);
  });

  it('i lavori di un film si annullano insieme, quelli finiti restano come sono', () => {
    const uno = queue.enqueue({ kind: 'a', payload: {}, projectId: 'film-1' });
    queue.enqueue({ kind: 'b', payload: {}, projectId: 'film-1' });
    const altrofilm = queue.enqueue({ kind: 'c', payload: {}, projectId: 'film-2' });
    queue.claim(1);
    queue.complete(uno.id);

    expect(queue.cancelProject('film-1')).toBe(1);
    expect(queue.get(uno.id)?.status).toBe('done');
    expect(queue.get(altrofilm.id)?.status).toBe('queued');
    expect(queue.list({ projectId: 'film-1', status: 'cancelled' })).toHaveLength(1);
  });

  it('annullare un lavoro già finito non lo tocca', () => {
    const messo = queue.enqueue({ kind: 'a', payload: {} });
    queue.claim(1);
    queue.complete(messo.id);

    expect(queue.cancel(messo.id)).toBeUndefined();
    expect(queue.get(messo.id)?.status).toBe('done');
  });

  it('conta i lavori per stato e li elenca', () => {
    const primo = queue.enqueue({ kind: 'a', payload: {} });
    queue.enqueue({ kind: 'b', payload: {} });
    queue.claim(1);
    queue.fail(primo.id, { code: 'content_rejected', message: 'no', retryable: false });

    expect(queue.counts()).toEqual({ queued: 1, running: 0, done: 0, failed: 1, cancelled: 0 });
    expect(queue.list({ status: 'failed' }).map((job) => job.id)).toEqual([primo.id]);
  });
});

describe('dopo una chiusura del programma (§7)', () => {
  it('un lavoro in corso riparte alla riapertura, senza perdere i tentativi fatti', async () => {
    const dataDir = await tempDataDir();
    const primo = await openFilmzyDatabase({ dataDir, appVersion: '0.3.0' });
    const messo = createJobQueue(primo.db).enqueue({
      kind: 'take.generate',
      payload: { shotId: 'shot-1' },
      idempotencyKey: 'shot-1:abc',
    });
    createJobQueue(primo.db).claim(1);
    // Come se l'utente avesse chiuso l'app mentre il lavoro era in corso.
    primo.close();

    const secondo = await openFilmzyDatabase({ dataDir, appVersion: '0.3.0' });
    const ripresa = createJobQueue(secondo.db);

    expect(ripresa.get(messo.id)?.status).toBe('running');
    expect(ripresa.recoverRunning()).toBe(1);

    const ripreso = ripresa.get(messo.id);
    expect(ripreso?.status).toBe('queued');
    expect(ripreso?.attempts).toBe(1);
    expect(ripreso?.payload).toEqual({ shotId: 'shot-1' });
    expect(ripresa.claim(1).map((job) => job.id)).toEqual([messo.id]);

    secondo.close();
  });
});

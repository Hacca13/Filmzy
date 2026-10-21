import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createJobQueue, openFilmzyDatabase, type JobQueue, type OpenedDatabase } from '@filmzy/db';
import { Logger } from '@nestjs/common';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { JobRunner } from './job-runner.service.js';

/** I test non devono sporcare l'uscita: il registro di Nest si spegne una volta per tutte. */
beforeAll(() => {
  Logger.overrideLogger(false);
});

let aperto: OpenedDatabase;
let queue: JobQueue;
let runner: JobRunner;

beforeEach(async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-api-'));
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  queue = createJobQueue(aperto.db, { retryDelayMs: 1 });
  // Niente controllo periodico nei test: si sveglia a mano, così non ci sono attese.
  runner = new JobRunner(queue, { concurrency: 2, pollIntervalMs: 60_000 });
});

afterEach(async () => {
  await runner.onApplicationShutdown();
  aperto.close();
});

describe("l'esecutore della coda (§7)", () => {
  it('fa il lavoro e lo chiude', async () => {
    const fatti: string[] = [];
    runner.register('prova', (job) => {
      fatti.push(job.id);
      return Promise.resolve();
    });

    const messo = queue.enqueue({ kind: 'prova', payload: { n: 1 } });
    runner.wake();
    await runner.drain();

    expect(fatti).toEqual([messo.id]);
    expect(queue.get(messo.id)?.status).toBe('done');
  });

  it('non fa più lavori insieme di quanti ne può fare', async () => {
    let insieme = 0;
    let massimo = 0;
    const liberi: (() => void)[] = [];

    runner.register('lento', () => {
      insieme += 1;
      massimo = Math.max(massimo, insieme);
      return new Promise<void>((resolve) => {
        liberi.push(() => {
          insieme -= 1;
          resolve();
        });
      });
    });

    for (let i = 0; i < 5; i += 1) queue.enqueue({ kind: 'lento', payload: { i } });
    runner.wake();

    expect(massimo).toBe(2);
    expect(queue.counts().running).toBe(2);
    expect(queue.counts().queued).toBe(3);

    // Liberati i due in corso, al giro dopo ne partono altri due.
    for (const libera of [...liberi]) libera();
    await runner.drain();
    runner.wake();
    expect(queue.counts().running).toBe(2);

    for (const libera of [...liberi]) libera();
    await runner.drain();
  });

  it('un errore tecnico torna in coda, uno no si ferma (§4.10)', async () => {
    runner.register('tecnico', () =>
      Promise.reject(Object.assign(new Error('Il servizio non risponde.'), { code: 'timeout' })),
    );
    runner.register('rifiuto', () =>
      Promise.reject(
        Object.assign(new Error('Contenuto rifiutato.'), { code: 'content_rejected' }),
      ),
    );

    const tecnico = queue.enqueue({ kind: 'tecnico', payload: {}, maxAttempts: 2 });
    const rifiuto = queue.enqueue({ kind: 'rifiuto', payload: {} });
    runner.wake();
    await runner.drain();

    expect(queue.get(tecnico.id)?.status).toBe('queued');
    expect(queue.get(tecnico.id)?.errorCode).toBe('timeout');
    expect(queue.get(rifiuto.id)?.status).toBe('failed');
    expect(queue.get(rifiuto.id)?.errorCode).toBe('content_rejected');
  });

  it('un errore senza codice non si ritenta: sarebbe un errore nostro', async () => {
    runner.register('rotto', () => Promise.reject(new TypeError('x.y non esiste')));

    const messo = queue.enqueue({ kind: 'rotto', payload: {}, maxAttempts: 3 });
    runner.wake();
    await runner.drain();

    expect(queue.get(messo.id)?.status).toBe('failed');
    expect(queue.get(messo.id)?.errorCode).toBe('unknown');
  });

  it('un lavoro che nessuno sa fare si ferma e lo dice', async () => {
    const messo = queue.enqueue({ kind: 'nessuno.lo.fa', payload: {} });
    runner.wake();
    await runner.drain();

    expect(queue.get(messo.id)?.status).toBe('failed');
    expect(queue.get(messo.id)?.errorCode).toBe('config_invalid');
  });

  it("all'avvio rimette in coda i lavori rimasti a metà", async () => {
    const messo = queue.enqueue({ kind: 'prova', payload: {} });
    queue.claim(1); // come se il programma si fosse chiuso qui
    expect(queue.get(messo.id)?.status).toBe('running');

    const fatti: string[] = [];
    runner.register('prova', (job) => {
      fatti.push(job.id);
      return Promise.resolve();
    });
    runner.onApplicationBootstrap();
    await runner.drain();

    expect(fatti).toEqual([messo.id]);
    expect(queue.get(messo.id)?.status).toBe('done');
    expect(queue.get(messo.id)?.attempts).toBe(2);
  });

  it('dopo la chiusura non prende lavori nuovi', async () => {
    runner.register('prova', () => Promise.resolve());
    await runner.onApplicationShutdown();

    const messo = queue.enqueue({ kind: 'prova', payload: {} });
    runner.wake();
    await runner.drain();

    expect(queue.get(messo.id)?.status).toBe('queued');
  });

  it('due moduli non possono fare lo stesso lavoro', () => {
    runner.register('prova', () => Promise.resolve());

    expect(() => {
      runner.register('prova', () => Promise.resolve());
    }).toThrow(/già chi fa/);
  });
});

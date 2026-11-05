import { mkdtemp, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { healthResponseSchema, type HealthResponse } from '@filmzy/contracts';
import { openFilmzyDatabase } from '@filmzy/db';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { startServer, type StartServerOptions } from './start-server.js';
import { CONFIG_DIR } from './test-support/app-client.js';

/** Il server vero, con un database rovinato apposta. Nessun fornitore: si ferma prima. */
const HOST = '127.0.0.1';

/** Una porta libera: quella del server ridotto e quella del programma vero devono essere la stessa. */
function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, HOST, () => {
      const address = probe.address();
      probe.close(() => {
        if (address === null || typeof address === 'string') reject(new Error('niente porta'));
        else resolve(address.port);
      });
    });
  });
}

async function dataDirWith(change: string): Promise<string> {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-avvio-'));
  const opened = await openFilmzyDatabase({ dataDir, appVersion: '1.0.0' });
  // Il tipo non lo dice, ma c'è: serve a rovinare il database apposta, cosa che il programma non fa mai.
  (opened.db as unknown as { $client: { exec: (statement: string) => void } }).$client.exec(change);
  opened.close();
  return dataDir;
}

const TOO_NEW = "update meta set value = '99999' where key = 'schema_version'";
/** Senza il registro delle migrazioni si rifanno tutte da capo, e la prima trova le tabelle già lì. */
const BROKEN = `drop table __drizzle_migrations;
  update meta set value = '1' where key = 'schema_version'`;

const closers: (() => Promise<unknown>)[] = [];

afterEach(async () => {
  await Promise.all(closers.splice(0).map((close) => close()));
  vi.restoreAllMocks();
});

async function started(dataDir: string, extra: Partial<StartServerOptions> = {}) {
  const port = await freePort();
  const base = `http://${HOST}:${String(port)}/api`;
  const running = startServer({
    port,
    host: HOST,
    appOptions: { logger: false, dataDir, configDir: CONFIG_DIR, environment: 'offline' },
    ...extra,
  });
  closers.push(async () => {
    // Se è ancora bloccato gli si chiede di riprovare col database sistemato, così si chiude tutto.
    await (await running).close();
  });
  return { base, running };
}

async function healthOf(base: string): Promise<HealthResponse> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const reply = await fetch(`${base}/health`);
      if (reply.ok) return healthResponseSchema.parse(await reply.json());
    } catch {
      // Sta ancora partendo, o si sta spegnendo per riprovare: si aspetta.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('il server non ha mai risposto');
}

async function fixAndRetry(base: string, dataDir: string, running: Promise<unknown>) {
  await rm(path.join(dataDir, 'filmzy.db'), { force: true });
  await rm(path.join(dataDir, 'filmzy.db-wal'), { force: true });
  await rm(path.join(dataDir, 'filmzy.db-shm'), { force: true });
  await fetch(`${base}/startup/retry`, { method: 'POST' });
  await running;
}

describe('quando i dati non si aprono', () => {
  it('con dati di una versione più nuova resta acceso e lo dice, senza toccarli', async () => {
    const dataDir = await dataDirWith(TOO_NEW);
    const { base, running } = await started(dataDir);

    expect(await healthOf(base)).toEqual({
      status: 'blocked',
      block: { reason: 'database_too_new' },
    });
    // Tutto il resto non c'è: il programma non lavora su dati che non può leggere.
    expect((await fetch(`${base}/projects`)).status).toBe(404);

    await fixAndRetry(base, dataDir, running);
  }, 60_000);

  it('con un aggiornamento fallito dice dov’è la copia di sicurezza', async () => {
    const dataDir = await dataDirWith(BROKEN);
    const { base, running } = await started(dataDir);

    const health = await healthOf(base);

    expect(health).toEqual({
      status: 'blocked',
      block: {
        reason: 'migration_failed',
        backupFile: path.join(dataDir, 'filmzy.db.backup-1.0.0'),
      },
    });
    expect((await stat(path.join(dataDir, 'filmzy.db.backup-1.0.0'))).size).toBeGreaterThan(0);

    await fixAndRetry(base, dataDir, running);
  }, 60_000);

  it('«Riprova» non fa finta: se è ancora rotto torna a dirlo', async () => {
    const dataDir = await dataDirWith(TOO_NEW);
    const { base, running } = await started(dataDir);
    await healthOf(base);

    await fetch(`${base}/startup/retry`, { method: 'POST' });

    expect((await healthOf(base)).status).toBe('blocked');
    await fixAndRetry(base, dataDir, running);
  }, 60_000);

  it('«Riprova» con i dati a posto fa partire il programma vero, sulla stessa porta', async () => {
    const dataDir = await dataDirWith(TOO_NEW);
    const { base, running } = await started(dataDir);
    await healthOf(base);

    await fixAndRetry(base, dataDir, running);

    expect(await healthOf(base)).toEqual({ status: 'ok' });
    expect((await fetch(`${base}/projects`)).status).toBe(200);
  }, 60_000);

  it('«Apri la cartella» apre quella della copia, e un guasto ha il suo codice', async () => {
    const dataDir = await dataDirWith(BROKEN);
    const opener = vi.fn<(folder: string) => Promise<void>>().mockResolvedValue(undefined);
    const { base, running } = await started(dataDir, { opener });
    await healthOf(base);

    const opened = await fetch(`${base}/startup/folder`, { method: 'POST' });

    expect(opened.status).toBe(204);
    expect(opener).toHaveBeenCalledWith(dataDir);

    opener.mockRejectedValueOnce(new Error('niente'));
    const failed = await fetch(`${base}/startup/folder`, { method: 'POST' });
    expect(failed.status).toBe(500);
    expect(await failed.json()).toMatchObject({
      code: 'media_failed',
      details: { field: 'folder' },
    });

    await fixAndRetry(base, dataDir, running);
  }, 60_000);

  it('una richiesta che non viene da questo computer si rifiuta anche qui', async () => {
    const dataDir = await dataDirWith(TOO_NEW);
    const { base, running } = await started(dataDir);
    await healthOf(base);

    const reply = await hostileRequest(base);

    expect(reply).toBe(403);
    await fixAndRetry(base, dataDir, running);
  }, 60_000);
});

/** `fetch` non lascia cambiare `Host`: serve la richiesta a mano. */
async function hostileRequest(base: string): Promise<number> {
  const { request } = await import('node:http');
  const url = new URL(`${base}/health`);
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: { host: 'cattivo.example' },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    );
    req.once('error', reject);
    req.end();
  });
}

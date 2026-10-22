import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { DatabaseError } from './errors.js';
import { openFilmzyDatabase } from './open.js';
import { databaseFile } from './paths.js';
import { jobs, meta } from './schema.js';
import { firstMigrationSql, tempDataDir, writeMigrations } from './test.fixtures.js';

/** Una seconda migrazione innocua: basta che cambi qualcosa nel database. */
const SECONDA = 'CREATE TABLE `prova` (`id` text PRIMARY KEY NOT NULL);';
const ROTTA = 'CREATE TABLE sbagliata (';

async function esiste(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

describe('apertura del database (§6.2)', () => {
  it('crea la cartella e il database, applica le migrazioni e scrive le versioni', async () => {
    const dataDir = path.join(await tempDataDir(), 'dati');
    const aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.3.0' });

    expect(aperto.file).toBe(databaseFile(dataDir));
    // La versione dello schema è il numero di migrazioni del pacchetto: cresce con loro.
    expect(aperto.schemaVersion).toBeGreaterThanOrEqual(2);
    expect(aperto.backupFile).toBeUndefined();

    const righe = aperto.db.select().from(meta).all();
    expect(Object.fromEntries(righe.map((r) => [r.key, r.value]))).toEqual({
      schema_version: String(aperto.schemaVersion),
      app_version: '0.3.0',
    });

    // Le tabelle del task ci sono davvero.
    expect(aperto.db.select().from(jobs).all()).toEqual([]);
    aperto.close();
  });

  it('riaprire non cambia niente e non fa copie', async () => {
    const dataDir = await tempDataDir();
    const primo = await openFilmzyDatabase({ dataDir, appVersion: '0.3.0' });
    primo.close();

    const secondo = await openFilmzyDatabase({ dataDir, appVersion: '0.3.1' });
    expect(secondo.backupFile).toBeUndefined();
    expect(secondo.schemaVersion).toBe(primo.schemaVersion);
    // La versione del programma si aggiorna a ogni avvio: serve a capire chi ha scritto.
    expect(
      secondo.db
        .select()
        .from(meta)
        .where(sql`key = 'app_version'`)
        .get()?.value,
    ).toBe('0.3.1');
    secondo.close();
  });

  it('una migrazione nuova lascia una copia di sicurezza prima di toccare i dati (D44)', async () => {
    const dataDir = await tempDataDir();
    const base = await writeMigrations(path.join(dataDir, 'mig-1'), [await firstMigrationSql()]);
    const dopo = await writeMigrations(path.join(dataDir, 'mig-2'), [
      await firstMigrationSql(),
      SECONDA,
    ]);

    const primo = await openFilmzyDatabase({
      dataDir,
      appVersion: '0.3.0',
      migrationsDir: base,
    });
    primo.db
      .insert(jobs)
      .values({
        id: 'job-1',
        kind: 'take.generate',
        status: 'queued',
        payload: '{}',
        runAfter: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .run();
    primo.close();

    const secondo = await openFilmzyDatabase({
      dataDir,
      appVersion: '0.4.0',
      migrationsDir: dopo,
    });

    expect(secondo.schemaVersion).toBe(2);
    expect(secondo.backupFile).toBe(path.join(dataDir, 'filmzy.db.backup-0.3.0'));
    expect(await esiste(secondo.backupFile ?? '')).toBe(true);
    // I dati di prima sono ancora lì, e la tabella nuova esiste.
    expect(secondo.db.select().from(jobs).all()).toHaveLength(1);
    secondo.close();
  });

  it('se la migrazione fallisce si torna alla copia e i dati sono quelli di prima (D44)', async () => {
    const dataDir = await tempDataDir();
    const base = await writeMigrations(path.join(dataDir, 'mig-1'), [await firstMigrationSql()]);
    const rotte = await writeMigrations(path.join(dataDir, 'mig-rotte'), [
      await firstMigrationSql(),
      ROTTA,
    ]);

    const primo = await openFilmzyDatabase({ dataDir, appVersion: '0.3.0', migrationsDir: base });
    primo.db
      .insert(jobs)
      .values({
        id: 'job-1',
        kind: 'take.generate',
        status: 'queued',
        payload: '{}',
        runAfter: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .run();
    primo.close();

    await expect(
      openFilmzyDatabase({ dataDir, appVersion: '0.4.0', migrationsDir: rotte }),
    ).rejects.toMatchObject({ code: 'migration_failed' });

    // Il programma riparte con la versione di prima e ritrova il suo lavoro.
    const ripartito = await openFilmzyDatabase({
      dataDir,
      appVersion: '0.3.0',
      migrationsDir: base,
    });
    expect(ripartito.db.select().from(jobs).all()).toHaveLength(1);
    ripartito.close();
  });

  it('un database scritto da una versione più nuova non si apre (D44)', async () => {
    const dataDir = await tempDataDir();
    const aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.9.0' });
    // Come se l'avesse scritto una versione futura, con più migrazioni.
    aperto.db
      .update(meta)
      .set({ value: '99' })
      .where(sql`key = 'schema_version'`)
      .run();
    aperto.close();

    await expect(openFilmzyDatabase({ dataDir, appVersion: '0.3.0' })).rejects.toMatchObject({
      code: 'database_too_new',
    });
  });

  it('senza le migrazioni lo dice chiaro, invece di aprire un database vuoto', async () => {
    const dataDir = await tempDataDir();
    const vuota = path.join(dataDir, 'niente');
    await mkdir(vuota, { recursive: true });

    const errore = await openFilmzyDatabase({
      dataDir,
      appVersion: '0.3.0',
      migrationsDir: vuota,
    }).catch((error: unknown) => error);

    expect(errore).toBeInstanceOf(DatabaseError);
    expect((errore as DatabaseError).code).toBe('config_invalid');
    // Il database non si crea nemmeno: non c'è niente da aprire.
    expect(await esiste(databaseFile(dataDir))).toBe(false);
  });
});

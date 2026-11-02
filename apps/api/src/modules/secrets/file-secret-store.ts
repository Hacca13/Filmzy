import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { SecretStore } from '@filmzy/troupe';
import { Logger } from '@nestjs/common';

import type { SecretCipher } from './secret-cipher.js';

/**
 * Le chiavi dei fornitori in un file cifrato nella cartella dati, **non** nel database (D45): una
 * copia del database gira e le chiavi non devono uscire con lei.
 *
 * Il file è un blob solo, cifrato per intero dal `SecretCipher`. Si legge una volta e si tiene in
 * memoria: il processo è uno solo e il file piccolo. I valori non finiscono mai in un messaggio né
 * in un log (D25): gli errori nominano il file, mai il contenuto.
 */
export class SecretStoreError extends Error {
  readonly code = 'secret_store_unavailable';

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SecretStoreError';
  }
}

type LoadedSecrets = { values: Map<string, string> } | { problem: string };

export class FileSecretStore implements SecretStore {
  private readonly log = new Logger('Chiavi');
  private loaded: LoadedSecrets | undefined;

  constructor(
    private readonly file: string,
    private readonly cipher: SecretCipher,
  ) {}

  /** Si possono scrivere chiavi solo se c'è il portachiavi del sistema. */
  get writable(): boolean {
    return this.cipher.isAvailable();
  }

  has(name: string): boolean {
    return this.read().get(name) !== undefined;
  }

  get(name: string): string | undefined {
    return this.read().get(name);
  }

  /** I nomi delle chiavi salvate, mai i valori. */
  names(): string[] {
    return [...this.read().keys()];
  }

  set(name: string, value: string): void {
    const values = new Map(this.writableValues());
    values.set(name, value);
    this.persist(values);
  }

  delete(name: string): void {
    const values = new Map(this.writableValues());
    if (values.delete(name)) this.persist(values);
  }

  /** Per leggere: un file che non si apre vale «nessuna chiave», ma lo si dice nel registro. */
  private read(): Map<string, string> {
    const loaded = this.load();
    return 'values' in loaded ? loaded.values : new Map<string, string>();
  }

  /**
   * Per scrivere: se il file c'è ma non si legge, non lo si sovrascrive. Le altre chiavi che
   * conteneva andrebbero perse senza che nessuno l'abbia deciso.
   */
  private writableValues(): Map<string, string> {
    if (!this.writable) {
      throw new SecretStoreError('Il portachiavi del sistema non è disponibile.');
    }

    const loaded = this.load();
    if ('problem' in loaded) {
      throw new SecretStoreError(`Il file delle chiavi non si legge: ${loaded.problem}`);
    }
    return loaded.values;
  }

  private load(): LoadedSecrets {
    this.loaded ??= this.readFromDisk();
    return this.loaded;
  }

  private readFromDisk(): LoadedSecrets {
    let blob: Buffer;
    try {
      blob = readFileSync(this.file);
    } catch (error) {
      if (isMissingFile(error)) return { values: new Map<string, string>() };
      return this.unreadable('il file non si apre');
    }

    // Con un file ma senza portachiavi non si può decifrare: lo stato è «non disponibile», non
    // «vuoto», così `set` non lo calpesta (si fermerebbe comunque prima, su `writable`).
    if (!this.cipher.isAvailable()) return { values: new Map<string, string>() };

    try {
      return { values: parseSecrets(this.cipher.decrypt(blob)) };
    } catch {
      // Non si riporta la causa: potrebbe contenere pezzi del file.
      return this.unreadable('contenuto non valido');
    }
  }

  private unreadable(reason: string): LoadedSecrets {
    this.log.error(`Il file delle chiavi (${this.file}) non si legge: ${reason}.`);
    return { problem: reason };
  }

  private persist(values: Map<string, string>): void {
    const temporary = `${this.file}.tmp`;
    try {
      mkdirSync(path.dirname(this.file), { recursive: true });
      const blob = this.cipher.encrypt(JSON.stringify(Object.fromEntries(values)));
      // Prima su un file accanto, poi si sostituisce: una chiusura a metà non lascia metà file.
      writeFileSync(temporary, blob, { mode: 0o600 });
      renameSync(temporary, this.file);
    } catch (cause) {
      // Si ripulisce il file a metà; se non c'è più, tanto meglio.
      rmSync(temporary, { force: true });
      throw new SecretStoreError('Non riesco a salvare il file delle chiavi.', { cause });
    }

    this.loaded = { values };
  }
}

function parseSecrets(text: string): Map<string, string> {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('forma sbagliata');
  }

  const values = new Map<string, string>();
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') throw new Error('forma sbagliata');
    values.set(name, value);
  }
  return values;
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

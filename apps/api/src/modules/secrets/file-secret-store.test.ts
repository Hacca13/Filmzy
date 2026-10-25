import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { Logger } from '@nestjs/common';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { FileSecretStore, SecretStoreError } from './file-secret-store.js';
import { unavailableCipher, type SecretCipher } from './secret-cipher.js';

beforeAll(() => {
  Logger.overrideLogger(false);
});

/** Un cifrario finto ma reversibile: basta a provare che sul disco non resta il testo in chiaro. */
const fakeCipher: SecretCipher = {
  isAvailable: () => true,
  encrypt: (plain) => Buffer.from(`cifrato:${Buffer.from(plain).toString('base64')}`),
  decrypt: (data) => {
    const text = data.toString();
    if (!text.startsWith('cifrato:')) throw new Error('non è cifrato da noi');
    return Buffer.from(text.slice('cifrato:'.length), 'base64').toString();
  },
};

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'filmzy-chiavi-'));
  file = path.join(dir, 'chiavi.dat');
});

describe('FileSecretStore', () => {
  it('senza file non ci sono chiavi', () => {
    const store = new FileSecretStore(file, fakeCipher);

    expect(store.has('FAL_KEY')).toBe(false);
    expect(store.get('FAL_KEY')).toBeUndefined();
    expect(store.names()).toEqual([]);
  });

  it('una chiave salvata si rilegge, anche da un altro avvio', () => {
    new FileSecretStore(file, fakeCipher).set('FAL_KEY', 'fal-segreta-1234');

    const next = new FileSecretStore(file, fakeCipher);
    expect(next.has('FAL_KEY')).toBe(true);
    expect(next.get('FAL_KEY')).toBe('fal-segreta-1234');
    expect(next.names()).toEqual(['FAL_KEY']);
  });

  it('sul disco la chiave non è in chiaro', async () => {
    new FileSecretStore(file, fakeCipher).set('FAL_KEY', 'fal-segreta-1234');

    expect(await readFile(file, 'utf8')).not.toContain('fal-segreta-1234');
  });

  it('salvare una chiave non tocca le altre; cancellarla la toglie', () => {
    const store = new FileSecretStore(file, fakeCipher);
    store.set('FAL_KEY', 'uno');
    store.set('ANTHROPIC_API_KEY', 'due');
    store.delete('FAL_KEY');

    const next = new FileSecretStore(file, fakeCipher);
    expect(next.names()).toEqual(['ANTHROPIC_API_KEY']);
    expect(next.get('ANTHROPIC_API_KEY')).toBe('due');
  });

  it("cancellare una chiave che non c'è non fa niente", () => {
    expect(() => {
      new FileSecretStore(file, fakeCipher).delete('NON_C_E');
    }).not.toThrow();
  });

  it('non lascia file a metà accanto a quello delle chiavi', async () => {
    new FileSecretStore(file, fakeCipher).set('FAL_KEY', 'uno');

    expect(await readdir(dir)).toEqual(['chiavi.dat']);
  });

  describe('senza portachiavi del sistema (prima di Electron, D45)', () => {
    it('non si può scrivere, e lo dice con il codice giusto', () => {
      const store = new FileSecretStore(file, unavailableCipher);

      expect(store.writable).toBe(false);
      expect(() => {
        store.set('FAL_KEY', 'uno');
      }).toThrow(SecretStoreError);
      expect(store.has('FAL_KEY')).toBe(false);
    });

    it('non crea nessun file', async () => {
      const store = new FileSecretStore(file, unavailableCipher);
      try {
        store.set('FAL_KEY', 'uno');
      } catch {
        // Atteso: qui interessa solo che non resti niente sul disco.
      }

      expect(await readdir(dir)).toEqual([]);
    });
  });

  describe('file rovinato', () => {
    beforeEach(async () => {
      await writeFile(file, "questo non l'ha scritto Filmzy");
    });

    it('si legge come «nessuna chiave», senza lanciare', () => {
      const store = new FileSecretStore(file, fakeCipher);

      expect(store.has('FAL_KEY')).toBe(false);
    });

    it("non lo si sovrascrive, e l'errore non porta il contenuto del file", async () => {
      const store = new FileSecretStore(file, fakeCipher);

      let caught: unknown;
      try {
        store.set('FAL_KEY', 'uno');
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(SecretStoreError);
      expect((caught as SecretStoreError).code).toBe('secret_store_unavailable');
      expect((caught as SecretStoreError).message).not.toContain('Filmzy');
      expect(await readFile(file, 'utf8')).toBe("questo non l'ha scritto Filmzy");
    });
  });

  it('se non riesce a scrivere lo dice e non lascia niente a metà', async () => {
    // Un file dove dovrebbe stare la cartella: `mkdir` fallisce su ogni sistema, anche con i
    // permessi di amministratore.
    const blocker = path.join(dir, 'occupato');
    await writeFile(blocker, 'file');
    const store = new FileSecretStore(path.join(blocker, 'chiavi.dat'), fakeCipher);

    expect(() => {
      store.set('FAL_KEY', 'uno');
    }).toThrow(SecretStoreError);
    expect(store.has('FAL_KEY')).toBe(false);
    expect(await readdir(dir)).toEqual(['occupato']);
  });
});

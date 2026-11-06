import { createServer, type Server } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { keychainCipher } from './keychain.js';
import { linkTarget } from './links.js';
import { loadingPage } from './loading.js';
import { freePort } from './port.js';

describe('la porta', () => {
  const taken: Server[] = [];

  afterEach(async () => {
    await Promise.all(
      taken.splice(0).map(
        (server) =>
          new Promise((resolve) => {
            server.close(resolve);
          }),
      ),
    );
  });

  const occupy = (port: number) =>
    new Promise<void>((resolve) => {
      const server = createServer();
      taken.push(server);
      server.listen(port, '127.0.0.1', resolve);
    });

  it('è quella di sempre se è libera, la successiva se un altro programma la usa', async () => {
    const preferred = await freePort(45_100, '127.0.0.1');
    expect(await freePort(preferred, '127.0.0.1')).toBe(preferred);

    await occupy(preferred);

    expect(await freePort(preferred, '127.0.0.1')).toBe(preferred + 1);
  });

  it('se sono tutte occupate lo dice', async () => {
    const preferred = await freePort(45_200, '127.0.0.1');
    await occupy(preferred);

    await expect(freePort(preferred, '127.0.0.1', 1)).rejects.toThrow('Nessuna porta libera');
  });
});

describe('i link', () => {
  const base = 'http://127.0.0.1:41731';

  it('il programma resta nella finestra, il resto va nel browser del sistema', () => {
    expect(linkTarget('http://127.0.0.1:41731/#/film/1', base)).toBe('app');
    expect(linkTarget('https://console.anthropic.com/settings/keys', base)).toBe('browser');
    expect(linkTarget('http://127.0.0.1:3001/', base)).toBe('browser');
  });

  it('schemi che aprirebbero file o codice non si aprono', () => {
    expect(linkTarget('file:///C:/Windows/system32/calc.exe', base)).toBe('blocked');
    expect(linkTarget('javascript:alert(1)', base)).toBe('blocked');
    expect(linkTarget('non è un indirizzo', base)).toBe('blocked');
  });
});

describe('il portachiavi', () => {
  it('cifra e decifra con quello del sistema, e dice se c’è', () => {
    const cipher = keychainCipher({
      isEncryptionAvailable: () => true,
      encryptString: (plain) => Buffer.from(Buffer.from(plain).map((byte) => byte ^ 0x2a)),
      decryptString: (data) => Buffer.from(data.map((byte) => byte ^ 0x2a)).toString(),
    });

    expect(cipher.isAvailable()).toBe(true);
    expect(cipher.decrypt(cipher.encrypt('chiave'))).toBe('chiave');
    expect(cipher.encrypt('chiave').toString()).not.toBe('chiave');
  });
});

describe('la pagina di attesa', () => {
  it('dice che Filmzy si sta preparando, coi colori dell’interfaccia', () => {
    const page = decodeURIComponent(loadingPage());

    expect(page).toContain('Sto preparando Filmzy…');
    expect(page).toContain('#111211');
  });
});

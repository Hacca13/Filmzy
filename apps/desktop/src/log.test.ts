import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createFileLog, describeFailure, nestLogger, withoutHome } from './log.js';

const folder = () => mkdtemp(path.join(tmpdir(), 'filmzy-registro-'));
const at = new Date('2026-11-06T10:00:00.000Z');

describe('il registro', () => {
  it('scrive una riga per evento, in un file al giorno', async () => {
    const dir = await folder();
    const log = createFileLog({ folder: dir, now: () => at, home: '' });

    log.write('info', 'Avvio', 'Pronto.');
    log.write('error', 'Finestra', 'La pagina non risponde.');

    const text = await readFile(path.join(dir, 'filmzy-2026-11-06.log'), 'utf8');
    expect(text.split('\n')).toEqual([
      '2026-11-06T10:00:00.000Z INFO [Avvio] Pronto.',
      '2026-11-06T10:00:00.000Z ERROR [Finestra] La pagina non risponde.',
      '',
    ]);
  });

  it('non porta il nome dell’utente: la sua cartella diventa ~', () => {
    expect(withoutHome('Dati in C:\\Users\\Mario\\AppData\\Filmzy', 'C:\\Users\\Mario')).toBe(
      'Dati in ~\\AppData\\Filmzy',
    );
    expect(withoutHome('file:///c:/users/mario/x.png', 'C:\\Users\\Mario')).toBe('file:///~/x.png');
  });

  it('i file vecchi si tolgono, gli altri restano', async () => {
    const dir = await folder();
    await writeFile(path.join(dir, 'filmzy-2026-10-01.log'), 'vecchio');
    await writeFile(path.join(dir, 'filmzy-2026-11-01.log'), 'recente');
    await writeFile(path.join(dir, 'altro.txt'), 'non è del registro');

    createFileLog({ folder: dir, now: () => at, keepDays: 14 });

    expect((await readdir(dir)).sort()).toEqual(['altro.txt', 'filmzy-2026-11-01.log']);
  });

  it('un errore porta il suo stack; il resto si scrive com’è', () => {
    expect(describeFailure(new Error('rotto'))).toContain('Error: rotto');
    expect(describeFailure('testo')).toBe('testo');
    expect(describeFailure({ code: 'x' })).toBe('{"code":"x"}');
  });

  it('i messaggi del server finiscono nello stesso file, col loro contesto', async () => {
    const dir = await folder();
    const logger = nestLogger(createFileLog({ folder: dir, now: () => at, home: '' }));

    logger.warn('Una copia non si è aperta.', 'Copia del film');
    logger.error('Qualcosa è andato storto', 'lo stack', 'Server');
    logger.debug?.('non serve');
    logger.log('Mapped {/api/health, GET} route', 'RouterExplorer');

    const text = await readFile(path.join(dir, 'filmzy-2026-11-06.log'), 'utf8');
    expect(text).toContain('WARN [Copia del film] Una copia non si è aperta.');
    expect(text).toContain('ERROR [Server] Qualcosa è andato storto\nlo stack');
    expect(text).not.toContain('non serve');
    expect(text).not.toContain('Mapped');
  });
});

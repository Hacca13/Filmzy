import { MediaError } from '@filmzy/media';
import { describe, expect, it } from 'vitest';

import {
  exportFileName,
  failureReason,
  fileErrorCode,
  launch,
  openFolderCommand,
  qualitiesFor,
} from './export-files.js';

describe('il nome del file', () => {
  it('viene dal titolo, con la qualità', () => {
    expect(exportFileName('L’ultima corsa', 1080)).toBe('L’ultima corsa - 1080p.mp4');
  });

  it('un titolo non può uscire dalla cartella né usare caratteri vietati', () => {
    expect(exportFileName('../../segreti', 720)).toBe('segreti - 720p.mp4');
    expect(exportFileName('a:b*c?"d<e>f|g\\h/i', 720)).toBe('a b c d e f g h i - 720p.mp4');
    expect(exportFileName('riga\ndue', 720)).toBe('riga due - 720p.mp4');
  });

  it('un punto davanti non resta: nasconderebbe il file', () => {
    expect(exportFileName('.nascosto', 720)).toBe('nascosto - 720p.mp4');
  });

  it('i nomi riservati di Windows vanno bene: col resto del nome non sono più riservati', () => {
    expect(exportFileName('Con', 720)).toBe('Con - 720p.mp4');
  });

  it('un titolo inservibile diventa «Film»', () => {
    expect(exportFileName('???', 720)).toBe('Film - 720p.mp4');
    expect(exportFileName('...', 720)).toBe('Film - 720p.mp4');
  });
});

describe('le qualità possibili', () => {
  const standard = [1080, 720, 480];

  it('la prima è quella del film, poi le standard più basse', () => {
    expect(qualitiesFor({ width: 1920, height: 1080 }, standard)).toEqual([1080, 720, 480]);
    expect(qualitiesFor({ width: 1280, height: 720 }, standard)).toEqual([720, 480]);
  });

  it('una misura fuori standard si offre così com’è, e sopra il film non si va', () => {
    expect(qualitiesFor({ width: 1920, height: 800 }, standard)).toEqual([800, 720, 480]);
    expect(qualitiesFor({ width: 64, height: 36 }, standard)).toEqual([36]);
  });

  it('in un film verticale conta la larghezza', () => {
    expect(qualitiesFor({ width: 720, height: 1280 }, standard)).toEqual([720, 480]);
  });
});

describe('il motivo di un errore del file system', () => {
  it('dice se il disco è pieno', () => {
    expect(fileErrorCode({ code: 'ENOSPC' })).toBe('disk_full');
  });

  it('un errore di permessi vuol dire «file aperto» solo mentre si sostituisce il file', () => {
    expect(fileErrorCode({ code: 'EPERM' }, true)).toBe('file_in_use');
    expect(fileErrorCode({ code: 'EACCES' }, true)).toBe('file_in_use');
    expect(fileErrorCode({ code: 'EPERM' })).toBe('no_permission');
    expect(fileErrorCode({ code: 'EACCES' })).toBe('no_permission');
    expect(fileErrorCode({ code: 'EBUSY' })).toBe('file_in_use');
  });

  it('il resto resta sconosciuto', () => {
    expect(fileErrorCode({ code: 'EIO' })).toBe('unknown');
    expect(fileErrorCode(new Error('x'))).toBe('unknown');
    expect(fileErrorCode(undefined)).toBe('unknown');
  });
});

describe('il motivo per il registro', () => {
  it('toglie il percorso dei dati, che porta il nome dell’utente', () => {
    const error = new MediaError('ffmpeg_failed', 'Non apro C:/Utenti/anna/dati/film.mp4');

    expect(failureReason(error, 'C:/Utenti/anna/dati')).toBe(
      'ffmpeg_failed: Non apro <dati>/film.mp4',
    );
  });

  it('di un errore del file system tiene solo il codice', () => {
    expect(failureReason({ code: 'EIO', message: 'C:/Utenti/anna' }, 'x')).toBe('unknown (EIO)');
    expect(failureReason(new Error('C:/Utenti/anna'), 'x')).toBe('unknown');
  });
});

describe('aprire una cartella', () => {
  it('usa il comando del sistema, con il percorso a parte', () => {
    expect(openFolderCommand('win32', 'C:\\a b')).toEqual(['explorer.exe', 'C:\\a b']);
    expect(openFolderCommand('darwin', '/a b')).toEqual(['open', '/a b']);
    expect(openFolderCommand('linux', '/a b')).toEqual(['xdg-open', '/a b']);
  });

  const exitingWith = (code: number) => ['-e', `process.exit(${String(code)})`];

  it('un programma che esce bene è riuscito', async () => {
    await expect(
      launch(process.execPath, exitingWith(0), { ignoreExitCode: false }),
    ).resolves.toBeUndefined();
  }, 20_000);

  it('un programma che esce con un errore non ha aperto niente, e lo dice', async () => {
    await expect(
      launch(process.execPath, exitingWith(3), { ignoreExitCode: false }),
    ).rejects.toThrow('codice 3');
  }, 20_000);

  it('per chi esce con un errore anche quando va bene, conta solo che parta', async () => {
    await expect(
      launch(process.execPath, exitingWith(1), { ignoreExitCode: true }),
    ).resolves.toBeUndefined();
  }, 20_000);

  it('un programma che non c’è dà un errore, in entrambi i modi', async () => {
    const missing = 'filmzy-comando-che-non-esiste';

    await expect(launch(missing, [], { ignoreExitCode: false })).rejects.toThrow();
    await expect(launch(missing, [], { ignoreExitCode: true })).rejects.toThrow();
  }, 20_000);
});

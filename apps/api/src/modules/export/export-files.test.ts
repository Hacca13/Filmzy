import { describe, expect, it } from 'vitest';

import { exportFileName, fileErrorCode, openFolderCommand, qualitiesFor } from './export-files.js';

describe('il nome del file', () => {
  it('viene dal titolo, con la qualità', () => {
    expect(exportFileName('L’ultima corsa', 1080)).toBe('L’ultima corsa - 1080p.mp4');
  });

  it('un titolo non può uscire dalla cartella né usare caratteri vietati', () => {
    expect(exportFileName('../../segreti', 720)).toBe('segreti - 720p.mp4');
    expect(exportFileName('a:b*c?"d<e>f|g\\h/i', 720)).toBe('a b c d e f g h i - 720p.mp4');
    expect(exportFileName('riga\ndue', 720)).toBe('riga due - 720p.mp4');
  });

  it('punti e spazi in fondo non restano: Windows li toglierebbe da solo', () => {
    expect(exportFileName('Fine...  ', 720)).toBe('Fine - 720p.mp4');
  });

  it('un titolo inservibile diventa «Film»', () => {
    expect(exportFileName('???', 720)).toBe('Film - 720p.mp4');
    expect(exportFileName('...', 720)).toBe('Film - 720p.mp4');
    expect(exportFileName('CON', 720)).toBe('Film - 720p.mp4');
    expect(exportFileName('lpt1', 720)).toBe('Film - 720p.mp4');
  });

  it('un titolo lunghissimo si accorcia, e la qualità resta', () => {
    const name = exportFileName('x'.repeat(500), 480);

    expect(name.length).toBeLessThan(100);
    expect(name.endsWith(' - 480p.mp4')).toBe(true);
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
  it('dice se il disco è pieno o se il file è aperto altrove', () => {
    expect(fileErrorCode({ code: 'ENOSPC' })).toBe('disk_full');
    expect(fileErrorCode({ code: 'EPERM' })).toBe('file_in_use');
    expect(fileErrorCode({ code: 'EBUSY' })).toBe('file_in_use');
    expect(fileErrorCode({ code: 'EACCES' })).toBe('file_in_use');
  });

  it('il resto resta sconosciuto', () => {
    expect(fileErrorCode({ code: 'EIO' })).toBe('unknown');
    expect(fileErrorCode(new Error('x'))).toBe('unknown');
    expect(fileErrorCode(undefined)).toBe('unknown');
  });
});

describe('aprire una cartella', () => {
  it('usa il comando del sistema, con il percorso a parte', () => {
    expect(openFolderCommand('win32', 'C:\\a b')).toEqual(['explorer.exe', 'C:\\a b']);
    expect(openFolderCommand('darwin', '/a b')).toEqual(['open', '/a b']);
    expect(openFolderCommand('linux', '/a b')).toEqual(['xdg-open', '/a b']);
  });
});

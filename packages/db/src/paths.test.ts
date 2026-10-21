import { homedir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { databaseFile, logDir, projectsDir, resolveDataDir } from './paths.js';

describe('la cartella dei dati (§6.1)', () => {
  it('su Windows sta in APPDATA', () => {
    const dir = resolveDataDir({
      platform: 'win32',
      env: { APPDATA: 'C:\\Users\\anna\\AppData\\Roaming' },
    });

    expect(dir).toBe(path.join('C:\\Users\\anna\\AppData\\Roaming', 'Filmzy'));
  });

  it('su macOS sta in Application Support', () => {
    const dir = resolveDataDir({ platform: 'darwin', env: {} });

    expect(dir).toBe(path.join(homedir(), 'Library', 'Application Support', 'Filmzy'));
  });

  it('su Linux segue lo standard XDG, col nome in minuscolo', () => {
    expect(resolveDataDir({ platform: 'linux', env: { XDG_DATA_HOME: '/dati' } })).toBe(
      path.join('/dati', 'filmzy'),
    );
    expect(resolveDataDir({ platform: 'linux', env: {} })).toBe(
      path.join(homedir(), '.local', 'share', 'filmzy'),
    );
  });

  it('FILMZY_DATA_DIR vince su tutto: è così che girano i test e lo sviluppo', () => {
    const dir = resolveDataDir({
      platform: 'win32',
      env: { APPDATA: 'C:\\altro', FILMZY_DATA_DIR: './dati-di-prova' },
    });

    expect(dir).toBe(path.resolve('./dati-di-prova'));
  });

  it('una variabile vuota non conta come scelta', () => {
    const dir = resolveDataDir({
      platform: 'linux',
      env: { FILMZY_DATA_DIR: '  ', XDG_DATA_HOME: '/dati' },
    });

    expect(dir).toBe(path.join('/dati', 'filmzy'));
  });

  it('database, film e registro stanno nella cartella dei dati', () => {
    expect(databaseFile('/dati')).toBe(path.join('/dati', 'filmzy.db'));
    expect(projectsDir('/dati')).toBe(path.join('/dati', 'progetti'));
    expect(logDir('/dati')).toBe(path.join('/dati', 'log'));
  });
});

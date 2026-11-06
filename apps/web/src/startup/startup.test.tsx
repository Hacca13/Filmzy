import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { isDesktopApp } from '../lib/desktop';
import { StartupScreen, watchStartup, type StartupState } from './StartupGate';

const screen = (state: Exclude<StartupState, { name: 'ready' }>, problem?: string) =>
  renderToStaticMarkup(
    <StartupScreen
      state={state}
      busy={false}
      problem={problem}
      onRetry={() => undefined}
      onOpenFolder={() => undefined}
    />,
  );

describe('aspettare il server', () => {
  const down = () => Promise.reject(new Error('non risponde'));

  it('dopo aver detto che non riesce a partire continua a guardare, e se arriva si apre', async () => {
    const seen: string[] = [];
    const wait = vi
      .fn()
      .mockImplementationOnce(down)
      .mockImplementationOnce(down)
      .mockResolvedValue({ status: 'ok' });

    await watchStartup(
      (state) => seen.push(state.name),
      new AbortController().signal,
      wait as never,
    );

    expect(seen).toEqual(['unreachable', 'unreachable', 'ready']);
  });

  it('dice perché i dati non si aprono', async () => {
    const block = { reason: 'database_too_new' as const };
    const seen: StartupState[] = [];

    await watchStartup(
      (state) => seen.push(state),
      new AbortController().signal,
      vi.fn().mockResolvedValue({ status: 'blocked', block }) as never,
    );

    expect(seen).toEqual([{ name: 'blocked', block }]);
  });

  it('se la pagina si chiude smette, senza dire niente', async () => {
    const controller = new AbortController();
    const seen: string[] = [];
    const wait = vi.fn(() => {
      controller.abort();
      return down();
    });

    await watchStartup((state) => seen.push(state.name), controller.signal, wait);

    expect(seen).toEqual([]);
    expect(wait).toHaveBeenCalledTimes(1);
  });
});

describe('l’avvio', () => {
  it('mentre parte dice che sta preparando, col marchio', () => {
    const html = screen({ name: 'waiting' });

    expect(html).toContain('Sto preparando Filmzy…');
    expect(html).toContain('filmzy');
    expect(html).not.toContain('<button');
  });

  it('se il server non risponde dice cosa fare', () => {
    const html = screen({ name: 'unreachable' });

    expect(html).toContain('Filmzy non riesce a partire');
    expect(html).toContain('Chiudi il programma e riaprilo.');
  });

  it('con dati di una versione più nuova rassicura, e dice di aggiornare', () => {
    const html = screen({ name: 'blocked', block: { reason: 'database_too_new' } });

    expect(html).toContain('una versione più nuova di Filmzy');
    expect(html).toContain('Non abbiamo cambiato niente nei tuoi film.');
    expect(html).not.toContain('Riprova');
  });

  it('con un aggiornamento fallito dice dov’è la copia, e si può riprovare', () => {
    const html = screen({
      name: 'blocked',
      block: { reason: 'migration_failed', backupFile: 'C:\\dati\\filmzy.db.backup-1.0.0' },
    });

    expect(html).toContain('Non riesco ad aggiornare i tuoi dati');
    expect(html).toContain('ho rimesso la copia di prima');
    expect(html).toContain('filmzy.db.backup-1.0.0');
    expect(html).toContain('Riprova');
    expect(html).toContain('Apri la cartella');
  });

  it('senza una copia non dice di averla rimessa, e dice dove stanno i dati', () => {
    const html = screen({
      name: 'blocked',
      block: { reason: 'migration_failed', file: 'C:\\dati\\filmzy.db' },
    });

    expect(html).toContain('non ho cambiato niente');
    expect(html).not.toContain('copia di prima');
    expect(html).toContain('I tuoi dati · sola lettura');
    expect(html).toContain('filmzy.db');
  });

  it('dati che non si leggono: dice cosa controllare, e si può riprovare', () => {
    const html = screen({
      name: 'blocked',
      block: { reason: 'database_unreadable', file: 'C:\\dati\\filmzy.db' },
    });

    expect(html).toContain('Non riesco ad aprire i tuoi dati');
    expect(html).toContain('spazio');
    expect(html).toContain('Riprova');
  });

  it('se non è riuscito a rimettere la copia non dice di averlo fatto', () => {
    const html = screen({
      name: 'blocked',
      block: { reason: 'database_unreadable', backupFile: 'C:\\dati\\copia', file: 'x' },
    });

    expect(html).toContain('Non sono riuscito a rimettere la copia');
    expect(html).toContain('La copia di sicurezza · sola lettura');
  });

  it('se la cartella non si apre lo dice', () => {
    const html = screen(
      { name: 'blocked', block: { reason: 'migration_failed' } },
      'Non riesco ad aprire la cartella.',
    );

    expect(html).toContain('Non riesco ad aprire la cartella.');
  });

  it('nessuna schermata usa parole tecniche', () => {
    const texts = [
      screen({ name: 'waiting' }),
      screen({ name: 'unreachable' }),
      screen({ name: 'blocked', block: { reason: 'database_too_new' } }),
      screen({ name: 'blocked', block: { reason: 'migration_failed' } }),
      screen({ name: 'blocked', block: { reason: 'database_unreadable' } }),
    ].join(' ');

    for (const word of ['database', 'migrazione', 'server', 'schema']) {
      expect(texts.toLowerCase()).not.toContain(word);
    }
  });
});

describe('nel programma per computer', () => {
  const inDesktop = (state: Exclude<StartupState, { name: 'ready' }>) =>
    renderToStaticMarkup(
      <StartupScreen
        state={state}
        busy={false}
        problem={undefined}
        onRetry={() => undefined}
        onOpenFolder={() => undefined}
        onClose={() => undefined}
      />,
    );

  it('le schermate che fermano l’avvio si possono chiudere da un pulsante', () => {
    expect(inDesktop({ name: 'unreachable' })).toContain('>Chiudi</button>');
    expect(inDesktop({ name: 'blocked', block: { reason: 'database_too_new' } })).toContain(
      '>Chiudi</button>',
    );
    expect(inDesktop({ name: 'blocked', block: { reason: 'migration_failed' } })).toContain(
      '>Chiudi</button>',
    );
  });

  it('nel browser il pulsante non c’è: lì non chiuderebbe niente', () => {
    expect(screen({ name: 'unreachable' })).not.toContain('>Chiudi</button>');
    expect(isDesktopApp('Mozilla/5.0 Chrome/152.0 Electron/44.9.3')).toBe(true);
    expect(isDesktopApp('Mozilla/5.0 Chrome/152.0 Safari/537.36')).toBe(false);
  });
});

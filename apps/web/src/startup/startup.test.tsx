import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StartupScreen, type StartupState } from './StartupGate';

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

  it('senza una copia non dice di averla rimessa', () => {
    const html = screen({ name: 'blocked', block: { reason: 'migration_failed' } });

    expect(html).toContain('non ho cambiato niente');
    expect(html).not.toContain('copia di prima');
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
    ].join(' ');

    for (const word of ['database', 'migrazione', 'server', 'schema']) {
      expect(texts.toLowerCase()).not.toContain(word);
    }
  });
});

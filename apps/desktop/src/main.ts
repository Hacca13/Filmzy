import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { openJobCount, startServer } from '@filmzy/api/desktop';
import { LOCAL_API_HOST } from '@filmzy/contracts';
import { logDir, resolveDataDir } from '@filmzy/db';
import { app, BrowserWindow, dialog, Menu, safeStorage, shell } from 'electron';

import { CloseGuard, closeQuestion, type CloseChoice } from './close-guard.js';
import { keychainCipher } from './keychain.js';
import { linkTarget } from './links.js';
import { loadingPage } from './loading.js';
import { createFileLog, describeFailure, nestLogger } from './log.js';
import { freePort } from './port.js';

/**
 * Filmzy per computer (T6.4): una finestra, e accanto il server locale, nello stesso processo. I dati stanno
 * nella cartella dell'utente (architettura §6.1), le chiavi nel portachiavi del sistema (D45), e tutto quello
 * che succede finisce nel registro, per capire cosa è andato storto quando qualcosa si rompe.
 */

/** La porta del programma installato: un'altra da quella di sviluppo (3001), così i due possono convivere. */
const PREFERRED_PORT = 41_731;
/** Quanto si aspetta il server prima di dire che Filmzy non riesce a partire: le migrazioni possono durare. */
const SERVER_WAIT_MS = 120_000;
/** Una pagina che cade si ricarica, ma non all'infinito. */
const MAX_RELOADS = 3;
const CLOSE_CHOICES: readonly CloseChoice[] = ['wait', 'back', 'close'];

type RunningServer = Awaited<ReturnType<typeof startServer>>;

// Gli errori nel registro dicono il file e la riga del codice vero, non quelli del file unico.
process.setSourceMapsEnabled(true);
const dataDir = resolveDataDir();
// Le cartelle di Chromium (cache, impostazioni della finestra) in una sola sottocartella: i dati restano in ordine.
app.setPath('userData', path.join(dataDir, 'finestra'));
const log = createFileLog({ folder: logDir(dataDir), echo: !app.isPackaged });

let running: RunningServer | undefined;
let failed = false;

process.on('uncaughtException', (error) => {
  log.write('fatal', 'Programma', describeFailure(error));
  dialog.showErrorBox(
    'Filmzy si è fermato',
    `Un errore inatteso ha fermato Filmzy. Il motivo è scritto nel registro, nella cartella:\n${log.folder}`,
  );
  app.exit(1);
});
process.on('unhandledRejection', (reason) => {
  log.write('error', 'Programma', describeFailure(reason));
});
app.on('child-process-gone', (_event, details) => {
  log.write(
    'warn',
    'Programma',
    `Un processo della finestra (${details.type}) si è chiuso: ${details.reason}.`,
  );
});

// Un secondo Filmzy non parte: si riporta davanti la finestra del primo, che ha già i dati aperti.
if (app.requestSingleInstanceLock()) {
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window === undefined) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  start().catch((error: unknown) => {
    void failToStart(error);
  });
} else {
  app.quit();
}

app.on('window-all-closed', () => {
  app.quit();
});

let stopping = false;
app.on('will-quit', (event) => {
  if (stopping) return;
  if (running === undefined) {
    log.write('info', 'Chiusura', 'Filmzy si è chiuso.');
    return;
  }
  // Il database si chiude bene prima di uscire: i file WAL non restano a metà.
  stopping = true;
  event.preventDefault();
  running
    .close()
    .catch((error: unknown) => {
      log.write('error', 'Chiusura', describeFailure(error));
    })
    .finally(() => {
      log.write('info', 'Chiusura', 'Filmzy si è chiuso.');
      app.exit(0);
    });
});

async function start(): Promise<void> {
  await app.whenReady();
  Menu.setApplicationMenu(null);
  log.write(
    'info',
    'Avvio',
    `Filmzy ${app.getVersion()} · Electron ${process.versions.electron} · ${os.platform()} ${os.release()} ${process.arch}`,
  );

  const resources = app.isPackaged
    ? process.resourcesPath
    : path.join(app.getAppPath(), '..', 'resources');
  const shipped = {
    ffmpeg: path.join(resources, 'ffmpeg', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    font: path.join(resources, 'fonts', 'DejaVuSans.ttf'),
    sqlite: path.join(resources, 'sqlite', 'better_sqlite3.node'),
    config: path.join(resources, 'config'),
    migrations: path.join(resources, 'migrations'),
  };
  // Un'installazione a metà (un antivirus che toglie ffmpeg, per esempio) si capisce subito dal registro.
  const missing = Object.entries(shipped).filter(([, file]) => !existsSync(file));
  if (missing.length > 0) {
    log.write(
      'error',
      'Avvio',
      `Mancano dei file del programma: ${missing.map(([name]) => name).join(', ')}.`,
    );
  }
  process.env.FILMZY_APP_VERSION = app.getVersion();
  process.env.FILMZY_FFMPEG = shipped.ffmpeg;
  process.env.FILMZY_TITLE_FONT = shipped.font;

  const port = await freePort(PREFERRED_PORT, LOCAL_API_HOST);
  const base = `http://${LOCAL_API_HOST}:${String(port)}`;
  const window = openWindow(base);

  // Non si aspetta che finisca: se i dati non si aprono resta acceso in forma ridotta, e l'interfaccia dice perché.
  startServer({
    port,
    host: LOCAL_API_HOST,
    appOptions: {
      logger: nestLogger(log),
      dataDir,
      configDir: shipped.config,
      migrationsDir: shipped.migrations,
      sqliteBinding: shipped.sqlite,
      webDir: path.join(app.getAppPath(), 'web'),
      cipher: keychainCipher(safeStorage),
    },
  })
    .then((server) => {
      running = server;
      log.write('info', 'Avvio', `Pronto su ${base}.`);
    })
    .catch((error: unknown) => {
      void failToStart(error);
    });

  if (await serving(base)) {
    await window.loadURL(base).catch((error: unknown) => {
      log.write('error', 'Finestra', describeFailure(error));
    });
  } else if (!failed) {
    await failToStart(new Error('Il server non ha risposto in tempo.'));
  }
}

/** Il server risponde: anche col «no» della forma ridotta, che l'interfaccia sa spiegare. */
async function serving(base: string): Promise<boolean> {
  const deadline = Date.now() + SERVER_WAIT_MS;
  while (Date.now() < deadline && !failed) {
    try {
      await fetch(`${base}/api/health`);
      return true;
    } catch {
      // Non ascolta ancora: si riprova fra poco.
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return false;
}

async function failToStart(error: unknown): Promise<void> {
  if (failed) return;
  failed = true;
  log.write('fatal', 'Avvio', describeFailure(error));
  const { response } = await dialog.showMessageBox({
    type: 'error',
    title: 'Filmzy',
    message: 'Filmzy non riesce a partire',
    detail: `Il motivo è scritto nel registro, nella cartella:\n${log.folder}`,
    buttons: ['Apri la cartella del registro', 'Chiudi'],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
  });
  if (response === 0) await shell.openPath(log.folder);
  app.exit(1);
}

function openWindow(base: string): BrowserWindow {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'Filmzy',
    backgroundColor: '#111211',
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  window.once('ready-to-show', () => {
    window.show();
  });
  keepLinksOutside(window, base);
  watchPage(window);
  guardClosing(window);
  void window.loadURL(loadingPage());
  return window;
}

/** Nella finestra resta solo il programma: «Come ottengo la chiave?» si apre nel browser del sistema. */
function keepLinksOutside(window: BrowserWindow, base: string): void {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (linkTarget(url, base) !== 'blocked') void shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event) => {
    const target = linkTarget(event.url, base);
    if (target === 'app') return;
    event.preventDefault();
    if (target === 'browser') void shell.openExternal(event.url);
  });
}

/** Quello che succede nella pagina finisce nel registro: gli errori dell'interfaccia, e se la pagina cade. */
function watchPage(window: BrowserWindow): void {
  const contents = window.webContents;
  let reloads = 0;
  contents.on('console-message', (event) => {
    if (event.level !== 'warning' && event.level !== 'error') return;
    log.write(
      event.level === 'error' ? 'error' : 'warn',
      'Interfaccia',
      `${event.message} (${event.sourceId}:${String(event.lineNumber)})`,
    );
  });
  contents.on('render-process-gone', (_event, details) => {
    log.write(
      'error',
      'Finestra',
      `La pagina si è chiusa: ${details.reason} (${String(details.exitCode)}).`,
    );
    if (details.reason !== 'clean-exit' && reloads < MAX_RELOADS) {
      reloads += 1;
      contents.reload();
    }
  });
  contents.on('unresponsive', () => {
    log.write('warn', 'Finestra', 'La pagina non risponde.');
  });
  contents.on('did-fail-load', (_event, code, description, url) => {
    log.write('warn', 'Finestra', `Non si è caricata ${url}: ${description} (${String(code)}).`);
  });
  // F12 apre gli strumenti di Chromium: servono a capire un guasto insieme a chi lo segnala.
  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'F12') return;
    contents.toggleDevTools();
    event.preventDefault();
  });
}

/** La finestra «Sto ancora lavorando» (D63): con lavori aperti la chiusura si ferma e decide l'utente. */
function guardClosing(window: BrowserWindow): void {
  let waiting = false;
  const guard = new CloseGuard({
    openJobs: countOpenJobs,
    ask: async (count) => {
      const { message, detail } = closeQuestion(count);
      const { response } = await dialog.showMessageBox(window, {
        type: 'warning',
        title: 'Filmzy',
        message,
        detail,
        buttons: ['Aspetta che finisca', 'Torna al film', 'Chiudi lo stesso'],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      });
      return CLOSE_CHOICES[response] ?? 'back';
    },
    closeNow: () => {
      window.close();
    },
    onWaiting: (now) => {
      waiting = now;
      window.setTitle(now ? 'Filmzy · mi chiudo appena ho finito' : 'Filmzy');
      log.write('info', 'Chiusura', now ? 'Aspetto che i lavori finiscano.' : 'Non aspetto più.');
    },
  });
  window.on('close', (event) => {
    if (!guard.shouldClose()) event.preventDefault();
  });
  // Mentre aspetta, il titolo dice che si chiuderà da solo: la pagina non lo deve cambiare.
  window.on('page-title-updated', (event) => {
    if (waiting) event.preventDefault();
  });
}

function countOpenJobs(): number {
  if (running === undefined) return 0;
  try {
    return openJobCount(running);
  } catch (error) {
    // Senza sapere quanti sono non si trattiene nessuno: un programma che non si chiude è peggio (D63).
    log.write('warn', 'Chiusura', describeFailure(error));
    return 0;
  }
}

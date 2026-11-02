import { access, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createTroupeStore,
  openFilmzyDatabase,
  type OpenedDatabase,
  type TroupeStore,
} from '@filmzy/db';
import {
  createTroupe,
  FileInstructionsSource,
  MemoryReceiptSink,
  type TroupeConfig,
} from '@filmzy/troupe';
import { Logger } from '@nestjs/common';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DbConfigSource } from './db-config-source.js';
import { TroupeConfigService } from './troupe-config.service.js';

/** La cartella `config/` del repository: i file di seme veri, con le istruzioni. */
const CONFIG_DIR = fileURLToPath(new URL('../../../../../config', import.meta.url));

beforeAll(() => {
  Logger.overrideLogger(false);
});

let aperto: OpenedDatabase;
let store: TroupeStore;
let service: TroupeConfigService;

beforeEach(async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'filmzy-troupe-'));
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createTroupeStore(aperto.db);
  // `offline`: rispondono i fornitori finti, quindi non servono chiavi e non si spende (regola 5).
  service = new TroupeConfigService(store, CONFIG_DIR, 'offline', { env: process.env });
});

afterEach(() => {
  aperto.close();
});

async function esiste(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** La configurazione del seme, pubblicata: il punto di partenza di quasi tutti i test. */
async function semeImportato(): Promise<TroupeConfig> {
  const imported = await service.importFromFiles(CONFIG_DIR, { publish: true });
  if (imported.release === undefined) {
    throw new Error(`il seme non si è pubblicato: ${JSON.stringify(imported.issues)}`);
  }
  return imported.release.config;
}

describe('importare, pubblicare, ripristinare (§4.5)', () => {
  it('importa i file di seme nella bozza e, se glielo chiedi, pubblica', async () => {
    const imported = await service.importFromFiles(CONFIG_DIR, { publish: true, note: 'prima' });

    expect(imported.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
    expect(imported.draft).toBeDefined();
    expect(imported.release?.note).toBe('prima');
    expect(store.activeRelease().release?.id).toBe(imported.release?.id);
  });

  it('senza chiederlo non pubblica: resta solo la bozza', async () => {
    const imported = await service.importFromFiles(CONFIG_DIR);

    expect(imported.draft).toBeDefined();
    expect(imported.release).toBeUndefined();
    expect(store.activeRelease().release).toBeUndefined();
  });

  it('una configurazione con errori non si pubblica: resta attiva quella di prima', async () => {
    const buona = await semeImportato();
    const prima = store.activeRelease().release?.id;
    const moderator = buona.roles.moderator;
    if (moderator === undefined) throw new Error('il seme non ha il moderatore');

    // Un ruolo che punta a un servizio che non esiste: è un errore di §4.6 punto 2.
    await service.saveDraft({
      ...buona,
      roles: { ...buona.roles, moderator: { ...moderator, model: 'servizio-inventato' } },
    });
    const pubblicata = await service.publish({ note: 'rotta' });

    expect(pubblicata.release).toBeUndefined();
    expect(pubblicata.issues.some((issue) => issue.code === 'unknown_model')).toBe(true);
    expect(store.activeRelease().release?.id).toBe(prima);
  });

  it("senza bozza non c'è niente da pubblicare, e lo dice", async () => {
    const pubblicata = await service.publish();

    expect(pubblicata.release).toBeUndefined();
    expect(pubblicata.issues[0]?.code).toBe('no_draft');
  });

  it('ripristinare una release vecchia è una pubblicazione nuova', async () => {
    const prima = await semeImportato();
    const primaId = store.activeRelease().release?.id ?? '';

    await service.saveDraft({ ...prima, limits: { max_characters: 5 } });
    const seconda = await service.publish({ note: 'cinque personaggi' });
    expect(seconda.release?.config.limits.max_characters).toBe(5);

    const ripristinata = await service.restore(primaId, 'anna');

    expect(ripristinata.release?.config.limits.max_characters).toBe(2);
    expect(ripristinata.release?.note).toContain('ripristino');
    expect(service.releases()).toHaveLength(3);
  });

  it("ripristinare una release che non c'è dà un errore chiaro", async () => {
    const result = await service.restore('inventata');

    expect(result.issues[0]?.code).toBe('not_found');
  });
});

describe('primo avvio', () => {
  it('senza release pubblica da sé i file del programma', async () => {
    await service.onApplicationBootstrap();

    const attiva = store.activeRelease().release;
    expect(attiva?.author).toBe('programma');
    expect(Object.keys(attiva?.config.roles ?? {})).toContain('cinematographer');
  });

  it('agli avvii dopo non fa niente', async () => {
    await service.onApplicationBootstrap();
    const prima = store.activeRelease().release?.id;

    await service.onApplicationBootstrap();

    expect(store.activeRelease().release?.id).toBe(prima);
    expect(service.releases()).toHaveLength(1);
  });
});

describe('esportare su file (§4.5)', () => {
  it('scrive i nove file del seme in una cartella vuota', async () => {
    await semeImportato();
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-export-'));

    const result = await service.exportToFiles(dir);

    expect(result.files).toHaveLength(9);
    expect(await esiste(path.join(dir, 'ai', 'models.yaml'))).toBe(true);
    expect(await readFile(path.join(dir, 'features.yaml'), 'utf8')).toContain('max_characters: 2');
  });

  it('non sovrascrive file che esistono già, perché i commenti si perderebbero', async () => {
    await semeImportato();

    const result = await service.exportToFiles(CONFIG_DIR);

    expect(result.files).toEqual([]);
    expect(result.issues[0]?.code).toBe('files_exist');
    // I file di seme del repository sono intatti: i commenti sono ancora lì.
    expect(await readFile(path.join(CONFIG_DIR, 'features.yaml'), 'utf8')).toContain('#');
  });

  it('con il permesso esplicito sovrascrive', async () => {
    await semeImportato();
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-export-'));

    await service.exportToFiles(dir);
    const result = await service.exportToFiles(dir, { overwrite: true });

    expect(result.files).toHaveLength(9);
  });

  it('senza release attiva non esporta niente', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'filmzy-export-'));
    const result = await service.exportToFiles(dir);

    expect(result.files).toEqual([]);
    expect(result.issues[0]?.code).toBe('no_active_release');
  });
});

describe('la configurazione dal database (DbConfigSource)', () => {
  it('senza release lo dice, invece di consegnare una configurazione vuota', async () => {
    const loaded = await new DbConfigSource({ store, configDir: CONFIG_DIR }).load();

    expect(loaded.config).toBeUndefined();
    expect(loaded.issues[0]?.code).toBe('no_active_release');
  });

  it("consegna release, scelte dell'utente e adattamento d'ambiente", async () => {
    await semeImportato();
    store.saveSettings({
      enabledModelIds: ['claude-haiku'],
      defaultModels: {},
      defaultModelByConnection: {},
      spendCaps: {},
      roleSettings: {},
    });

    const loaded = await new DbConfigSource({
      store,
      configDir: CONFIG_DIR,
      environment: 'offline',
    }).load();

    expect(loaded.origin).toBe('database');
    expect(loaded.releaseId).toBe(store.activeRelease().release?.id);
    expect(loaded.settings?.enabledModelIds).toEqual(['claude-haiku']);
    // In `offline` ogni connessione passa al fornitore finto (§4.5 punto 3).
    expect(
      Object.values(loaded.config?.connections ?? {}).map((connection) => connection.adapter),
    ).not.toContain('anthropic');
  });

  it("se le scelte dell'utente non si leggono si ferma, invece di riaccendere tutto", async () => {
    await semeImportato();
    // Le scelte rovinate le prova il magazzino (`troupe-store.test.ts`): qui serve solo che la
    // sorgente, davanti a quel problema, non consegni nessuna configurazione.
    const rovinate: TroupeStore = { ...store, getSettings: () => ({ problem: 'non si leggono' }) };

    const loaded = await new DbConfigSource({ store: rovinate, configDir: CONFIG_DIR }).load();

    expect(loaded.config).toBeUndefined();
    expect(loaded.issues[0]?.code).toBe('settings_unreadable');
  });
});

describe('il criterio del task: pubblicare cambia subito il comportamento', () => {
  it('un ruolo usa il servizio della release nuova senza riavviare niente', async () => {
    const seme = await semeImportato();
    const moderator = seme.roles.moderator;
    if (moderator === undefined) throw new Error('il seme non ha il moderatore');

    const receipts = new MemoryReceiptSink();
    const troupe = createTroupe({
      configSource: new DbConfigSource({ store, configDir: CONFIG_DIR, environment: 'offline' }),
      instructions: new FileInstructionsSource(path.join(CONFIG_DIR, 'ai', 'instructions')),
      receiptSink: receipts,
    });

    const input = { text: 'Un uomo cammina sotto la pioggia.', context: 'idea', language: 'it' };
    await troupe.run('moderator', input as never, { purpose: 'draft_test' });
    expect(receipts.last()?.modelId).toBe(moderator.model);

    // Si cambia il servizio del moderatore e si pubblica: nessuno riavvia, nessuno svuota cache.
    await service.saveDraft({
      ...seme,
      roles: { ...seme.roles, moderator: { ...moderator, model: 'claude-sonnet' } },
    });
    const pubblicata = await service.publish({ note: 'moderatore su Sonnet' });
    expect(pubblicata.release).toBeDefined();

    await troupe.run('moderator', input as never, { purpose: 'draft_test' });

    expect(receipts.last()?.modelId).toBe('claude-sonnet');
    expect(receipts.last()?.releaseId).toBe(pubblicata.release?.id);
  }, 30_000);
});

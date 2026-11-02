import type { TroupeConfigData, UserSettings } from '@filmzy/contracts';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { DRAFT_ID, settings, troupeDrafts, troupeReleases, USER_SETTINGS_ID } from './schema.js';
import { tempDataDir } from './test.fixtures.js';
import { createTroupeStore, type TroupeStore } from './troupe-store.js';

/** La configurazione più piccola che lo schema accetta: qui conta il giro, non il contenuto. */
function config(maxCharacters = 2): TroupeConfigData {
  return {
    connections: {
      fake: { adapter: 'fake', api_key: 'none', timeout_s: 60, max_concurrency: 1, enabled: true },
    },
    models: {
      finto: {
        label: 'Finto',
        kind: 'llm',
        connection: 'fake',
        provider_model: 'finto-1',
        capabilities: ['structured_output'],
        pricing: { unit: 'per_mtok', input: 0, output: 0, checked: '2026-10-22' },
        status: 'active',
      },
    },
    roles: {
      moderator: {
        label: 'Moderatore',
        kind: 'llm',
        model: 'finto',
        instructions: 'moderator@1',
        retries: { invalid_output: 1, technical_error: 2 },
      },
    },
    features: {
      real_people: false,
      dialogue: false,
      dubbing: false,
      music: true,
      sound_effects: true,
      preview_gate: true,
      keyframes: true,
      image_upload: true,
      retouch: true,
      moodboard: true,
      c2pa_marking: false,
    },
    limits: { max_characters: maxCharacters },
    presets: {
      styles: [],
      cinematography: [],
      cameraMovements: [],
      characterTags: [],
      genres: [],
      tones: [],
    },
  };
}

const scelte: UserSettings = {
  enabledModelIds: ['finto'],
  defaultModels: { text: 'finto' },
  defaultModelByConnection: {},
  spendCaps: {},
  roleSettings: { moderator: { instructions: 'moderator@2' } },
};

let aperto: OpenedDatabase;
let store: TroupeStore;

beforeEach(async () => {
  aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createTroupeStore(aperto.db);
  return () => {
    aperto.close();
  };
});

describe('bozza e release (§4.5)', () => {
  it("senza niente dentro non c'è bozza né release attiva", () => {
    expect(store.getDraft()).toBeUndefined();
    expect(store.activeRelease()).toEqual({ skipped: [] });
    expect(store.listReleases()).toEqual([]);
  });

  it('la bozza è una sola: salvarla di nuovo la sostituisce', () => {
    store.saveDraft(config(2), 'rel-vecchia');
    store.saveDraft(config(5));

    expect(store.getDraft()?.config.limits.max_characters).toBe(5);
    expect(store.getDraft()?.fromReleaseId).toBeUndefined();
    expect(store.listReleases()).toEqual([]);
  });

  it('pubblicare crea una release attiva, e la successiva prende il posto della prima', () => {
    const prima = store.publish({ config: config(2), hash: 'uno', note: 'prima' });
    const seconda = store.publish({ config: config(3), hash: 'due', author: 'anna' });

    expect(store.activeRelease().release?.id).toBe(seconda.id);
    expect(store.activeRelease().release?.config.limits.max_characters).toBe(3);
    expect(store.getRelease(prima.id)?.note).toBe('prima');
    expect(store.listReleases().map((release) => release.id)).toEqual([seconda.id, prima.id]);
  });

  it('ripristinare è pubblicare di nuovo: lo storico resta lineare', () => {
    const prima = store.publish({ config: config(2), hash: 'uno' });
    store.publish({ config: config(9), hash: 'due' });

    const ripristinata = store.publish({
      config: store.getRelease(prima.id)?.config ?? config(0),
      hash: 'uno',
      note: 'ripristino della prima',
    });

    expect(store.activeRelease().release?.id).toBe(ripristinata.id);
    expect(store.activeRelease().release?.config.limits.max_characters).toBe(2);
    expect(store.listReleases()).toHaveLength(3);
  });

  it('se la release attiva è rovinata si tiene la precedente, dicendolo', () => {
    const buona = store.publish({ config: config(2), hash: 'uno' });
    const rotta = store.publish({ config: config(3), hash: 'due' });

    // Come se qualcosa avesse scritto una configurazione senza senso nella riga più recente.
    aperto.db
      .update(troupeReleases)
      .set({ config: '{"connections":{}}' })
      .where(eq(troupeReleases.id, rotta.id))
      .run();

    const attiva = store.activeRelease();
    expect(attiva.release?.id).toBe(buona.id);
    expect(attiva.skipped.map((row) => row.id)).toEqual([rotta.id]);
  });

  it('una bozza rovinata non si legge, invece di tornare mezza vuota', () => {
    store.saveDraft(config(2));
    aperto.db
      .update(troupeDrafts)
      .set({ config: '{"roles":1}' })
      .where(eq(troupeDrafts.id, DRAFT_ID))
      .run();

    expect(store.getDraft()).toBeUndefined();
  });
});

describe("le scelte dell'utente (D36)", () => {
  it('si salvano e si rileggono', () => {
    expect(store.getSettings()).toEqual({});

    store.saveSettings(scelte);
    expect(store.getSettings().settings?.enabledModelIds).toEqual(['finto']);
    expect(store.getSettings().settings?.roleSettings.moderator?.instructions).toBe('moderator@2');
  });

  it('salvarle di nuovo sostituisce le precedenti', () => {
    store.saveSettings(scelte);
    store.saveSettings({ ...scelte, enabledModelIds: [] });

    expect(store.getSettings().settings?.enabledModelIds).toEqual([]);
  });

  it('se sono rovinate lo dice: chi chiama deve fermarsi, non indovinare', () => {
    store.saveSettings(scelte);
    aperto.db
      .update(settings)
      .set({ value: '{"enabledModelIds":"tutti"}' })
      .where(eq(settings.id, USER_SETTINGS_ID))
      .run();

    expect(store.getSettings()).toEqual({
      problem: 'le scelte salvate non hanno la forma giusta',
    });
  });
});

describe('le versioni delle istruzioni (§4.4)', () => {
  const base = {
    instructionsId: 'cinematographer',
    version: 1,
    origin: 'bundled' as const,
    body: '## system\nSei il direttore della fotografia.',
    createdAt: '2026-10-22T09:00:00.000Z',
  };

  it('tiene la base e le varianti per famiglia', () => {
    store.addInstructionVersion(base);
    store.addInstructionVersion({ ...base, family: 'seedance', body: '## system\nSeedance.' });

    expect(store.listInstructionVersions('cinematographer')).toHaveLength(2);
    expect(store.getInstructionVersion('cinematographer', 1)?.family).toBeUndefined();
    expect(store.getInstructionVersion('cinematographer', 1, 'seedance')?.body).toContain(
      'Seedance',
    );
  });

  it('una versione pubblicata non si riscrive: si crea la successiva', () => {
    store.addInstructionVersion(base);

    expect(() => {
      store.addInstructionVersion({ ...base, body: '## system\nAltro testo.' });
    }).toThrow();

    store.addInstructionVersion({ ...base, version: 2, origin: 'user' });
    expect(store.getInstructionVersion('cinematographer', 2)?.origin).toBe('user');
  });

  it('elenca tutto quando non si chiede un ruolo', () => {
    store.addInstructionVersion(base);
    store.addInstructionVersion({ ...base, instructionsId: 'moderator' });

    expect(store.listInstructionVersions().map((version) => version.instructionsId)).toEqual([
      'cinematographer',
      'moderator',
    ]);
  });
});

describe('numero di pubblicazione (T2.6)', () => {
  it('ogni release ha il suo numero, che cresce da 1, e un ripristino ne prende uno nuovo', () => {
    const prima = store.publish({ config: config(2), hash: 'uno' });
    const seconda = store.publish({ config: config(3), hash: 'due' });
    const ripristino = store.publish({ config: config(2), hash: 'uno', note: 'ripristino' });

    expect([prima.number, seconda.number, ripristino.number]).toEqual([1, 2, 3]);
    expect(store.listReleases().map((release) => release.number)).toEqual([3, 2, 1]);
    expect(store.getRelease(prima.id)?.number).toBe(1);
    expect(store.activeRelease().release?.number).toBe(3);
  });
});

import { DEFAULT_APP_PREFERENCES } from '@filmzy/contracts';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { createPreferencesStore, type PreferencesStore } from './preferences-store.js';
import { APP_PREFERENCES_ID, settings, USER_SETTINGS_ID } from './schema.js';
import { tempDataDir } from './test.fixtures.js';

let aperto: OpenedDatabase;
let store: PreferencesStore;

beforeEach(async () => {
  aperto = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createPreferencesStore(aperto.db);
  return () => {
    aperto.close();
  };
});

describe("preferenze dell'app", () => {
  it('senza niente di salvato: audio spento, controllo e moderatore accesi', () => {
    expect(store.get()).toEqual({ takeAudio: false, checkForUpdates: true, moderation: true });
  });

  it('quello che si salva si rilegge, e salvare di nuovo sostituisce', () => {
    store.save({ takeAudio: true, checkForUpdates: true, moderation: true });
    store.save({ takeAudio: true, checkForUpdates: false, moderation: false });

    expect(store.get()).toEqual({ takeAudio: true, checkForUpdates: false, moderation: false });
  });

  it('le preferenze salvate prima del moderatore lo trovano acceso e tengono le altre scelte', () => {
    aperto.db
      .insert(settings)
      .values({
        id: APP_PREFERENCES_ID,
        value: JSON.stringify({ takeAudio: true, checkForUpdates: false }),
        updatedAt: 0,
      })
      .run();

    expect(store.get()).toEqual({ takeAudio: true, checkForUpdates: false, moderation: true });
  });

  it('una riga rovinata non rompe niente: si riparte dai valori di partenza', () => {
    aperto.db
      .insert(settings)
      .values({ id: APP_PREFERENCES_ID, value: '{non è json', updatedAt: 0 })
      .run();
    expect(store.get()).toEqual(DEFAULT_APP_PREFERENCES);

    aperto.db
      .update(settings)
      .set({ value: JSON.stringify({ takeAudio: 'sì' }) })
      .where(eq(settings.id, APP_PREFERENCES_ID))
      .run();
    expect(store.get()).toEqual(DEFAULT_APP_PREFERENCES);
  });

  it('sta in una riga diversa da quella delle scelte della troupe', () => {
    store.save({ takeAudio: true, checkForUpdates: true, moderation: true });

    const ids = aperto.db
      .select()
      .from(settings)
      .all()
      .map((row) => row.id);
    expect(ids).toEqual([APP_PREFERENCES_ID]);
    expect(ids).not.toContain(USER_SETTINGS_ID);
  });
});

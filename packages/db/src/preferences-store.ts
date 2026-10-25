import {
  appPreferencesSchema,
  DEFAULT_APP_PREFERENCES,
  type AppPreferences,
} from '@filmzy/contracts';
import { eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { APP_PREFERENCES_ID, settings } from './schema.js';

/**
 * Le preferenze dell'app, in una riga della tabella `settings` accanto alle scelte della troupe ma
 * separate da quelle: audio dei take (D43) e controllo degli aggiornamenti (D44).
 */
export interface PreferencesStore {
  /** Senza niente di salvato valgono i valori di partenza; una riga rovinata fa lo stesso. */
  get: () => AppPreferences;
  save: (value: AppPreferences) => void;
}

export function createPreferencesStore(
  db: FilmzyDb,
  now: () => Date = () => new Date(),
): PreferencesStore {
  return {
    get() {
      const [row] = db.select().from(settings).where(eq(settings.id, APP_PREFERENCES_ID)).all();
      if (row === undefined) return DEFAULT_APP_PREFERENCES;

      // Una preferenza non vale una schermata d'errore: se la riga non si legge si riparte dai
      // valori di partenza (audio spento, controllo acceso), che sono quelli prudenti.
      const parsed = appPreferencesSchema.safeParse(safeJson(row.value));
      return parsed.success ? parsed.data : DEFAULT_APP_PREFERENCES;
    },

    save(value) {
      const at = now().getTime();
      const row = { id: APP_PREFERENCES_ID, value: JSON.stringify(value), updatedAt: at };

      db.insert(settings)
        .values(row)
        .onConflictDoUpdate({ target: settings.id, set: { value: row.value, updatedAt: at } })
        .run();
    },
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Non è JSON: lo scarta lo schema subito dopo, qui basta non lanciare.
    return undefined;
  }
}

import type { UserSettings } from '@filmzy/contracts';

import type { ConfigIssue } from './issues.js';
import { loadConfigFiles, type TroupeConfig } from './load-files.js';

export interface LoadedConfig {
  /** Assente se la configurazione non si è potuta leggere: i problemi lo spiegano. */
  config?: TroupeConfig;
  /**
   * Le scelte dell'utente (architettura §4.3, D36). Dai file non ce ne sono: valgono come
   * attivate tutte le voci `active` o `testing` della release.
   */
  settings?: UserSettings;
  /** Da dove viene la configurazione, per i messaggi: una cartella o una release. */
  origin: string;
  issues: ConfigIssue[];
}

/**
 * Da dove arriva la configurazione alla troupe (architettura §3, §4.5): dai file (test, bench, M1)
 * o dal database (esercizio, da M2). La troupe non legge mai il database da sé.
 */
export interface ConfigSource {
  load(): Promise<LoadedConfig>;
}

/** La configurazione dai file di seme di una cartella `config/`. */
export class FileConfigSource implements ConfigSource {
  constructor(private readonly configDir: string) {}

  async load(): Promise<LoadedConfig> {
    const { config, issues } = await loadConfigFiles(this.configDir);
    return { config, issues, origin: this.configDir };
  }
}

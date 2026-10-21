import type { UserSettings } from '@filmzy/contracts';

import { applyEnvironmentOverlay, loadEnvironmentOverlay, type ConfigEnvironment } from './environments.js';
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
  /** Cosa scrivere negli scontrini per dire con quale configurazione si è lavorato (§4.11). */
  releaseId: string;
  issues: ConfigIssue[];
}

/**
 * Da dove arriva la configurazione alla troupe (architettura §3, §4.5): dai file (test, bench, M1)
 * o dal database (esercizio, da M2). La troupe non legge mai il database da sé, e riceve la
 * configurazione **già adattata all'ambiente**: l'adattamento è uno dei livelli di §4.5, quindi è
 * compito della sorgente, non di chi la usa.
 */
export interface ConfigSource {
  load(): Promise<LoadedConfig>;
}

export class FileConfigSource implements ConfigSource {
  constructor(
    private readonly configDir: string,
    private readonly environment?: ConfigEnvironment,
  ) {}

  async load(): Promise<LoadedConfig> {
    const { config, issues } = await loadConfigFiles(this.configDir);
    const base = {
      origin: this.configDir,
      releaseId: `file:${this.configDir}`,
    };

    if (config === undefined || this.environment === undefined) {
      return { ...base, config, issues };
    }

    const overlay = await loadEnvironmentOverlay(this.configDir, this.environment);
    if (overlay.overlay === undefined) {
      return { ...base, config, issues: [...issues, ...overlay.issues] };
    }

    const applied = applyEnvironmentOverlay(config, overlay.overlay);
    return {
      ...base,
      config: applied.config,
      issues: [...issues, ...overlay.issues, ...applied.issues],
    };
  }
}

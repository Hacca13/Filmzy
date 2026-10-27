import path from 'node:path';

import type { TroupeStore } from '@filmzy/db';
import {
  applyEnvironmentOverlay,
  loadEnvironmentOverlay,
  type ConfigEnvironment,
  type ConfigIssue,
  type ConfigSource,
  type LoadedConfig,
} from '@filmzy/troupe';
import type { EnvironmentFile } from '@filmzy/contracts';

/**
 * La configurazione della troupe presa dal **database** (architettura §3, §4.5): la release attiva
 * più le scelte dell'utente, adattate all'ambiente. È il pezzo che il task T2.2 aggiunge accanto a
 * `FileConfigSource`, che resta per test, bench e `pnpm troupe check`.
 *
 * Non tiene niente in memoria tra due chiamate, tranne il file dell'adattamento d'ambiente, che è
 * un file del programma e non cambia mentre gira. Per questo «pubblicare una release cambia subito
 * il comportamento», anche dei lavori già in coda: la lettura successiva vede la release nuova, e
 * non c'è nessuna cache da ricordarsi di svuotare.
 */
export interface DbConfigSourceOptions {
  store: TroupeStore;
  /** La cartella `config/` che arriva col programma: serve all'adattamento d'ambiente. */
  configDir: string;
  environment?: ConfigEnvironment;
  /**
   * Con `true` la configurazione è la **bozza**, se c'è (la prova, T2.5): serve a vedere cosa farebbe
   * una modifica prima di pubblicarla. Senza bozza vale la release attiva, come sempre.
   */
  preferDraft?: boolean;
}

export class DbConfigSource implements ConfigSource {
  private overlay: { value?: EnvironmentFile; issues: ConfigIssue[] } | undefined;

  constructor(private readonly options: DbConfigSourceOptions) {}

  async load(): Promise<LoadedConfig> {
    const { release, skipped } = this.options.store.activeRelease();
    const draft = this.options.preferDraft === true ? this.options.store.getDraft() : undefined;
    const issues: ConfigIssue[] = skipped.map((row) => ({
      severity: 'warning',
      code: 'release_unreadable',
      message: `La release ${row.id} è stata saltata: ${row.message}. Si usa la precedente.`,
      key: row.id,
    }));

    if (release === undefined && draft === undefined) {
      return {
        origin: 'database',
        releaseId: 'nessuna',
        issues: [
          ...issues,
          {
            severity: 'error',
            code: 'no_active_release',
            message:
              "Non c'è nessuna configurazione pubblicata: importa i file di seme con «pnpm troupe import config».",
          },
        ],
      };
    }

    // Gli scontrini di una prova dicono «bozza»: non è una release, e non si può confondere con una.
    const base =
      draft === undefined
        ? { origin: 'database', releaseId: release?.id ?? 'nessuna' }
        : { origin: 'bozza', releaseId: 'bozza' };
    const config = draft?.config ?? release?.config;
    if (config === undefined) return { ...base, issues };

    // Le scelte dell'utente sono un livello di §4.5: se non si leggono non si tira a indovinare,
    // perché «nessuna scelta» vuol dire «tutti i servizi attivi» e si rischia di spendere su un
    // servizio che l'utente aveva spento.
    const stored = this.options.store.getSettings();
    if (stored.problem !== undefined) {
      return {
        ...base,
        issues: [
          ...issues,
          {
            severity: 'error',
            code: 'settings_unreadable',
            message: `Le tue scelte (servizi attivati, predefiniti, tetti) non si leggono: ${stored.problem}.`,
          },
        ],
      };
    }

    const settings = stored.settings === undefined ? {} : { settings: stored.settings };
    const overlay = await this.environmentOverlay();
    issues.push(...overlay.issues);

    if (overlay.value === undefined) {
      return { ...base, config, ...settings, issues };
    }

    const applied = applyEnvironmentOverlay(config, overlay.value);
    return { ...base, config: applied.config, ...settings, issues: [...issues, ...applied.issues] };
  }

  /** L'adattamento d'ambiente si legge una volta: è un file del programma, non dell'utente. */
  private async environmentOverlay(): Promise<{
    value?: EnvironmentFile;
    issues: ConfigIssue[];
  }> {
    if (this.options.environment === undefined) return { issues: [] };
    if (this.overlay !== undefined) return this.overlay;

    const { overlay, issues } = await loadEnvironmentOverlay(
      this.options.configDir,
      this.options.environment,
    );
    this.overlay = {
      ...(overlay === undefined
        ? {}
        : { value: withAbsoluteFixtures(overlay, this.options.configDir) }),
      issues,
    };
    return this.overlay;
  }
}

/**
 * Le risposte registrate dei fornitori finti (`fixtures:`) si scrivono relative alla cartella che
 * contiene `config/`, non a quella da cui si lancia il server: con `pnpm dev` il server parte da
 * `apps/api`, e un percorso relativo non troverebbe niente.
 */
function withAbsoluteFixtures(overlay: EnvironmentFile, configDir: string): EnvironmentFile {
  if (overlay.connections === undefined) return overlay;

  const baseDir = path.dirname(configDir);
  return {
    ...overlay,
    connections: Object.fromEntries(
      Object.entries(overlay.connections).map(([key, connection]) => [
        key,
        connection.fixtures === undefined
          ? connection
          : { ...connection, fixtures: path.resolve(baseDir, connection.fixtures) },
      ]),
    ),
  };
}

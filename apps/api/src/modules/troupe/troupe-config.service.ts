import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { TroupeConfigData, TroupeDraft, TroupeRelease } from '@filmzy/contracts';
import type { TroupeStore } from '@filmzy/db';
import {
  applyEnvironmentOverlay,
  configHash,
  configToYamlFiles,
  hasErrors,
  loadConfigFiles,
  loadEnvironmentOverlay,
  validateConfig,
  validateInstructions,
  type ConfigEnvironment,
  type ConfigIssue,
  type SecretSources,
} from '@filmzy/troupe';
import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import { SECRET_SOURCES } from '../secrets/tokens.js';
import { CONFIG_DIR, TROUPE_ENVIRONMENT, TROUPE_STORE } from './tokens.js';

/**
 * La configurazione della troupe come si usa in esercizio (architettura §4.5): bozza, prova,
 * pubblicazione, ripristino, più l'importazione dai file di seme e l'esportazione su file.
 *
 * Qui sta il **giro**; la validazione la fa il validatore della troupe, lo stesso di
 * `pnpm troupe check`. Una configurazione con errori non si pubblica: la release precedente resta
 * quella attiva.
 */

export interface PublishResult {
  release?: TroupeRelease;
  issues: ConfigIssue[];
}

export interface ImportResult extends PublishResult {
  draft?: TroupeDraft;
}

@Injectable()
export class TroupeConfigService implements OnApplicationBootstrap {
  private readonly log = new Logger('Troupe');

  constructor(
    @Inject(TROUPE_STORE) private readonly store: TroupeStore,
    @Inject(CONFIG_DIR) private readonly configDir: string,
    @Inject(TROUPE_ENVIRONMENT) private readonly environment: ConfigEnvironment | undefined,
    @Inject(SECRET_SOURCES) private readonly secrets: SecretSources,
  ) {}

  /**
   * Primo avvio: senza nessuna release pubblicata il programma non saprebbe chi fa cosa, quindi si
   * importano i file di seme che arrivano con l'installazione e si pubblicano. Dall'avvio dopo
   * questo passo non fa niente.
   */
  async onApplicationBootstrap(): Promise<void> {
    const { release } = this.store.activeRelease();
    if (release !== undefined) return;

    const imported = await this.importFromFiles(this.configDir, {
      publish: true,
      note: 'configurazione iniziale, dai file del programma',
      author: 'programma',
    });

    if (imported.release === undefined) {
      this.log.error(
        `Non riesco a pubblicare la configurazione iniziale: ${describe(imported.issues)}`,
      );
      return;
    }
    this.log.log(`Configurazione iniziale pubblicata (release ${imported.release.id}).`);
  }

  draft(): TroupeDraft | undefined {
    return this.store.getDraft();
  }

  /** La bozza si salva anche con problemi: è una copia di lavoro, non la verità (§4.5 punto 1). */
  async saveDraft(config: TroupeConfigData, fromReleaseId?: string): Promise<ImportResult> {
    const issues = await this.validate(config);
    const draft = this.store.saveDraft(config, fromReleaseId);
    return { draft, issues };
  }

  /** Pubblica la bozza. Con errori non si pubblica niente e resta attiva quella di prima. */
  async publish(options: { note?: string; author?: string } = {}): Promise<PublishResult> {
    const draft = this.store.getDraft();
    if (draft === undefined) {
      return {
        issues: [
          {
            severity: 'error',
            code: 'no_draft',
            message: "Non c'è nessuna bozza da pubblicare.",
          },
        ],
      };
    }

    return this.publishConfig(draft.config, options);
  }

  /** Ripristinare è pubblicare di nuovo una release vecchia, così lo storico resta lineare. */
  async restore(releaseId: string, author?: string): Promise<PublishResult> {
    const release = this.store.getRelease(releaseId);
    if (release === undefined) {
      return {
        issues: [
          {
            severity: 'error',
            code: 'not_found',
            message: `La release "${releaseId}" non c'è.`,
            key: releaseId,
          },
        ],
      };
    }

    return this.publishConfig(release.config, {
      note: `ripristino della release ${releaseId}`,
      ...(author === undefined ? {} : { author }),
    });
  }

  /** Dai file di seme alla bozza (§4.5). Con `publish` la pubblica anche, se non ha errori. */
  async importFromFiles(
    dir: string,
    options: { publish?: boolean; note?: string; author?: string } = {},
  ): Promise<ImportResult> {
    const { config, issues } = await loadConfigFiles(dir);
    if (config === undefined) return { issues };

    const checked = [...issues, ...(await this.validate(config))];
    const draft = this.store.saveDraft(config);

    if (options.publish !== true || hasErrors(checked)) return { draft, issues: checked };

    const published = this.store.publish({
      config,
      hash: configHash(config),
      ...(options.note === undefined ? {} : { note: options.note }),
      ...(options.author === undefined ? {} : { author: options.author }),
    });

    return { draft, release: published, issues: checked };
  }

  /**
   * La release attiva sui file, da tenere in git come copia e come storia (§4.5).
   *
   * Scrive i **dati**, non i commenti: i file di seme del repository sono pieni di spiegazioni che
   * un giro dentro un oggetto JSON non può conservare. Perciò se nella cartella ci sono già dei
   * file non si sovrascrive niente senza che l'abbia chiesto chi lancia il comando.
   */
  async exportToFiles(
    dir: string,
    options: { overwrite?: boolean } = {},
  ): Promise<{ files: string[]; issues: ConfigIssue[] }> {
    const { release, skipped } = this.store.activeRelease();
    if (release === undefined) {
      return {
        files: [],
        issues: [
          {
            severity: 'error',
            code: 'no_active_release',
            message: "Non c'è nessuna release pubblicata da esportare.",
          },
          ...skipped.map((row) => unreadable(row.id, row.message)),
        ],
      };
    }

    const files = configToYamlFiles(release.config);
    const issues = skipped.map((row) => unreadable(row.id, row.message));

    if (options.overwrite !== true) {
      const existing = await Promise.all(
        files.map(async ({ file }) => ((await exists(path.join(dir, file))) ? file : undefined)),
      );
      const found = existing.filter((file): file is string => file !== undefined);

      if (found.length > 0) {
        return {
          files: [],
          issues: [
            ...issues,
            {
              severity: 'error',
              code: 'files_exist',
              message: `In ${dir} ci sono già ${String(found.length)} file di configurazione (${found.join(', ')}). Esportando si perdono i commenti che spiegano le scelte: se è quello che vuoi, chiedilo esplicitamente.`,
            },
          ],
        };
      }
    }

    await Promise.all(
      files.map(async ({ file, text }) => {
        const destination = path.join(dir, file);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, text, 'utf8');
      }),
    );

    return { files: files.map(({ file }) => file), issues };
  }

  releases(limit?: number): TroupeRelease[] {
    return this.store.listReleases(limit);
  }

  private async publishConfig(
    config: TroupeConfigData,
    options: { note?: string; author?: string },
  ): Promise<PublishResult> {
    const issues = await this.validate(config);
    if (hasErrors(issues)) return { issues };

    const release = this.store.publish({
      config,
      hash: configHash(config),
      ...(options.note === undefined ? {} : { note: options.note }),
      ...(options.author === undefined ? {} : { author: options.author }),
    });

    this.log.log(`Release ${release.id} pubblicata e attiva.`);
    return { release, issues };
  }

  /**
   * Lo stesso controllo di `pnpm troupe check`: configurazione e istruzioni (§4.6), sulla
   * configurazione **adattata all'ambiente**. L'adattamento è un livello di §4.5 e non si pubblica
   * (lo applica la sorgente a ogni lettura): serve solo a controllare quello che girerà davvero —
   * con `offline`, per esempio, le chiavi non servono perché rispondono i fornitori finti.
   */
  private async validate(config: TroupeConfigData): Promise<ConfigIssue[]> {
    const effective = await this.withEnvironment(config);

    return [
      ...effective.issues,
      ...validateConfig(effective.config, {
        ...(this.environment === undefined ? {} : { environment: this.environment }),
        secrets: this.secrets,
      }),
      ...(await validateInstructions(
        effective.config,
        path.join(this.configDir, 'ai', 'instructions'),
      )),
    ];
  }

  private async withEnvironment(
    config: TroupeConfigData,
  ): Promise<{ config: TroupeConfigData; issues: ConfigIssue[] }> {
    if (this.environment === undefined) return { config, issues: [] };

    const { overlay, issues } = await loadEnvironmentOverlay(this.configDir, this.environment);
    if (overlay === undefined) return { config, issues };

    const applied = applyEnvironmentOverlay(config, overlay);
    return { config: applied.config, issues: [...issues, ...applied.issues] };
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    // Non esiste (o non si legge): per noi è la stessa cosa, si può scrivere.
    return false;
  }
}

function unreadable(id: string, message: string): ConfigIssue {
  return {
    severity: 'warning',
    code: 'release_unreadable',
    message: `La release ${id} è stata saltata: ${message}.`,
    key: id,
  };
}

function describe(issues: readonly ConfigIssue[]): string {
  return issues
    .filter((issue) => issue.severity === 'error')
    .map((issue) => issue.message)
    .join(' ');
}

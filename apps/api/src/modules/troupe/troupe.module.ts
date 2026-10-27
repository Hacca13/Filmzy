import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  createReceiptStore,
  createTroupeStore,
  type OpenedDatabase,
  type ReceiptStore,
  type TroupeStore,
} from '@filmzy/db';
import {
  configEnvironmentFromEnv,
  createTroupe,
  FileInstructionsSource,
  type ConfigEnvironment,
  type ConfigSource,
  type InstructionsSource,
  type SecretSources,
  type Troupe,
} from '@filmzy/troupe';
import { Module, type DynamicModule } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { DbInstructionsSource } from '../instructions/db-instructions-source.js';
import { INSTRUCTIONS_SOURCE } from '../instructions/tokens.js';
import { SECRET_SOURCES } from '../secrets/tokens.js';
import { SpendLedger } from '../spend/spend-ledger.js';
import { DbConfigSource } from './db-config-source.js';
import { DraftTestController } from './draft-test.controller.js';
import { DraftTestService } from './draft-test.service.js';
import {
  CONFIG_DIR,
  CONFIG_SOURCE,
  DRAFT_TROUPE,
  RECEIPT_STORE,
  SPEND_LEDGER,
  TROUPE,
  TROUPE_ENVIRONMENT,
  TROUPE_STORE,
} from './tokens.js';
import { TroupeConfigController } from './troupe-config.controller.js';
import { TroupeConfigService } from './troupe-config.service.js';
import { UserSettingsService } from './user-settings.service.js';

/**
 * La cartella `config/` che arriva col programma. Si risale dal file, non dalla cartella da cui
 * si lancia il server: con `pnpm dev` il server parte da `apps/api`, e lì `config/` non c'è.
 * Il programma impacchettato (M6) la passa da sé; `FILMZY_CONFIG_DIR` serve a chi la sposta.
 */
function defaultConfigDir(env: Record<string, string | undefined>): string {
  const chosen = env.FILMZY_CONFIG_DIR?.trim();
  if (chosen !== undefined && chosen !== '') return path.resolve(chosen);
  return fileURLToPath(new URL('../../../../../config', import.meta.url));
}

/**
 * La troupe dentro il server (architettura §3, §4.5): la configurazione arriva dal database e le
 * istruzioni dai file che arrivano col programma. È il modulo che tiene insieme i pezzi; la troupe
 * resta ignara del database, come vuole il confine.
 */
export interface TroupeModuleOptions {
  /** La cartella `config/` del programma: adattamenti d'ambiente, istruzioni, file di seme. */
  configDir?: string;
  environment?: ConfigEnvironment;
}

@Module({})
export class TroupeModule {
  static forRoot(options: TroupeModuleOptions = {}): DynamicModule {
    const configDir = options.configDir ?? defaultConfigDir(process.env);
    const environment = options.environment ?? configEnvironmentFromEnv(process.env);
    const configSourceOver = (store: TroupeStore, preferDraft: boolean): ConfigSource =>
      new DbConfigSource({
        store,
        configDir,
        preferDraft,
        ...(environment === undefined ? {} : { environment }),
      });

    return {
      module: TroupeModule,
      global: true,
      controllers: [TroupeConfigController, DraftTestController],
      providers: [
        { provide: CONFIG_DIR, useValue: configDir },
        { provide: TROUPE_ENVIRONMENT, useValue: environment },
        {
          provide: TROUPE_STORE,
          useFactory: (opened: OpenedDatabase): TroupeStore => createTroupeStore(opened.db),
          inject: [OPENED_DATABASE],
        },
        {
          provide: RECEIPT_STORE,
          useFactory: (opened: OpenedDatabase): ReceiptStore => createReceiptStore(opened.db),
          inject: [OPENED_DATABASE],
        },
        {
          provide: CONFIG_SOURCE,
          useFactory: (store: TroupeStore): ConfigSource => configSourceOver(store, false),
          inject: [TROUPE_STORE],
        },
        {
          // Il registro della spesa: la troupe lo interroga prima di ogni chiamata (T3.1, D30).
          provide: SPEND_LEDGER,
          useFactory: (receipts: ReceiptStore, configSource: ConfigSource): SpendLedger =>
            new SpendLedger({ receipts, configSource }),
          inject: [RECEIPT_STORE, CONFIG_SOURCE],
        },
        {
          // Le istruzioni del programma, lette dai file, più quelle dell'utente, dal database.
          provide: INSTRUCTIONS_SOURCE,
          useFactory: (store: TroupeStore): InstructionsSource =>
            new DbInstructionsSource(
              new FileInstructionsSource(path.join(configDir, 'ai', 'instructions')),
              store,
            ),
          inject: [TROUPE_STORE],
        },
        {
          provide: TROUPE,
          useFactory: (
            configSource: ConfigSource,
            instructions: InstructionsSource,
            secrets: SecretSources,
            receiptSink: ReceiptStore,
            spend: SpendLedger,
          ): Troupe => createTroupe({ configSource, instructions, secrets, receiptSink, spend }),
          inject: [CONFIG_SOURCE, INSTRUCTIONS_SOURCE, SECRET_SOURCES, RECEIPT_STORE, SPEND_LEDGER],
        },
        {
          // Stessa troupe, stesse chiavi e stessi scontrini, ma la configurazione è la bozza.
          provide: DRAFT_TROUPE,
          useFactory: (
            store: TroupeStore,
            instructions: InstructionsSource,
            secrets: SecretSources,
            receiptSink: ReceiptStore,
            spend: SpendLedger,
          ): Troupe =>
            createTroupe({
              configSource: configSourceOver(store, true),
              instructions,
              secrets,
              receiptSink,
              spend,
            }),
          inject: [TROUPE_STORE, INSTRUCTIONS_SOURCE, SECRET_SOURCES, RECEIPT_STORE, SPEND_LEDGER],
        },
        TroupeConfigService,
        UserSettingsService,
        DraftTestService,
      ],
      exports: [
        TROUPE,
        INSTRUCTIONS_SOURCE,
        CONFIG_SOURCE,
        TROUPE_STORE,
        RECEIPT_STORE,
        SPEND_LEDGER,
        CONFIG_DIR,
        TROUPE_ENVIRONMENT,
        TroupeConfigService,
        UserSettingsService,
      ],
    };
  }
}

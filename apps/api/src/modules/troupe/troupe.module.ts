import path from 'node:path';
import process from 'node:process';

import { createTroupeStore, type OpenedDatabase, type TroupeStore } from '@filmzy/db';
import {
  configEnvironmentFromEnv,
  createTroupe,
  FileInstructionsSource,
  type ConfigEnvironment,
  type ConfigSource,
  type Troupe,
} from '@filmzy/troupe';
import { Module, type DynamicModule } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { DbConfigSource } from './db-config-source.js';
import { CONFIG_DIR, CONFIG_SOURCE, TROUPE, TROUPE_ENVIRONMENT, TROUPE_STORE } from './tokens.js';
import { TroupeConfigService } from './troupe-config.service.js';

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
    const configDir = options.configDir ?? path.resolve('config');
    const environment = options.environment ?? configEnvironmentFromEnv(process.env);

    return {
      module: TroupeModule,
      global: true,
      providers: [
        { provide: CONFIG_DIR, useValue: configDir },
        { provide: TROUPE_ENVIRONMENT, useValue: environment },
        {
          provide: TROUPE_STORE,
          useFactory: (opened: OpenedDatabase): TroupeStore => createTroupeStore(opened.db),
          inject: [OPENED_DATABASE],
        },
        {
          provide: CONFIG_SOURCE,
          useFactory: (store: TroupeStore): ConfigSource =>
            new DbConfigSource({
              store,
              configDir,
              ...(environment === undefined ? {} : { environment }),
            }),
          inject: [TROUPE_STORE],
        },
        {
          provide: TROUPE,
          useFactory: (configSource: ConfigSource): Troupe =>
            createTroupe({
              configSource,
              instructions: new FileInstructionsSource(path.join(configDir, 'ai', 'instructions')),
            }),
          inject: [CONFIG_SOURCE],
        },
        TroupeConfigService,
      ],
      exports: [
        TROUPE,
        CONFIG_SOURCE,
        TROUPE_STORE,
        CONFIG_DIR,
        TROUPE_ENVIRONMENT,
        TroupeConfigService,
      ],
    };
  }
}

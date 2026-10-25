import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { createTroupeStore, type OpenedDatabase, type TroupeStore } from '@filmzy/db';
import {
  configEnvironmentFromEnv,
  createTroupe,
  FileInstructionsSource,
  type ConfigEnvironment,
  type ConfigSource,
  type SecretSources,
  type Troupe,
} from '@filmzy/troupe';
import { Module, type DynamicModule } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { SECRET_SOURCES } from '../secrets/tokens.js';
import { DbConfigSource } from './db-config-source.js';
import { CONFIG_DIR, CONFIG_SOURCE, TROUPE, TROUPE_ENVIRONMENT, TROUPE_STORE } from './tokens.js';
import { TroupeConfigController } from './troupe-config.controller.js';
import { TroupeConfigService } from './troupe-config.service.js';

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

    return {
      module: TroupeModule,
      global: true,
      controllers: [TroupeConfigController],
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
          useFactory: (configSource: ConfigSource, secrets: SecretSources): Troupe =>
            createTroupe({
              configSource,
              instructions: new FileInstructionsSource(path.join(configDir, 'ai', 'instructions')),
              secrets,
            }),
          inject: [CONFIG_SOURCE, SECRET_SOURCES],
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

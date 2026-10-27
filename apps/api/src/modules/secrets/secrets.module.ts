import process from 'node:process';

import { secretsFile } from '@filmzy/db';
import type { SecretSources } from '@filmzy/troupe';
import { Module, type DynamicModule } from '@nestjs/common';

import { DATA_DIR } from '../database/database.module.js';
import { FileSecretStore } from './file-secret-store.js';
import { SecretsController } from './secrets.controller.js';
import { SecretsService } from './secrets.service.js';
import { unavailableCipher, type SecretCipher } from './secret-cipher.js';
import { SECRET_CIPHER, SECRET_SOURCES, SECRET_STORE } from './tokens.js';

export interface SecretsModuleOptions {
  /** Il portachiavi del sistema: arriva con Electron (M6, D45). Senza, le chiavi non si salvano. */
  cipher?: SecretCipher;
}

@Module({})
export class SecretsModule {
  static forRoot(options: SecretsModuleOptions = {}): DynamicModule {
    return {
      module: SecretsModule,
      // Globale, come il database: lo usano la troupe e le rotte delle chiavi.
      global: true,
      controllers: [SecretsController],
      providers: [
        { provide: SECRET_CIPHER, useValue: options.cipher ?? unavailableCipher },
        {
          provide: SECRET_STORE,
          useFactory: (dataDir: string, cipher: SecretCipher) =>
            new FileSecretStore(secretsFile(dataDir), cipher),
          inject: [DATA_DIR, SECRET_CIPHER],
        },
        {
          provide: SECRET_SOURCES,
          useFactory: (keychain: FileSecretStore): SecretSources => ({
            env: process.env,
            keychain,
          }),
          inject: [SECRET_STORE],
        },
        SecretsService,
      ],
      exports: [SECRET_STORE, SECRET_SOURCES, SecretsService],
    };
  }
}

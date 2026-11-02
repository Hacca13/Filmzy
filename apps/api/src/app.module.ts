import { Module, type DynamicModule } from '@nestjs/common';
import type { ConfigEnvironment } from '@filmzy/troupe';

import { CastModule } from './modules/cast/cast.module.js';
import { ConnectionsModule } from './modules/connections/connections.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { InstructionsModule } from './modules/instructions/instructions.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { PreferencesModule } from './modules/preferences/preferences.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import type { SecretCipher } from './modules/secrets/secret-cipher.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { ScreenplayModule } from './modules/screenplay/screenplay.module.js';
import { SecretsModule } from './modules/secrets/secrets.module.js';
import { SpendModule } from './modules/spend/spend.module.js';
import { TroupeModule } from './modules/troupe/troupe.module.js';
import { UpdatesModule, type UpdateChecker } from './modules/updates/updates.module.js';

/**
 * Quello che chi avvia il server può scegliere (il programma impacchettato in M6, i test adesso):
 * dove stanno i dati e la configurazione, come si cifrano le chiavi, chi controlla gli
 * aggiornamenti. Senza niente valgono le scelte di sempre (cartella dati dell'utente, `config/`).
 */
export interface AppModuleOptions {
  dataDir?: string;
  configDir?: string;
  environment?: ConfigEnvironment;
  cipher?: SecretCipher;
  updateChecker?: UpdateChecker;
}

/** Radice del server locale: un modulo per dominio (CLAUDE.md), qui si elencano. */
@Module({})
export class AppModule {
  static register(options: AppModuleOptions = {}): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.forRoot(options.dataDir === undefined ? {} : { dataDir: options.dataDir }),
        SecretsModule.forRoot(options.cipher === undefined ? {} : { cipher: options.cipher }),
        TroupeModule.forRoot({
          ...(options.configDir === undefined ? {} : { configDir: options.configDir }),
          ...(options.environment === undefined ? {} : { environment: options.environment }),
        }),
        CastModule,
        ConnectionsModule,
        InstructionsModule,
        PreferencesModule,
        ProjectsModule,
        RolesModule,
        ScreenplayModule,
        SpendModule,
        UpdatesModule.forRoot(
          options.updateChecker === undefined ? {} : { checker: options.updateChecker },
        ),
        HealthModule,
        JobsModule,
      ],
    };
  }
}

import { Module } from '@nestjs/common';

import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { SecretsModule } from './modules/secrets/secrets.module.js';
import { TroupeModule } from './modules/troupe/troupe.module.js';

/** Radice del server locale: un modulo per dominio (CLAUDE.md), qui si elencano. */
@Module({
  imports: [
    DatabaseModule.forRoot(),
    SecretsModule.forRoot(),
    TroupeModule.forRoot(),
    HealthModule,
    JobsModule,
  ],
})
export class AppModule {}

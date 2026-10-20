import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';

/** Radice del server locale: un modulo per dominio (CLAUDE.md), qui si elencano. */
@Module({
  imports: [HealthModule],
})
export class AppModule {}

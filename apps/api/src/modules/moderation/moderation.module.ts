import { Module } from '@nestjs/common';

import { PreferencesModule } from '../preferences/preferences.module.js';
import { ModerationService } from './moderation.service.js';

/** Il moderatore dei testi (T3.3): nessuna rotta, lo usano i moduli che mandano testi a un servizio a pagamento. */
@Module({
  imports: [PreferencesModule],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}

import { appPreferencesSchema, type AppPreferences } from '@filmzy/contracts';
import { createPreferencesStore, type OpenedDatabase, type PreferencesStore } from '@filmzy/db';
import { Body, Controller, Get, Inject, Module, Put } from '@nestjs/common';

import { parseBody } from '../../http/parse-body.js';
import { OPENED_DATABASE } from '../database/database.module.js';

const PREFERENCES_STORE = Symbol('PREFERENCES_STORE');

/** Le preferenze dell'app: audio dei take (D43) e controllo degli aggiornamenti (D44). */
@Controller('preferences')
class PreferencesController {
  constructor(@Inject(PREFERENCES_STORE) private readonly store: PreferencesStore) {}

  @Get()
  get(): AppPreferences {
    return this.store.get();
  }

  @Put()
  put(@Body() body: unknown): AppPreferences {
    const preferences = parseBody(appPreferencesSchema, body);
    this.store.save(preferences);
    return preferences;
  }
}

@Module({
  controllers: [PreferencesController],
  providers: [
    {
      provide: PREFERENCES_STORE,
      useFactory: (opened: OpenedDatabase): PreferencesStore => createPreferencesStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
})
export class PreferencesModule {}

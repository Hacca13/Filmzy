import { createMoodboardStore, type MoodboardStore, type OpenedDatabase } from '@filmzy/db';
import { Module } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { MOODBOARD_STORE } from './tokens.js';

/**
 * Solo l'archivio del moodboard: lo importano i moduli che lo leggono (la Bibbia) senza dover
 * importare chi lo costruisce, che a sua volta dipende da loro.
 */
@Module({
  providers: [
    {
      provide: MOODBOARD_STORE,
      useFactory: (opened: OpenedDatabase): MoodboardStore => createMoodboardStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [MOODBOARD_STORE],
})
export class MoodboardStoreModule {}

import { createAudioStore, type AudioStore, type OpenedDatabase } from '@filmzy/db';
import { Module } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { AUDIO_STORE } from './tokens.js';

/**
 * Solo l'archivio delle tracce audio: lo importano le inquadrature, che devono sapere se c'è un effetto
 * agganciato, senza dover importare chi genera il suono, che a sua volta dipende da loro.
 */
@Module({
  providers: [
    {
      provide: AUDIO_STORE,
      useFactory: (opened: OpenedDatabase): AudioStore => createAudioStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [AUDIO_STORE],
})
export class AudioStoreModule {}

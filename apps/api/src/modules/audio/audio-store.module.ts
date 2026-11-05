import {
  createAudioStore,
  createSceneChoiceStore,
  type AudioStore,
  type OpenedDatabase,
  type SceneChoiceStore,
} from '@filmzy/db';
import { Module } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { AUDIO_STORE, SCENE_CHOICES } from './tokens.js';

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
    {
      provide: SCENE_CHOICES,
      useFactory: (opened: OpenedDatabase): SceneChoiceStore => createSceneChoiceStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [AUDIO_STORE, SCENE_CHOICES],
})
export class AudioStoreModule {}

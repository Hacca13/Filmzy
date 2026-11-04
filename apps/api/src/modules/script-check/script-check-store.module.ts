import { createScriptCheckStore, type OpenedDatabase, type ScriptCheckStore } from '@filmzy/db';
import { Module } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { SCRIPT_CHECK_STORE } from './tokens.js';

/**
 * Solo l'archivio del controllo della storia: lo importano i moduli che lo leggono (le inquadrature)
 * senza dover importare chi lo costruisce, che a sua volta dipende da loro.
 */
@Module({
  providers: [
    {
      provide: SCRIPT_CHECK_STORE,
      useFactory: (opened: OpenedDatabase): ScriptCheckStore => createScriptCheckStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [SCRIPT_CHECK_STORE],
})
export class ScriptCheckStoreModule {}

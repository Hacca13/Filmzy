import { createUploadStore, type OpenedDatabase, type UploadStore } from '@filmzy/db';
import { Module } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { UPLOAD_STORE } from './tokens.js';

/**
 * Solo l'archivio delle immagini caricate: lo importano i moduli che le mostrano (luoghi,
 * inquadrature) senza dover importare chi le riceve, che a sua volta dipende da loro.
 */
@Module({
  providers: [
    {
      provide: UPLOAD_STORE,
      useFactory: (opened: OpenedDatabase): UploadStore => createUploadStore(opened.db),
      inject: [OPENED_DATABASE],
    },
  ],
  exports: [UPLOAD_STORE],
})
export class UploadStoreModule {}

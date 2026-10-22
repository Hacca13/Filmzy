import { Module } from '@nestjs/common';

import { JobRunner } from './job-runner.service.js';

/**
 * La coda e il suo esecutore. I moduli di dominio (immagini, video, suoni, esportazione) si
 * registrano qui con `JobRunner.register`, così la coda non conosce nessun dominio.
 */
@Module({
  providers: [JobRunner],
  exports: [JobRunner],
})
export class JobsModule {}

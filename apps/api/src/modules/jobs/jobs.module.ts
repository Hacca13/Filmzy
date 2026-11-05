import { JOB_INTERRUPTED } from '@filmzy/contracts';
import { createReceiptStore, type OpenedDatabase } from '@filmzy/db';
import { Inject, Injectable, Module, type OnModuleInit } from '@nestjs/common';

import { OPENED_DATABASE } from '../database/database.module.js';
import { EventsModule } from '../events/events.module.js';
import { JobRunner } from './job-runner.service.js';

/**
 * All'avvio nessuna chiamata a un fornitore è in corso: uno scontrino aperto si è interrotto, e nessuno lo
 * chiuderà più. Resterebbe contato alla stima per sempre, anche con un lavoro mai partito (D84).
 */
@Injectable()
class OpenReceiptsAtStart implements OnModuleInit {
  constructor(
    @Inject(OPENED_DATABASE) private readonly opened: OpenedDatabase,
    private readonly runner: JobRunner,
  ) {}

  onModuleInit(): void {
    const receipts = createReceiptStore(this.opened.db);
    this.runner.atStart(() => {
      receipts.closeUnfinished(JOB_INTERRUPTED);
    });
  }
}

/**
 * La coda e il suo esecutore. I moduli di dominio (immagini, video, suoni, esportazione) si
 * registrano qui con `JobRunner.register`, così la coda non conosce nessun dominio.
 */
@Module({
  imports: [EventsModule],
  providers: [JobRunner, OpenReceiptsAtStart],
  exports: [JobRunner],
})
export class JobsModule {}
